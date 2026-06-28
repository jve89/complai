import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";

export const runtime = "nodejs";

/**
 * Opens the Stripe customer billing portal. Requires a stored Stripe customer
 * id on the company (set via the checkout webhook once billing is live). Until
 * billing fields are persisted this returns a stub message.
 */
export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({
      configured: false,
      message:
        "Stripe is nog niet gekoppeld. Voeg STRIPE_SECRET_KEY toe om het facturatieportaal te activeren.",
    });
  }

  const { customerId } = (await req.json().catch(() => ({}))) as {
    customerId?: string;
  };

  if (!customerId) {
    return NextResponse.json({
      configured: false,
      message:
        "Er is nog geen actief abonnement aan deze organisatie gekoppeld.",
    });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.appUrl}/dashboard/settings`,
  });

  return NextResponse.json({ url: session.url });
}
