// Scan-driven RELEVANCE layer (Phase B). Answers "does this dashboard surface
// APPLY to this company?" — kept strictly ORTHOGONAL to tier-gating ("can they
// access it?", lib/plan.ts). A surface can be relevant-but-locked.
//
// Read-only: it consumes the already-computed ComplianceProfile (it does NOT
// reclassify — CLAUDE.md rule #5) and combines it LIVE with the AI-register rows
// so relevance re-derives every render instead of freezing at scan time.
//
// It deliberately does NOT use companySignals() (lib/compliance/signals.ts),
// which is too coarse for this: it collapses `high` and `high_notify` into one
// flag (so the Art. 6(3) carve-out would be mis-read as high-risk) and reads
// provider-status only from the scan, ignoring AiSystem.role. Both matter here.

import type { ComplianceProfile } from "@/lib/compliance/types";
import type { TierId } from "@/lib/compliance/types";
import {
  COMPLAINTS_MIN_TIER,
  CONFORMITY_MIN_TIER,
  CORRECTIVE_MIN_TIER,
  INCIDENTS_MIN_TIER,
  LOG_RETENTION_MIN_TIER,
  NOTICES_MIN_TIER,
  REGISTER_MIN_TIER,
  tierRank,
} from "@/lib/plan";

/** The module-level dashboard surfaces whose relevance is a single yes/no.
 *  (Documents and e-learning carry PER-ITEM relevance in the profile, so they
 *  compose SurfaceRelevance per slug/path in their own surfaces — see PR4/PR7.) */
export type SurfaceKey =
  | "register"
  | "meldingen"
  | "kennisgevingen"
  | "logbewaring"
  | "klachten"
  | "conformiteit"
  | "corrigerend";

export interface SurfaceRelevance {
  /** Does this surface apply to the company's situation at all? */
  applies: boolean;
  /** The pakket tier that unlocks it — imported from the SAME lib/plan.ts
   *  constants the gate uses, so advice and gating can never diverge. */
  requiredTier: TierId;
  /** Dutch one-liner explaining why it (does/doesn't) apply — for the UI. */
  reason: string;
}

/** A minimal, DB-shaped view of an AI-register row. Loose strings on purpose so
 *  this module stays pure and trivially testable without a Prisma dependency;
 *  values mirror the AiRole / RiskLevel enums ("provider"|"deployer",
 *  "minimal"|"limited"|"high"|"unacceptable"). */
export interface RegisterSignal {
  role: string;
  riskLevel: string;
}

export type SurfaceState = "shown" | "locked" | "irrelevant";

/** Dashboard hrefs that map to a relevance surface. Nav/overview items whose href
 *  is absent here are always shown (they apply to everyone at some tier). */
export const HREF_TO_SURFACE: Record<string, SurfaceKey> = {
  "/dashboard/register": "register",
  "/dashboard/meldingen": "meldingen",
  "/dashboard/kennisgevingen": "kennisgevingen",
  "/dashboard/logbewaring": "logbewaring",
  "/dashboard/klachten": "klachten",
  "/dashboard/conformiteit": "conformiteit",
  "/dashboard/corrigerend": "corrigerend",
};

/**
 * Per-surface relevance for a company, derived LIVE from the scan profile PLUS
 * the current AI-register rows. Pure & deterministic. A null profile (no scan
 * yet, or the public demo) yields "nothing high-risk applies" cleanly.
 */
export function surfaceRelevance(
  profile: ComplianceProfile | null,
  register: RegisterSignal[] = []
): Record<SurfaceKey, SurfaceRelevance> {
  const tiers = new Set(profile?.riskTiers ?? []);
  const roles = new Set(profile?.entityRoles ?? []);

  // `high_notify` (the Art. 6(3) derogation) is DELIBERATELY NOT high-risk here —
  // that is the exact collapse companySignals() makes and we must not repeat.
  const isHigh = (rl: string) => rl === "high" || rl === "unacceptable";
  const profileHigh = tiers.has("high");

  // Pair the ROLE and the RISK. Provider-of-high-risk / deployer-of-high-risk must
  // come from the SAME source, not a cross-product: from the scan (the engine emits
  // BOTH the provider and the deployer obligation set when a high-risk company holds
  // both roles, so profile role+high is a valid pairing), OR from a SINGLE register
  // row where role and riskLevel co-occur. Otherwise a company that PROVIDES a
  // minimal tool AND DEPLOYS a high-risk tool would be wrongly told it owes provider
  // duties for high-risk AI it doesn't provide (an over-call — CLAUDE.md rule #2).
  const providerHighRisk =
    (profileHigh && roles.has("provider")) ||
    register.some((s) => s.role === "provider" && isHigh(s.riskLevel));
  const deployerHighRisk =
    (profileHigh && roles.has("deployer")) ||
    register.some((s) => s.role === "deployer" && isHigh(s.riskLevel));
  const anyHighRiskDuty = providerHighRisk || deployerHighRisk;

  // The AI-register is the foundational feature: relevant to anyone using AI, and
  // to a company that hasn't scanned yet. Only a scanned company that the scan put
  // OUTSIDE the Regulation's reach de-emphasizes it. NB: `profile.inScope` is the
  // raw market/territorial nexus and stays true even for a fully-EXCLUDED company
  // (Art. 2), so we key off the tier outcome instead.
  const outOfReach = tiers.has("excluded") || tiers.has("out_of_scope");
  const registerApplies = !profile || !outOfReach;

  return {
    register: {
      applies: registerApplies,
      requiredTier: REGISTER_MIN_TIER,
      reason: registerApplies
        ? "Leg vast welke AI-systemen u gebruikt — de basis voor uw hele naleving."
        : "Op basis van uw scan valt u buiten de reikwijdte van de AI Act.",
    },
    meldingen: {
      applies: anyHighRiskDuty,
      requiredTier: INCIDENTS_MIN_TIER,
      reason: anyHighRiskDuty
        ? "U zet hoog-risico AI in; ernstige incidenten moet u melden (Art. 73 / 26(5))."
        : "Alleen bij hoog-risico AI geldt de meldplicht voor ernstige incidenten (Art. 73).",
    },
    kennisgevingen: {
      applies: deployerHighRisk,
      requiredTier: NOTICES_MIN_TIER,
      reason: deployerHighRisk
        ? "Als gebruiksverantwoordelijke van hoog-risico AI heeft u kennisgevingsplichten (Art. 26/86)."
        : "Kennisgevingsplichten gelden voor gebruiksverantwoordelijken van hoog-risico AI (Art. 26/86).",
    },
    logbewaring: {
      applies: deployerHighRisk,
      requiredTier: LOG_RETENTION_MIN_TIER,
      reason: deployerHighRisk
        ? "Voor hoog-risico AI moet u logs bewaren (Art. 26(6))."
        : "De logbewaarplicht (Art. 26(6)) geldt bij hoog-risico AI als gebruiksverantwoordelijke.",
    },
    klachten: {
      applies: deployerHighRisk,
      requiredTier: COMPLAINTS_MIN_TIER,
      reason: deployerHighRisk
        ? "Bij hoog-risico AI moeten betrokkenen een klacht kunnen indienen (Art. 85/27)."
        : "De klachtafhandeling (Art. 85/27) hoort bij hoog-risico AI als gebruiksverantwoordelijke.",
    },
    conformiteit: {
      applies: providerHighRisk,
      requiredTier: CONFORMITY_MIN_TIER,
      reason: providerHighRisk
        ? "Als aanbieder van hoog-risico AI voert u een conformiteitsbeoordeling uit (Art. 43)."
        : "De conformiteitsbeoordeling (Art. 43) geldt alleen voor aanbieders van hoog-risico AI.",
    },
    corrigerend: {
      applies: providerHighRisk,
      requiredTier: CORRECTIVE_MIN_TIER,
      reason: providerHighRisk
        ? "Als aanbieder houdt u corrigerende maatregelen bij (Art. 20)."
        : "Het register van corrigerende maatregelen (Art. 20) geldt voor aanbieders van hoog-risico AI.",
    },
  };
}

/**
 * The ONE place relevance and the purchased pakket combine. Presentation only —
 * the real enforcement stays in the per-feature `*Unlocked(plan)` checks in the
 * pages, server actions and PDF routes.
 *
 *  - not relevant           → "irrelevant" (UI de-emphasizes; NEVER hides)
 *  - relevant, tier too low  → "locked"     (UI shows the upsell teaser)
 *  - relevant and covered    → "shown"
 */
export function surfaceState(
  rel: SurfaceRelevance,
  plan: string | null | undefined
): SurfaceState {
  if (!rel.applies) return "irrelevant";
  if (tierRank(plan) < tierRank(rel.requiredTier)) return "locked";
  return "shown";
}
