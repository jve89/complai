// The paid product = the document package you own. Which documents a company can
// generate is gated by its plan, so the plan buys the deliverable (not just a
// dashboard). Higher plan → more documents; the top plan → everything (≈ the full
// AI compliance manual).

import type { TierId } from "@/lib/compliance/types";

export const TIER_ORDER: TierId[] = ["gratis", "starter", "groei", "schaal"];

export const TIER_LABEL: Record<TierId, string> = {
  gratis: "Inzicht",
  starter: "Actief",
  groei: "Compliance-klaar",
  schaal: "Audit-klaar",
};

export function tierRank(plan: string | null | undefined): number {
  const i = TIER_ORDER.indexOf((plan ?? "gratis") as TierId);
  return i < 0 ? 0 : i;
}

/**
 * Minimum plan that unlocks each document type:
 *  - Actief (starter):       Art. 4/5 basics → AI-beleid
 *  - Compliance-klaar (groei): + Art. 50 transparantiepakket
 *  - Audit-klaar (schaal):   + all hoog-risico documenten (the full manual)
 * Free (Inzicht) unlocks no documents — dashboard + scan only.
 */
export const DOC_MIN_TIER: Record<string, TierId> = {
  ai_policy: "starter",
  transparency: "groei",
  risk_assessment: "schaal",
  fria: "schaal",
  tech_doc: "schaal",
  doc_conformity: "schaal",
  assessment_record: "schaal",
  gpai_docs: "schaal",
};

export function minTierFor(slug: string): TierId {
  return DOC_MIN_TIER[slug] ?? "starter";
}

/** Whether a company on `plan` may generate document `slug`. */
export function docUnlocked(plan: string | null | undefined, slug: string): boolean {
  return tierRank(plan) >= tierRank(minTierFor(slug));
}
