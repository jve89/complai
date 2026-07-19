import "server-only";

import type Stripe from "stripe";
import type { Company } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { stripe, tierForPriceId, isStripeResourceMissing } from "@/lib/stripe";
import { env } from "@/lib/env";

/** Statuses that keep a subscription's documents unlocked (grace during dunning). */
const GRANTING_STATUSES = new Set(["active", "trialing", "past_due"]);

/** ComplAI staff companies are exempt from Stripe plan reconciliation, so a
 * manually-set staff pakket (e.g. Audit-klaar for ourselves) is never
 * overwritten by a webhook. */
export async function isStaffCompany(companyId: string): Promise<boolean> {
  // superAdmin flag is authoritative; the env allowlist is the bootstrap path and
  // is NOT persisted as superAdmin=true, so match it too — case-INSENSITIVELY,
  // because User.email is stored verbatim from the form while env.superAdminEmails
  // is force-lowercased. A DB `email: { in: [...] }` is case-sensitive in Postgres
  // and would miss e.g. "Johan@Gmail.com", wrongly downgrading a staff pakket.
  const allow = new Set(env.superAdminEmails); // already lowercased in lib/env
  const users = await prisma.user.findMany({
    where: { companyId },
    select: { superAdmin: true, email: true },
  });
  return users.some(
    (u) => u.superAdmin || allow.has(u.email.trim().toLowerCase())
  );
}

/**
 * Find-or-create the Stripe customer for a company and persist its id.
 *
 * Self-heals a stored customer that no longer exists for the current key — e.g. a
 * test-mode `cus_…` left behind after switching prod to live keys, which Stripe
 * rejects ("No such customer … exists in test mode"). In that case we create a
 * fresh customer AND drop the now-dead subscription linkage (a dead customer's
 * subscription is dead too). `recreated` lets checkout skip the "already
 * subscribed" guard for a company whose old subscription just vanished.
 */
export async function ensureStripeCustomer(
  company: Pick<Company, "id" | "name" | "stripeCustomerId">,
  email?: string | null
): Promise<{ customerId: string; recreated: boolean }> {
  if (!stripe) throw new Error("Stripe is niet geconfigureerd.");

  if (company.stripeCustomerId) {
    try {
      const existing = await stripe.customers.retrieve(company.stripeCustomerId);
      if (!existing.deleted) return { customerId: company.stripeCustomerId, recreated: false };
      // Customer was deleted in Stripe → fall through and recreate.
    } catch (err) {
      // Only a "missing for this key" error means we should recreate; a transient
      // or auth error must surface, not silently mint a duplicate customer.
      if (!isStripeResourceMissing(err)) throw err;
    }
  }

  // Only relevant when replacing a stale stored id (recreate). Staff pakketten
  // are exempt from reconciliation, so we never downgrade them here.
  const staff = company.stripeCustomerId ? await isStaffCompany(company.id) : false;

  const customer = await stripe.customers.create(
    {
      email: email ?? undefined,
      name: company.name,
      metadata: { companyId: company.id },
    },
    // Collapse concurrent creates for the same company (e.g. two checkout tabs
    // during the go-live window) onto ONE customer, so we never orphan a
    // customer that then bills invisibly. Keyed on the stale id too, so a genuine
    // later recreate (id changed) isn't served this cached response.
    { idempotencyKey: `cust-create-${company.id}-${company.stripeCustomerId ?? "new"}` }
  );
  await prisma.company.update({
    where: { id: company.id },
    data: {
      stripeCustomerId: customer.id,
      // Replacing a dead customer: its subscription/state is dead too, so drop
      // the linkage AND the paid tier that subscription granted — otherwise the
      // company keeps paid document access with no live payment. Staff are exempt.
      // (A brand-new company has nothing here, so this is a no-op for signups.)
      stripeSubscriptionId: null,
      planStatus: null,
      planRenewsAt: null,
      ...(company.stripeCustomerId && !staff ? { plan: "gratis" } : {}),
    },
  });
  // recreated = we replaced a stale stored id (not a first-time signup).
  return { customerId: customer.id, recreated: Boolean(company.stripeCustomerId) };
}

function periodEnd(sub: Stripe.Subscription): Date | null {
  // `current_period_end` sits on the subscription in older API versions and on
  // the item in newer ones — read defensively so we don't break across versions.
  const raw =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    (sub.items?.data?.[0] as unknown as { current_period_end?: number } | undefined)
      ?.current_period_end;
  return raw ? new Date(raw * 1000) : null;
}

export interface SubscriptionSync {
  companyId: string;
  tier: string | null;
  status: string;
  renewsAt: Date | null;
}

/** Resolve the company that owns a Stripe customer. */
export async function companyForCustomer(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
): Promise<{ id: string } | null> {
  const customerId = typeof customer === "string" ? customer : customer?.id;
  if (!customerId) return null;
  return prisma.company.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });
}

/** Apply a subscription's current state to the owning company (plan + status). */
export async function syncSubscriptionToCompany(
  sub: Stripe.Subscription
): Promise<SubscriptionSync | null> {
  const company = await companyForCustomer(sub.customer);
  if (!company) return null;

  const priceId = sub.items.data[0]?.price?.id ?? "";
  const tier = tierForPriceId(priceId);
  const granting = GRANTING_STATUSES.has(sub.status);
  const renewsAt = periodEnd(sub);
  const staff = await isStaffCompany(company.id);

  // Plan resolution:
  // - granting + known tier   → set that tier
  // - granting + UNKNOWN tier → keep the current plan (never downgrade a paying
  //   customer to gratis over a price id we failed to map) and log loudly so the
  //   mis-configured price id gets fixed
  // - not granting            → back to gratis, unless staff (exempt/protected)
  let planUpdate: { plan?: string };
  if (granting) {
    if (tier) {
      planUpdate = { plan: tier };
    } else {
      console.error(
        `[billing] granting subscription ${sub.id} has an unmapped price id "${priceId}" — keeping company ${company.id}'s existing plan instead of resetting to gratis. Check STRIPE_PRICE_* env / portal price config.`
      );
      planUpdate = {};
    }
  } else {
    planUpdate = staff ? {} : { plan: "gratis" };
  }

  await prisma.company.update({
    where: { id: company.id },
    data: {
      ...planUpdate,
      planStatus: sub.status,
      stripeSubscriptionId: sub.id,
      planRenewsAt: renewsAt,
    },
  });

  return { companyId: company.id, tier, status: sub.status, renewsAt };
}

/** A cancelled/ended subscription drops the company back to the free tier. */
export async function clearSubscription(
  sub: Stripe.Subscription
): Promise<{ companyId: string; accessUntil: Date | null } | null> {
  const company = await companyForCustomer(sub.customer);
  if (!company) return null;

  const staff = await isStaffCompany(company.id);
  await prisma.company.update({
    where: { id: company.id },
    data: {
      ...(staff ? {} : { plan: "gratis" }),
      planStatus: "canceled",
      stripeSubscriptionId: null,
      planRenewsAt: null,
    },
  });

  const endedAt = sub.ended_at ? new Date(sub.ended_at * 1000) : periodEnd(sub);
  return { companyId: company.id, accessUntil: endedAt };
}
