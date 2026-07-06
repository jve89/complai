import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe, tierForPriceId } from "@/lib/stripe";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import {
  syncSubscriptionToCompany,
  clearSubscription,
  companyForCustomer,
} from "@/lib/billing";
import {
  sendPurchaseConfirmation,
  sendPaymentFailed,
  sendTrialEnding,
  sendCancelRequested,
  sendSubscriptionEnded,
} from "@/lib/email/send";
import { TIER_LABEL } from "@/lib/plan";
import type { TierId } from "@/lib/compliance/types";
import { baseUrlFrom } from "@/lib/request-url";
import { formatDate } from "@/lib/utils";

// Paid-tier label for emails; null when the price id can't be mapped — the
// templates then say "uw pakket" instead of confirming the FREE tier.
const tierLabel = (tier: string | null): string | null =>
  tier && tier !== "gratis" ? TIER_LABEL[tier as TierId] ?? null : null;

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

  // Emails link to the canonical app URL when configured; the request host is
  // only a fallback (a webhook POST has no user-facing origin).
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") || baseUrlFrom(req);

  // Idempotency: Stripe redelivers events (timeouts, retries after a 500).
  // Insert-or-skip on the event id makes redelivery a no-op — no duplicate
  // emails, no repeated writes.
  try {
    await prisma.stripeEvent.create({
      data: { id: event.id, type: event.type },
    });
  } catch {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          const sync = await syncSubscriptionToCompany(sub);
          if (sync) {
            await sendPurchaseConfirmation({
              companyId: sync.companyId,
              planLabel: tierLabel(sync.tier),
              trialing: sync.status === "trialing",
              renewsAt: sync.renewsAt ? formatDate(sync.renewsAt) : null,
              baseUrl,
            });
          }
        }
        break;
      }
      case "customer.subscription.created":
        await syncSubscriptionToCompany(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const sync = await syncSubscriptionToCompany(sub);
        const prev = event.data.previous_attributes as
          | Partial<Stripe.Subscription>
          | undefined;
        // Opzegging aangevraagd: the subscription is now scheduled to end
        // (cancel_at_period_end, OR a cancel_at timestamp — Stripe uses the
        // latter when cancelling a *trialing* subscription) AND that scheduling
        // just changed in this event, so we confirm it exactly once.
        console.log(
          `[stripe] sub.updated cape=${sub.cancel_at_period_end} cancel_at=${sub.cancel_at} status=${sub.status} prevKeys=${prev ? Object.keys(prev).join(",") : "none"}`
        );
        const scheduledToCancel = Boolean(sub.cancel_at_period_end) || Boolean(sub.cancel_at);
        const cancelJustChanged =
          !!prev && ("cancel_at_period_end" in prev || "cancel_at" in prev);
        if (sync && scheduledToCancel && cancelJustChanged) {
          const until = sub.cancel_at ? new Date(sub.cancel_at * 1000) : sync.renewsAt;
          await sendCancelRequested({
            companyId: sync.companyId,
            accessUntil: until ? formatDate(until) : null,
            baseUrl,
          });
        }
        break;
      }
      case "customer.subscription.trial_will_end": {
        // Fires ±3 days before the trial converts — but also for subscriptions
        // already cancelled at period end, where nothing will be charged.
        const sub = event.data.object as Stripe.Subscription;
        if (sub.cancel_at_period_end) break;
        const company = await companyForCustomer(sub.customer);
        if (company) {
          await sendTrialEnding({
            companyId: company.id,
            planLabel: tierLabel(tierForPriceId(sub.items.data[0]?.price?.id ?? "")),
            endsAt: sub.trial_end ? formatDate(new Date(sub.trial_end * 1000)) : null,
            baseUrl,
          });
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const company = await companyForCustomer(
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id ?? null
        );
        if (company) {
          await sendPaymentFailed({ companyId: company.id, baseUrl });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const cleared = await clearSubscription(sub);
        if (cleared) {
          // Dunning-cancel (failed payments) is not an opzegging by the klant —
          // it gets its own, non-accusatory copy.
          const involuntary =
            sub.cancellation_details?.reason === "payment_failed" ||
            sub.status === "unpaid";
          await sendSubscriptionEnded({
            companyId: cleared.companyId,
            involuntary,
            baseUrl,
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "onbekend";
    console.error(`[stripe] fout bij verwerken ${event.type}: ${message}`);
    // Release the idempotency claim so Stripe's retry is NOT skipped as a
    // duplicate — otherwise a failed handler would never re-run.
    await prisma.stripeEvent
      .delete({ where: { id: event.id } })
      .catch(() => undefined);
    // 500 so Stripe retries the event.
    return NextResponse.json({ error: "Verwerking mislukt." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
