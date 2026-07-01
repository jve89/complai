import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { syncSubscriptionToCompany, clearSubscription } from "@/lib/billing";

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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await syncSubscriptionToCompany(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await syncSubscriptionToCompany(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await clearSubscription(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "onbekend";
    console.error(`[stripe] fout bij verwerken ${event.type}: ${message}`);
    // 500 so Stripe retries the event.
    return NextResponse.json({ error: "Verwerking mislukt." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
