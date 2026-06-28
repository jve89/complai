import { NextResponse } from "next/server";

import { stripe, PLANS } from "@/lib/stripe";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Creates a Stripe Checkout session for a plan. When Stripe is not configured
 * (stub mode) it returns `{ configured: false }` so the UI can show a friendly
 * message instead of failing.
 */
export async function POST(req: Request) {
  const { planId, interval } = (await req.json().catch(() => ({}))) as {
    planId?: string;
    interval?: "month" | "year";
  };

  if (!stripe) {
    return NextResponse.json({
      configured: false,
      message:
        "Stripe is nog niet gekoppeld. Voeg STRIPE_SECRET_KEY en de prijs-ID's toe aan uw omgeving om afrekenen te activeren.",
    });
  }

  const plan = PLANS.find((p) => p.id === planId);
  const priceId =
    interval === "year" ? plan?.priceIdYearly : plan?.priceIdMonthly;

  if (!plan || !priceId) {
    return NextResponse.json({
      configured: false,
      message: "Voor dit plan is nog geen Stripe-prijs ingesteld.",
    });
  }

  const user = await getCurrentUser().catch(() => null);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user?.email || undefined,
    allow_promotion_codes: true,
    success_url: `${env.appUrl}/dashboard?checkout=success`,
    cancel_url: `${env.appUrl}/pricing?checkout=cancel`,
    metadata: { planId: plan.id, companyId: user?.company?.id ?? "" },
  });

  return NextResponse.json({ url: session.url });
}
