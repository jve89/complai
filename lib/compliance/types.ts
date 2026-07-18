// Canonical compliance domain model — the single source of truth the whole app
// reads. Built by lib/compliance/profile.ts from a completed scan + company data.
//
// IMPORTANT: this models the *logic* of Regulation (EU) 2024/1689 (the EU AI
// Act). It is decision support, NOT legal advice and NOT a guarantee of
// compliance. Several inputs are self-assessed booleans standing in for legal
// determinations that genuinely require human judgement (flagged via `caveats`).

export type EntityRole =
  | "provider"
  | "deployer"
  | "importer"
  | "distributor"
  | "product_manufacturer"
  | "authorised_representative";

/** Risk tiers a system/company can land in (a company can hold several). */
export type RiskTier =
  | "prohibited"
  | "high"
  | "high_notify" // Annex III area but Art. 6(3) carve-out claimed → docs/registration, not full high-risk
  | "limited" // Art. 50 transparency only
  | "minimal"
  | "out_of_scope"
  | "excluded";

export type ObligationStatus = "open" | "in_progress" | "done" | "not_applicable";

/** What kind of evidence resolves an obligation to "done". */
export type EvidenceKind = "document" | "training" | "register" | "process";

/** Needs-based pricing tiers (independent of the current Stripe plan ids; Phase 3 reconciles). */
export type TierId = "gratis" | "starter" | "groei" | "schaal";

export interface ObligationItem {
  code: string; // stable code, e.g. "ART_4_LITERACY"
  article: string; // e.g. "Art. 4", "Art. 26(6)"
  title: string; // Dutch label
  description: string; // Dutch plain-language explanation
  status: ObligationStatus;
  required: boolean; // true = legal requirement; false = advisory ("aanbevolen")
  evidenceKind?: EvidenceKind;
  /** ISO date when this obligation becomes/became applicable (Art. 113 timeline). */
  deadline?: string;
}

export interface DocRequirement {
  slug: string; // document type slug, e.g. "ai_policy", "fria"
  required: boolean;
  reason: string; // Dutch, why it applies
}

export interface TrainingRequirement {
  pathSlug: string; // learning-path id: "employee" | "manager" | "admin"
  required: boolean;
  reason: string;
}

export interface AdvisoryUpsell {
  toTier: TierId;
  reason: string; // Dutch, "aanbevolen, niet verplicht" rationale
}

/** Bumped when the ComplianceProfile shape changes. readProfile() treats a stored
 *  profile whose version differs as "needs a re-scan" rather than trusting a stale
 *  shape (see lib/compliance/read-profile.ts). */
export const PROFILE_VERSION = 1;

export interface ComplianceProfile {
  version: number; // schema version, for recompute migrations
  computedAt: string; // ISO
  inScope: boolean;
  exclusions: string[]; // EXCL_RESEARCH, EXCL_FOSS, EXCL_PERSONAL, ...
  entityRoles: EntityRole[]; // includes provider mutation if it fired (Art. 25)
  riskTiers: RiskTier[];
  systemFlags: {
    gpaiModelProvider: boolean; // provides a GPAI *model* (Art. 53/55) — not just uses one
    gpaiSystemic: boolean;
    profiling: boolean;
  };
  applicableArticles: string[]; // dedup union
  obligations: ObligationItem[];
  documents: { required: DocRequirement[]; recommended: DocRequirement[] };
  training: { required: TrainingRequirement[]; recommended: TrainingRequirement[] };
  recommendedTier: TierId;
  advisoryUpsell?: AdvisoryUpsell;
  /** 0–100 readiness ("gereedheid"), NOT a compliance verdict. */
  score: number;
  level: "laag" | "gemiddeld" | "hoog";
  /** Headline status for the dashboard banner. */
  headline:
    | "out_of_scope"
    | "excluded"
    | "prohibited"
    | "high_risk"
    | "high_notify" // Annex III area but a valid Art. 6(3) exemption is claimed → NOT high-risk
    | "limited_risk"
    | "minimal";
  /** Self-assessed simplifications the user should have reviewed by a lawyer. */
  caveats: string[];
}

/** Snapshot of company data the resolver checks obligations against. */
export interface CompanyEvidence {
  documentSlugs: string[]; // generated Document.type values (→ "done")
  /** Slugs the company reports as partially in place (→ "in_progress", half credit). */
  partialDocumentSlugs?: string[];
  systemsRegistered: number;
  employeesTotal: number;
  employeesTrained: number;
  completedTrainingPaths: string[];
}
