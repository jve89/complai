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

/** True when a Stripe error means the referenced object doesn't exist for the
 * current key — e.g. a test-mode `cus_…`/`sub_…` used with a live key after
 * switching prod to live mode ("No such customer: … exists in test mode"). */
export function isStripeResourceMissing(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: string }).code === "resource_missing"
  );
}

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
    tagline: "Doe de risicoscan zonder kosten en houd uw status en de voor u relevante wetswijzigingen bij in het dashboard. Documenten en tools horen bij de betaalde plannen.",
    features: [
      "Gratis risicoscan (zonder account)",
      "Gereedheidsscore, risicocategorie & rol",
      "Rapport met deadlines (PDF)",
      "Kennisbank & wetsupdates",
    ],
  },
  {
    id: "starter",
    name: "Basis",
    monthly: 19.99,
    yearly: 199.9,
    priceIdMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    priceIdYearly: process.env.STRIPE_PRICE_STARTER_YEARLY,
    tagline: "Om uw eerste verplichtingen nu op orde te brengen.",
    features: [
      "Alles uit Scan",
      "E-learning & certificaten (bewijs voor Art. 4)",
      "AI-register (max. 3 systemen)",
      "AI-beleid & transparantieverklaring",
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
    tagline: "Voor wie met hoog-risico AI werkt of onder een documentatieplicht valt.",
    highlighted: true,
    features: [
      "Alles uit Basis",
      "AI-register (max. 10 systemen)",
      "FRIA, DPIA, risicobeoordeling & beoordelingsdossier",
      "Incidentmelding, klachten, logbewaring & kennisgevingen",
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
    tagline: "Voor aanbieders en grotere organisaties die hun naleving tot in detail willen vastleggen.",
    features: [
      "Alles uit Compliance",
      "Technische documentatie, KMS & post-market plan",
      "EU-conformiteit, conformiteitstracker & correctieregister",
      "GPAI-documentatie",
      "Onbeperkt AI-systemen & gebruikers",
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
