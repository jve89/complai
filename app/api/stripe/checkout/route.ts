import { NextResponse } from "next/server";

import { stripe, PLANS, planIdToTier, priceIdFor } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";
import { ensureStripeCustomer } from "@/lib/billing";

export const runtime = "nodejs";

type CheckoutResult =
  | { url: string }
  | { needsAccount: true }
  | { configured: false; message: string };

/**
 * Builds a Stripe Checkout session for a plan. Account-first: an anonymous
 * visitor is sent to sign up first (needsAccount), so we never end up with a
 * paid-but-unregistered customer. The subscription ties to the company's Stripe
 * customer, and the webhook flips `company.plan` on success.
 */
async function createCheckout(
  planId: string | undefined,
  interval: "month" | "year"
): Promise<CheckoutResult> {
  if (!stripe) {
    return {
      configured: false,
      message:
        "Stripe is nog niet gekoppeld. Voeg STRIPE_SECRET_KEY en de prijs-ID's toe aan uw omgeving om afrekenen te activeren.",
    };
  }

  const plan = PLANS.find((p) => p.id === planId);
  const priceId = plan ? priceIdFor(plan, interval) : undefined;
  if (!plan || !priceId) {
    return { configured: false, message: "Voor dit plan is nog geen Stripe-prijs ingesteld." };
  }

  const user = await getCurrentUser().catch(() => null);
  if (!user?.company) return { needsAccount: true };

  const company = await prisma.company.findUnique({ where: { id: user.company.id } });
  if (!company) return { needsAccount: true };

  const customerId = await ensureStripeCustomer(company, user.email);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    // Free first month: 30-day trial, card collected up front, auto-converts.
    subscription_data: plan.freeFirstMonth ? { trial_period_days: 30 } : undefined,
    success_url: `${env.appUrl}/dashboard?checkout=success`,
    cancel_url: `${env.appUrl}/pricing?checkout=cancel`,
    metadata: { companyId: company.id, tier: planIdToTier(plan.id) },
  });

  return session.url ? { url: session.url } : { configured: false, message: "Afrekenen mislukt." };
}

/** Used by the pricing table (fetch → JSON). */
export async function POST(req: Request) {
  const { planId, interval } = (await req.json().catch(() => ({}))) as {
    planId?: string;
    interval?: "month" | "year";
  };
  return NextResponse.json(await createCheckout(planId, interval === "year" ? "year" : "month"));
}

/**
 * Used by the account-first hand-off: after signup/login with a chosen plan we
 * redirect here, which creates the session and 303s straight to Stripe.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const planId = url.searchParams.get("plan") ?? undefined;
  const interval = url.searchParams.get("interval") === "year" ? "year" : "month";

  const result = await createCheckout(planId, interval);
  if ("url" in result) return NextResponse.redirect(result.url, 303);
  if ("needsAccount" in result) {
    return NextResponse.redirect(
      `${env.appUrl}/signup?plan=${planId ?? ""}&interval=${interval}`,
      303
    );
  }
  // Stub / misconfigured — land in the dashboard rather than a dead end.
  return NextResponse.redirect(`${env.appUrl}/dashboard?checkout=unavailable`, 303);
}
