import { NextResponse } from "next/server";

import { stripe, PLANS, planIdToTier, priceIdFor } from "@/lib/stripe";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canAdminister } from "@/lib/auth";
import { ensureStripeCustomer } from "@/lib/billing";
import { baseUrlFrom } from "@/lib/request-url";

export const runtime = "nodejs";

type CheckoutResult =
  | { url: string }
  | { needsAccount: true }
  | { alreadySubscribed: true; message: string }
  | { configured: false; message: string };

/** Statuses under which a subscription still grants a plan — a company in one of
 * these must change plans via the portal, not stack a second subscription. */
const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

/**
 * Builds a Stripe Checkout session for a plan. Account-first: an anonymous
 * visitor is sent to sign up first (needsAccount), so we never end up with a
 * paid-but-unregistered customer. The subscription ties to the company's Stripe
 * customer, and the webhook flips `company.plan` on success.
 */
async function createCheckout(
  planId: string | undefined,
  interval: "month" | "year",
  appUrl: string
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

  // Managing the subscription is beheerder-only.
  if (!canAdminister(user)) {
    return {
      configured: false,
      message: "Alleen de beheerder kan een abonnement afsluiten of wijzigen.",
    };
  }

  // Resolve a customer that's valid for the CURRENT Stripe key. This self-heals a
  // stale test-mode id after go-live (and clears its dead subscription linkage).
  const { customerId, recreated } = await ensureStripeCustomer(company, user.email);

  // Never stack a second subscription: an existing subscriber changes plans via
  // the billing portal (which swaps the price on the one subscription and
  // prorates), so checkout is for NEW subscriptions only. Skip this when we just
  // recreated the customer — its prior subscription lived under a different key
  // and no longer exists, so `company.stripeSubscriptionId` is stale.
  if (
    !recreated &&
    company.stripeSubscriptionId &&
    ACTIVE_STATUSES.has(company.planStatus ?? "")
  ) {
    return {
      alreadySubscribed: true,
      message:
        "U heeft al een actief abonnement. Wijzig uw pakket via Instellingen → Abonnement.",
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    // Business VAT invoicing (reverse charge): let the buyer enter their BTW
    // number + business address, which Stripe VIES-validates and prints on a
    // proper VAT invoice. Gated so it only activates once Stripe Tax is live in
    // the dashboard (automatic_tax would otherwise error the session).
    // `customer_update.address` is mandatory alongside automatic_tax + an
    // existing `customer`; `name: "auto"` saves the business name they enter.
    ...(env.stripeTaxEnabled
      ? {
          automatic_tax: { enabled: true },
          tax_id_collection: { enabled: true },
          billing_address_collection: "required" as const,
          customer_update: { name: "auto" as const, address: "auto" as const },
        }
      : {}),
    // No free trial: the card is charged on signup, so the paid deliverables
    // can't be extracted for free and then cancelled.
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancel`,
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
  try {
    const result = await createCheckout(
      planId,
      interval === "year" ? "year" : "month",
      baseUrlFrom(req)
    );
    return NextResponse.json(result);
  } catch (err) {
    // Never leak a raw 500 to the pricing table (it shows a blank "er ging iets
    // mis"). Log the real Stripe error server-side; return a friendly message.
    console.error("[checkout] unexpected error creating session", err);
    return NextResponse.json({
      configured: false,
      message: "Afrekenen is tijdelijk niet beschikbaar. Probeer het zo opnieuw.",
    });
  }
}

/**
 * Used by the account-first hand-off: after signup/login with a chosen plan we
 * redirect here, which creates the session and 303s straight to Stripe.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const planId = url.searchParams.get("plan") ?? undefined;
  const interval = url.searchParams.get("interval") === "year" ? "year" : "month";
  const appUrl = baseUrlFrom(req);

  let result: CheckoutResult;
  try {
    result = await createCheckout(planId, interval, appUrl);
  } catch (err) {
    console.error("[checkout] unexpected error creating session (GET)", err);
    return NextResponse.redirect(`${appUrl}/dashboard?checkout=unavailable`, 303);
  }
  if ("url" in result) return NextResponse.redirect(result.url, 303);
  if ("needsAccount" in result) {
    return NextResponse.redirect(
      `${appUrl}/signup?plan=${planId ?? ""}&interval=${interval}`,
      303
    );
  }
  // Already subscribed — send them to settings to change plan via the portal.
  if ("alreadySubscribed" in result) {
    return NextResponse.redirect(`${appUrl}/dashboard/settings`, 303);
  }
  // Stub / misconfigured — land in the dashboard rather than a dead end.
  return NextResponse.redirect(`${appUrl}/dashboard?checkout=unavailable`, 303);
}
