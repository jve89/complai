import Stripe from "stripe";

import { env, isStripeConfigured } from "@/lib/env";

/**
 * Stripe client. When STRIPE_SECRET_KEY is not configured the rest of the app
 * runs in "stub" mode: checkout/portal routes return a friendly message instead
 * of throwing, so the platform is fully usable for demos without billing keys.
 */
export const stripe = isStripeConfigured
  ? new Stripe(env.stripeSecretKey as string, {
      typescript: true,
      appInfo: { name: "ComplAI", version: "0.1.0" },
    })
  : null;

export { isStripeConfigured };

/** Plan catalogue. priceId values are placeholders until live Stripe keys exist. */
export type PlanId = "free" | "starter" | "professional" | "corporate";

export interface Plan {
  id: PlanId;
  name: string;
  monthly: number;
  yearly: number;
  priceIdMonthly?: string;
  priceIdYearly?: string;
  tagline: string;
  features: string[];
  highlighted?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Gratis",
    monthly: 0,
    yearly: 0,
    tagline: "Proef het platform en ken uw uitgangspunt.",
    features: [
      "Gratis risicoscan",
      "Compliance-score & rapport (PDF)",
      "1 gebruiker",
      "Basis AI-register (max. 3 systemen)",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    monthly: 49,
    yearly: 499,
    priceIdMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    priceIdYearly: process.env.STRIPE_PRICE_STARTER_YEARLY,
    tagline: "Voor kleine teams die net beginnen met de AI Act.",
    features: [
      "Alles uit Gratis",
      "Onbeperkt AI-register",
      "AI-beleid & transparantieverklaring",
      "Tot 5 gebruikers",
      "E-mailondersteuning",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    monthly: 99,
    yearly: 999,
    priceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    priceIdYearly: process.env.STRIPE_PRICE_PRO_YEARLY,
    tagline: "Voor organisaties die volledig grip willen houden.",
    highlighted: true,
    features: [
      "Alles uit Starter",
      "Alle documenten incl. FRIA & risicobeoordeling",
      "E-learning met certificaten",
      "Governance-dashboard",
      "Tot 25 gebruikers",
    ],
  },
  {
    id: "corporate",
    name: "Corporate",
    monthly: 249,
    yearly: 2499,
    priceIdMonthly: process.env.STRIPE_PRICE_CORP_MONTHLY,
    priceIdYearly: process.env.STRIPE_PRICE_CORP_YEARLY,
    tagline: "Voor grotere organisaties met meerdere vestigingen.",
    features: [
      "Alles uit Professional",
      "Onbeperkt gebruikers",
      "Meerdere vestigingen",
      "Audit-export & API-toegang",
      "Persoonlijke onboarding",
    ],
  },
];

export const YEARLY_DISCOUNT = 0.15;
