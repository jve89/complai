import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";

export const runtime = "nodejs";

/**
 * Stripe webhook receiver. Verifies the signature and handles subscription
 * lifecycle events. Returns 503 in stub mode (no keys) so it's clearly inactive
 * rather than silently accepting unverified payloads.
 */
export async function POST(req: Request) {
  if (!stripe || !env.stripeWebhookSecret) {
    return NextResponse.json(
      { configured: false, message: "Webhook niet geconfigureerd." },
      { status: 503 }
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Geen handtekening." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.stripeWebhookSecret
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "onbekend";
    return NextResponse.json(
      { error: `Ongeldige handtekening: ${message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      // TODO: persist the Stripe customer/subscription on the Company once
      // billing fields are added to the schema.
      console.info(`[stripe] ${event.type}`);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
