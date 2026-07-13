// The paid product = the document package you own. Which documents a company can
// generate is gated by its plan, so the plan buys the deliverable (not just a
// dashboard). Higher plan → more documents; the top plan → everything (≈ the full
// AI compliance manual).

import type { TierId } from "@/lib/compliance/types";

export const TIER_ORDER: TierId[] = ["gratis", "starter", "groei", "schaal"];

export const TIER_LABEL: Record<TierId, string> = {
  gratis: "Scan",
  starter: "Basis",
  groei: "Compliance",
  schaal: "Audit",
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

/** The AI-register is a paid feature from Basis (starter). On Scan (gratis)
 * existing rows stay visible but locked: no add/edit, delete still allowed so a
 * downgraded company can clean up. */
export const REGISTER_MIN_TIER: TierId = "starter";

export function registerUnlocked(plan: string | null | undefined): boolean {
  return tierRank(plan) >= tierRank(REGISTER_MIN_TIER);
}

/** Max number of AI-systems per tier (enforced on add): Basis 3, Compliance 10,
 * Audit unlimited. Scan can't add at all (registerUnlocked is false). */
export const REGISTER_LIMIT: Record<TierId, number> = {
  gratis: 0,
  starter: 3,
  groei: 10,
  schaal: Infinity,
};

export function registerLimit(plan: string | null | undefined): number {
  return REGISTER_LIMIT[TIER_ORDER[tierRank(plan)]];
}

/** Max number of team members per tier (enforced on invite): Scan 1, Basis 5,
 * Compliance 25, Audit unlimited. */
export const USER_LIMIT: Record<TierId, number> = {
  gratis: 1,
  starter: 5,
  groei: 25,
  schaal: Infinity,
};

export function userLimit(plan: string | null | undefined): number {
  return USER_LIMIT[TIER_ORDER[tierRank(plan)]];
}

/** E-learning (modules, quizzes, certificates) is a paid feature from Compliance
 * (groei) — Basis and below see the learning paths as a teaser but can't start
 * modules or earn certificates. */
export const TRAINING_MIN_TIER: TierId = "groei";

export function trainingUnlocked(plan: string | null | undefined): boolean {
  return tierRank(plan) >= tierRank(TRAINING_MIN_TIER);
}

/** Incident reporting (Meldingen, Art 73) is a paid feature from Compliance
 * (groei) — a serious-incident duty binds high-risk DEPLOYERS, who are recommended
 * this tier (same level as FRIA / risicobeoordeling). Basis and below see the page
 * as a teaser but can't log or manage meldingen. Deliberately NOT Audit-only:
 * that would withhold a legally-required tool from a customer told to buy Compliance. */
export const INCIDENTS_MIN_TIER: TierId = "groei";

export function incidentsUnlocked(plan: string | null | undefined): boolean {
  return tierRank(plan) >= tierRank(INCIDENTS_MIN_TIER);
}

/** Notification & explanation register (Kennisgevingen — Art 26(7), 26(11), 86)
 * is a paid feature from Compliance (groei). These are high-risk DEPLOYER duties
 * (inform workers / inform affected persons / answer a right-to-explanation
 * request), so they sit at the same tier a high-risk deployer is recommended.
 * Deliberately NOT Audit-only — see INCIDENTS_MIN_TIER. */
export const NOTICES_MIN_TIER: TierId = "groei";

export function noticesUnlocked(plan: string | null | undefined): boolean {
  return tierRank(plan) >= tierRank(NOTICES_MIN_TIER);
}
