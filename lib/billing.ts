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

/** Apply a subscription's current state to the owning company (plan + status). */
export async function syncSubscriptionToCompany(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const company = await prisma.company.findFirst({
    where: { stripeCustomerId: customerId },
  });
  if (!company) return;

  const priceId = sub.items.data[0]?.price?.id ?? "";
  const tier = tierForPriceId(priceId);
  const granting = GRANTING_STATUSES.has(sub.status);

  await prisma.company.update({
    where: { id: company.id },
    data: {
      plan: granting && tier ? tier : "gratis",
      planStatus: sub.status,
      stripeSubscriptionId: sub.id,
      planRenewsAt: periodEnd(sub),
    },
  });
}

/** A cancelled/ended subscription drops the company back to the free tier. */
export async function clearSubscription(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const company = await prisma.company.findFirst({
    where: { stripeCustomerId: customerId },
  });
  if (!company) return;

  await prisma.company.update({
    where: { id: company.id },
    data: {
      plan: "gratis",
      planStatus: "canceled",
      stripeSubscriptionId: null,
      planRenewsAt: null,
    },
  });
}
