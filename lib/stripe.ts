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
    name: "Scan",
    monthly: 0,
    yearly: 0,
    tagline: "Gratis scan + persoonlijk stappenplan. Geen account, geen abonnement nodig.",
    features: [
      "Gratis risicoscan (zonder account)",
      "Gereedheidsscore, risicocategorie & rol",
      "Rapport met deadlines (PDF)",
      "Stappenplan op maat",
    ],
  },
  {
    id: "starter",
    name: "Basis",
    monthly: 19.99,
    yearly: 199.9,
    priceIdMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    priceIdYearly: process.env.STRIPE_PRICE_STARTER_YEARLY,
    tagline: "Voor wie nu de eerste verplichtingen wil regelen.",
    features: [
      "Alles uit Scan",
      "Onbeperkt AI-register",
      "AI-beleid & transparantieverklaring",
      "AI-geletterdheid e-learning",
      "Tot 5 gebruikers",
    ],
  },
  {
    id: "professional",
    name: "Compliance",
    monthly: 29.99,
    yearly: 299.9,
    priceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    priceIdYearly: process.env.STRIPE_PRICE_PRO_YEARLY,
    tagline: "Voor hoog-risico AI of een documentatieplicht.",
    highlighted: true,
    features: [
      "Alles uit Basis",
      "FRIA, risicobeoordeling & beoordelingsdossier",
      "E-learning met certificaten",
      "Governance-dashboard",
      "Tot 25 gebruikers",
    ],
  },
  {
    id: "corporate",
    name: "Audit",
    monthly: 39.99,
    yearly: 399.9,
    priceIdMonthly: process.env.STRIPE_PRICE_CORP_MONTHLY,
    priceIdYearly: process.env.STRIPE_PRICE_CORP_YEARLY,
    tagline: "Voor aanbieders en grotere organisaties die hun naleving volledig willen documenteren.",
    features: [
      "Alles uit Compliance",
      "Technische documentatie, EU-conformiteit & GPAI-docs",
      "Onbeperkt gebruikers & vestigingen",
      "Audit-export & API-toegang",
      "Persoonlijke onboarding",
    ],
  },
];

/** Annual billing = 2 months free (yearly = monthly × 10). */
export const YEARLY_DISCOUNT = 1 / 6;

/** Map the engine's needs-based TierId → the displayed Plan. */
export function planForTier(tier: string): Plan {
  const byTier: Record<string, PlanId> = {
    gratis: "free",
    starter: "starter",
    groei: "professional",
    schaal: "corporate",
  };
  return PLANS.find((p) => p.id === (byTier[tier] ?? "free")) ?? PLANS[0];
}

/** Displayed Plan id → the tier stored on `company.plan` (gates documents). */
export function planIdToTier(id: PlanId): "gratis" | "starter" | "groei" | "schaal" {
  const map: Record<PlanId, "gratis" | "starter" | "groei" | "schaal"> = {
    free: "gratis",
    starter: "starter",
    professional: "groei",
    corporate: "schaal",
  };
  return map[id];
}

/** Resolve a Stripe price id → the paid tier it grants (via the env price ids). */
export function tierForPriceId(priceId: string): "starter" | "groei" | "schaal" | null {
  if (!priceId) return null;
  for (const plan of PLANS) {
    if (plan.priceIdMonthly === priceId || plan.priceIdYearly === priceId) {
      const tier = planIdToTier(plan.id);
      return tier === "gratis" ? null : tier;
    }
  }
  return null;
}

export function priceIdFor(plan: Plan, interval: "month" | "year"): string | undefined {
  return interval === "year" ? plan.priceIdYearly : plan.priceIdMonthly;
}
