import "server-only";

import type Stripe from "stripe";
import type { Company } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { stripe, tierForPriceId } from "@/lib/stripe";

/** Statuses that keep a subscription's documents unlocked (grace during dunning). */
const GRANTING_STATUSES = new Set(["active", "trialing", "past_due"]);

/** Find-or-create the Stripe customer for a company and persist its id. */
export async function ensureStripeCustomer(
  company: Pick<Company, "id" | "name" | "stripeCustomerId">,
  email?: string | null
): Promise<string> {
  if (!stripe) throw new Error("Stripe is niet geconfigureerd.");
  if (company.stripeCustomerId) return company.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    name: company.name,
    metadata: { companyId: company.id },
  });
  await prisma.company.update({
    where: { id: company.id },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
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

  await prisma.company.update({
    where: { id: company.id },
    data: {
      plan: granting && tier ? tier : "gratis",
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

  await prisma.company.update({
    where: { id: company.id },
    data: {
      plan: "gratis",
      planStatus: "canceled",
      stripeSubscriptionId: null,
      planRenewsAt: null,
    },
  });

  const endedAt = sub.ended_at ? new Date(sub.ended_at * 1000) : periodEnd(sub);
  return { companyId: company.id, accessUntil: endedAt };
}
