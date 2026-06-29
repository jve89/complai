// buildProfile() — the public entry point. Turns a completed scan + company data
// into the canonical ComplianceProfile that every module reads.

import { classify } from "@/lib/compliance/engine";
import { OBLIGATION_CATALOG, makeObligation } from "@/lib/compliance/obligations";
import { resolveStatus } from "@/lib/compliance/resolve";
import type { ScanAnswers } from "@/lib/compliance/questions";
import type {
  AdvisoryUpsell,
  CompanyEvidence,
  ComplianceProfile,
  DocRequirement,
  ObligationItem,
  TierId,
  TrainingRequirement,
} from "@/lib/compliance/types";

export const PROFILE_VERSION = 1;

const EMPTY_EVIDENCE: CompanyEvidence = {
  documentSlugs: [],
  systemsRegistered: 0,
  employeesTotal: 0,
  employeesTrained: 0,
  completedTrainingPaths: [],
};

const DOC_LABELS: Record<string, string> = {
  ai_policy: "AI-beleid",
  transparency: "Transparantieverklaring",
  fria: "FRIA (grondrechtentoets)",
  risk_assessment: "Risicobeoordeling",
  tech_doc: "Technische documentatie (Annex IV)",
  doc_conformity: "EU-conformiteitsverklaring",
  assessment_record: "Beoordelingsdossier (Art. 6(4))",
  gpai_docs: "GPAI-documentatie",
};

function recommendTier(
  tiers: string[],
  flags: { gpaiModelProvider: boolean },
  roles: string[],
  size?: string
): TierId {
  const has = (t: string) => tiers.includes(t);
  const isProvider = roles.includes("provider");

  let tier: TierId;
  if (flags.gpaiModelProvider || (has("high") && isProvider)) tier = "schaal";
  else if (has("high") || has("high_notify")) tier = "groei";
  else if (has("limited")) tier = "starter";
  else tier = "gratis";

  // 250+ employees bump one tier for admin/seat needs.
  if (size === "250+") {
    const order: TierId[] = ["gratis", "starter", "groei", "schaal"];
    tier = order[Math.min(order.indexOf(tier) + 1, order.length - 1)];
  }
  return tier;
}

export function buildProfile(
  answers: ScanAnswers,
  evidence: CompanyEvidence = EMPTY_EVIDENCE,
  now: Date = new Date()
): ComplianceProfile {
  const c = classify(answers);

  // Expand emitted codes → obligations (dedup by code; respect required override).
  const byCode = new Map<string, ObligationItem>();
  for (const { code, required } of c.emitted) {
    if (byCode.has(code)) continue;
    const item = makeObligation(code, required === undefined ? undefined : { required });
    if (!item) continue;
    item.status = resolveStatus(code, evidence);
    byCode.set(code, item);
  }
  const obligations = Array.from(byCode.values());

  // Documents & training derived from obligations.
  const requiredDocs: DocRequirement[] = [];
  const recommendedDocs: DocRequirement[] = [];
  const requiredTraining: TrainingRequirement[] = [];
  const recommendedTraining: TrainingRequirement[] = [];
  const seenDoc = new Set<string>();

  for (const ob of obligations) {
    const entry = OBLIGATION_CATALOG[ob.code];
    if (!entry) continue;
    if (entry.evidenceKind === "document" && entry.docSlug && !seenDoc.has(entry.docSlug)) {
      seenDoc.add(entry.docSlug);
      const req: DocRequirement = {
        slug: entry.docSlug,
        required: ob.required,
        reason: ob.title,
      };
      (ob.required ? requiredDocs : recommendedDocs).push(req);
    }
    if (entry.evidenceKind === "training" && entry.trainingPath) {
      const req: TrainingRequirement = {
        pathSlug: entry.trainingPath,
        required: ob.required,
        reason: ob.title,
      };
      (ob.required ? requiredTraining : recommendedTraining).push(req);
    }
  }
  // AI policy is always advisable as a baseline.
  if (!seenDoc.has("ai_policy")) {
    recommendedDocs.push({
      slug: "ai_policy",
      required: false,
      reason: "Basis AI-beleid voor verantwoord gebruik",
    });
  }

  // Score = done required / total required (applicability-aware). Never "compliant".
  const required = obligations.filter((o) => o.required);
  const done = required.filter((o) => o.status === "done").length;
  let score = required.length ? Math.round((done / required.length) * 100) : 100;

  const isProhibited = c.riskTiers.includes("prohibited");
  const isExcludedOrOut =
    c.riskTiers.includes("out_of_scope") || c.riskTiers.includes("excluded");
  if (isProhibited) score = Math.min(score, 20);
  if (isExcludedOrOut && !isProhibited && required.length === 0) score = 100;

  const level = score >= 75 ? "laag" : score >= 45 ? "gemiddeld" : "hoog";

  const headline: ComplianceProfile["headline"] = isProhibited
    ? "prohibited"
    : c.riskTiers.includes("high") || c.riskTiers.includes("high_notify")
      ? "high_risk"
      : c.riskTiers.includes("limited")
        ? "limited_risk"
        : c.riskTiers.includes("out_of_scope")
          ? "out_of_scope"
          : c.riskTiers.includes("excluded")
            ? "excluded"
            : "minimal";

  const recommendedTier = recommendTier(
    c.riskTiers,
    c.systemFlags,
    c.entityRoles,
    answers.size
  );

  // Advisory upsell: limited today but adjacent to high-risk (carve-out claimed).
  let advisoryUpsell: AdvisoryUpsell | undefined;
  if (c.riskTiers.includes("high_notify") && recommendedTier !== "schaal") {
    advisoryUpsell = {
      toTier: "groei",
      reason:
        "U valt nu onder de Art. 6(3)-uitzondering en bent niet verplicht tot de volledige hoog-risico documentatie. Eén wijziging in het doel maakt het systeem hoog-risico. Wij adviseren Groei zodat FRIA en beleid al klaarstaan — niet verplicht, wel voorbereid.",
    };
  }

  const applicableArticles = Array.from(new Set(obligations.map((o) => o.article)));

  return {
    version: PROFILE_VERSION,
    computedAt: now.toISOString(),
    inScope: c.inScope,
    exclusions: c.exclusions,
    entityRoles: c.entityRoles,
    riskTiers: c.riskTiers,
    systemFlags: c.systemFlags,
    applicableArticles,
    obligations,
    documents: { required: requiredDocs, recommended: recommendedDocs },
    training: { required: requiredTraining, recommended: recommendedTraining },
    recommendedTier,
    advisoryUpsell,
    score,
    level,
    headline,
    caveats: [
      ...c.caveats,
      "Dit is beslissingsondersteuning, geen juridisch advies en geen garantie op naleving.",
    ],
  };
}
