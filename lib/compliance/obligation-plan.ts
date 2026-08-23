// obligationPlan() — the "uw verplichtingen" backbone for the whole product.
//
// Turns a computed ComplianceProfile into one flat, display-ready list: per legal
// obligation, WHICH article, WHEN it applies, WHAT proves it, and the MINIMUM
// pakket that unlocks that proof — plus the overall recommended pakket. This is the
// single source the scan-results page, the pricing page and the dashboard overview
// all read, so the "de wet verplicht u tot X → dus u heeft minimaal pakket Y nodig"
// story is derived once and can never contradict the gating.
//
// It only READS existing truth (OBLIGATION_CATALOG + the plan gates + the profile's
// own recommendedTier); it invents no obligations and inflates nothing.

import { OBLIGATION_CATALOG } from "@/lib/compliance/obligations";
import {
  REGISTER_MIN_TIER,
  TIER_LABEL,
  TRAINING_MIN_TIER,
  minTierFor,
} from "@/lib/plan";
import type { ComplianceProfile, EvidenceKind, ObligationItem, TierId } from "@/lib/compliance/types";

export interface ObligationPlanRow {
  code: string;
  article: string; // e.g. "Art. 4"
  title: string; // Dutch label
  description: string; // Dutch plain-language explanation
  required: boolean; // true = wettelijke plicht; false = advies
  status: ObligationItem["status"];
  deadline: string | null; // ISO date the obligation applies, or null
  /** How this obligation is proven (document / training / register / process). */
  evidenceKind: EvidenceKind;
  /** Lowest pakket that unlocks the deliverable proving this obligation, or null
   *  for process obligations with no gated deliverable (manual attestation). */
  minTier: TierId | null;
  minTierLabel: string | null;
}

export interface ObligationPlanResult {
  /** Legally required obligations first, then advisory. */
  rows: ObligationPlanRow[];
  /** Lowest pakket covering every required deliverable (from the scan). */
  recommendedTier: TierId;
  recommendedTierLabel: string;
}

/** The evidence kind for a code, preferring the obligation's own value, falling
 *  back to the catalog (the engine copies it from the catalog, but be defensive). */
function evidenceKindFor(o: ObligationItem): EvidenceKind {
  return o.evidenceKind ?? OBLIGATION_CATALOG[o.code]?.evidenceKind ?? "process";
}

/** Minimum pakket that unlocks the proof for an obligation code, mirroring the
 *  real gates in lib/plan.ts. Null = process duty with no gated deliverable. */
function minTierForObligation(code: string, kind: EvidenceKind): TierId | null {
  const entry = OBLIGATION_CATALOG[code];
  if (kind === "document" && entry?.docSlug) return minTierFor(entry.docSlug);
  if (kind === "training") return TRAINING_MIN_TIER;
  if (kind === "register") return REGISTER_MIN_TIER;
  return null; // process obligation
}

export function obligationPlan(
  profile: Pick<ComplianceProfile, "obligations" | "recommendedTier">
): ObligationPlanResult {
  const rows: ObligationPlanRow[] = profile.obligations.map((o) => {
    const kind = evidenceKindFor(o);
    const minTier = minTierForObligation(o.code, kind);
    return {
      code: o.code,
      article: o.article,
      title: o.title,
      description: o.description,
      required: o.required,
      status: o.status,
      deadline: o.deadline ?? null,
      evidenceKind: kind,
      minTier,
      minTierLabel: minTier ? TIER_LABEL[minTier] : null,
    };
  });

  // Required first, advisory second; preserve source order within each group.
  const ordered = [
    ...rows.filter((r) => r.required),
    ...rows.filter((r) => !r.required),
  ];

  return {
    rows: ordered,
    recommendedTier: profile.recommendedTier,
    recommendedTierLabel: TIER_LABEL[profile.recommendedTier],
  };
}
