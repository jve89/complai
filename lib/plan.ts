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
 * Minimum plan that unlocks each document type — a deployer → provider split,
 * mirroring the AI Act's own duty structure. Free (Inzicht) unlocks no documents.
 *  - Actief (starter):        the broad basics — AI-beleid (Art. 4/5) and the
 *                             Art. 50 transparantieverklaring.
 *  - Compliance-klaar (groei): + the documents a USER of high-risk AI needs —
 *                             FRIA (Art. 27), risicobeoordeling (Art. 26) and the
 *                             Art. 6(4) beoordelingsdossier.
 *  - Audit-klaar (schaal):    + the documents a MAKER/provider needs — technische
 *                             documentatie (Annex IV), EU-conformiteitsverklaring
 *                             (Art. 47) and GPAI-documentatie (Art. 53).
 * The scan recommends the LOWEST pakket that unlocks every required document
 * (see recommendedTier in lib/compliance/profile.ts), so advice and gating agree.
 */
export const DOC_MIN_TIER: Record<string, TierId> = {
  ai_policy: "starter",
  transparency: "starter",
  fria: "groei",
  risk_assessment: "groei",
  assessment_record: "groei",
  tech_doc: "schaal",
  doc_conformity: "schaal",
  gpai_docs: "schaal",
};

export function minTierFor(slug: string): TierId {
  return DOC_MIN_TIER[slug] ?? "starter";
}

/** Whether a company on `plan` may generate document `slug`. */
export function docUnlocked(plan: string | null | undefined, slug: string): boolean {
  return tierRank(plan) >= tierRank(minTierFor(slug));
}

/** The AI-register (unlimited systems) is a paid feature from Actief (starter).
 * On Inzicht (gratis) existing rows stay visible but locked: no add/edit,
 * delete still allowed so a downgraded company can clean up. */
export const REGISTER_MIN_TIER: TierId = "starter";

export function registerUnlocked(plan: string | null | undefined): boolean {
  return tierRank(plan) >= tierRank(REGISTER_MIN_TIER);
}
