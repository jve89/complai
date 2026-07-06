import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { baseUrlFrom } from "@/lib/request-url";

export const runtime = "nodejs";

/**
 * Opens the Stripe billing portal for the current company. An optional `flow`
 * deep-links straight to a task on the existing subscription:
 *   - "update" → switch plan (swaps the price on the ONE subscription and
 *     prorates, so upgrading never stacks a second subscription)
 *   - "cancel" → the cancel-subscription flow
 * With no flow, it opens the portal home (invoices, payment method). Requires a
 * stored Stripe customer id, which the checkout flow sets.
 */
export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({
      configured: false,
      message:
        "Stripe is nog niet gekoppeld. Voeg STRIPE_SECRET_KEY toe om het facturatieportaal te activeren.",
    });
  }

  const user = await getCurrentUser().catch(() => null);
  if (!user?.company) {
    return NextResponse.json({
      configured: false,
      message: "Log in om uw abonnement te beheren.",
    });
  }

  const company = await prisma.company.findUnique({ where: { id: user.company.id } });
  if (!company?.stripeCustomerId) {
    return NextResponse.json({
      configured: false,
      message:
        "Er is nog geen actief abonnement aan deze organisatie gekoppeld. Kies eerst een plan.",
    });
  }

  const { flow } = (await req.json().catch(() => ({}))) as { flow?: string };

  // Deep-link to a specific flow on the current subscription when asked and one
  // exists; otherwise just open the portal home.
  let flowData: Stripe.BillingPortal.SessionCreateParams.FlowData | undefined;
  const subId = company.stripeSubscriptionId;
  if (subId && flow === "cancel") {
    flowData = { type: "subscription_cancel", subscription_cancel: { subscription: subId } };
  } else if (subId && flow === "update") {
    flowData = { type: "subscription_update", subscription_update: { subscription: subId } };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: company.stripeCustomerId,
    return_url: `${baseUrlFrom(req)}/dashboard/settings`,
    ...(flowData ? { flow_data: flowData } : {}),
  });

  return NextResponse.json({ url: session.url });
}
