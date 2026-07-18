import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe, isStripeResourceMissing } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canAdminister } from "@/lib/auth";
import { isStaffCompany } from "@/lib/billing";
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
  if (!canAdminister(user)) {
    return NextResponse.json({
      configured: false,
      message: "Alleen de beheerder kan het abonnement beheren.",
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
  const returnUrl = `${baseUrlFrom(req)}/dashboard/settings`;

  // Deep-link to a specific flow on the current subscription when asked and one
  // exists; otherwise just open the portal home. after_completion redirects the
  // user straight back to the app once the flow finishes, instead of leaving
  // them on Stripe's portal page.
  let flowData: Stripe.BillingPortal.SessionCreateParams.FlowData | undefined;
  const subId = company.stripeSubscriptionId;
  const afterCompletion = {
    type: "redirect" as const,
    redirect: { return_url: returnUrl },
  };
  if (subId && flow === "cancel") {
    flowData = {
      type: "subscription_cancel",
      subscription_cancel: { subscription: subId },
      after_completion: afterCompletion,
    };
  } else if (subId && flow === "update") {
    flowData = {
      type: "subscription_update",
      subscription_update: { subscription: subId },
      after_completion: afterCompletion,
    };
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: company.stripeCustomerId,
      return_url: returnUrl,
      ...(flowData ? { flow_data: flowData } : {}),
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    // A stored customer/subscription that doesn't exist for the current key —
    // e.g. a test-mode id left after the switch to live. Drop the dead linkage
    // so the UI stops offering a portal that can't open, and point them at a plan.
    if (isStripeResourceMissing(err)) {
      const param = (err as { param?: string }).param;
      const customerMissing = param === "customer";
      // A confirmed-dead customer means no live billing relationship → also drop
      // the paid tier it granted (unless staff, who are exempt), matching the
      // checkout self-heal. Only checked when the customer itself is gone.
      const staff = customerMissing ? await isStaffCompany(company.id) : false;
      await prisma.company.update({
        where: { id: company.id },
        data: {
          // Only drop the customer id when the CUSTOMER is the missing object (a
          // test-mode id after go-live). A missing subscription leaves a valid
          // customer — and its payment history — intact; checkout self-heals the
          // customer id later if it too turns out to be stale.
          ...(customerMissing ? { stripeCustomerId: null } : {}),
          stripeSubscriptionId: null,
          planStatus: null,
          planRenewsAt: null,
          ...(customerMissing && !staff ? { plan: "gratis" } : {}),
        },
      });
      return NextResponse.json({
        configured: false,
        message:
          "Er is nog geen actief abonnement aan deze organisatie gekoppeld. Kies eerst een plan.",
      });
    }
    console.error("[portal] unexpected error opening billing portal", err);
    return NextResponse.json({
      configured: false,
      message: "Het facturatieportaal is tijdelijk niet beschikbaar. Probeer het zo opnieuw.",
    });
  }
}
