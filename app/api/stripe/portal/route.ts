import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Opens the Stripe billing portal for the current company (upgrade / downgrade /
 * cancel / invoices). Requires a stored Stripe customer id, which the checkout
 * flow sets. Returns a friendly message otherwise.
 */
export async function POST() {
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

  const session = await stripe.billingPortal.sessions.create({
    customer: company.stripeCustomerId,
    return_url: `${env.appUrl}/dashboard/settings`,
  });

  return NextResponse.json({ url: session.url });
}
