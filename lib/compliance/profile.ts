// buildProfile() — the public entry point. Turns a completed scan + company data
// into the canonical ComplianceProfile that every module reads.

import { classify } from "@/lib/compliance/engine";
import { OBLIGATION_CATALOG, makeObligation } from "@/lib/compliance/obligations";
import { resolveStatus } from "@/lib/compliance/resolve";
import { TIER_ORDER, minTierFor, tierRank } from "@/lib/plan";
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

/**
 * The recommended pakket = the LOWEST tier that unlocks every REQUIRED document,
 * derived from DOC_MIN_TIER so advice and gating can never contradict. Required
 * AI-literacy training is free (not a document), so an advisory-only company
 * (limited risk, no required docs) stays on the free tier.
 */
function recommendTier(requiredDocs: DocRequirement[], size?: string): TierId {
  let rank = 0; // gratis
  for (const doc of requiredDocs) {
    rank = Math.max(rank, tierRank(minTierFor(doc.slug)));
  }
  // 250+ employees bump one tier for admin/seat needs.
  if (size === "250+") rank += 1;
  return TIER_ORDER[Math.min(rank, TIER_ORDER.length - 1)];
}

export function buildProfile(
  answers: ScanAnswers,
  evidence: CompanyEvidence = EMPTY_EVIDENCE,
  now: Date = new Date()
): ComplianceProfile {
  const c = classify(answers);

  // Expand emitted codes → obligations (dedup by code; respect required override).
  const byCode = new Map<string, ObligationItem>();
  for (const { code, required, deadline } of c.emitted) {
    if (byCode.has(code)) continue;
    const overrides: Partial<ObligationItem> = {};
    if (required !== undefined) overrides.required = required;
    if (deadline) overrides.deadline = deadline;
    const item = makeObligation(code, Object.keys(overrides).length ? overrides : undefined);
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

  // ── Risk posture (headline) ───────────────────────────────────────────────
  const isProhibited = c.riskTiers.includes("prohibited");
  const isExcludedOrOut =
    c.riskTiers.includes("out_of_scope") || c.riskTiers.includes("excluded");

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

  // ── Gereedheidsscore ──────────────────────────────────────────────────────
  // Weighted over applicable REQUIRED obligations with partial credit, lifted off
  // a baseline floor so a fresh scan never reads a demotivating 0. The readiness
  // answers (mapped into evidence upstream) move this: done = full credit,
  // in_progress ("deels") = half. Minimal-risk paths start from a higher
  // baseline; prohibited is capped low; out-of-scope/excluded is a clean 100.
  const required = obligations.filter((o) => o.required);
  const credit = (s: ObligationItem["status"]) =>
    s === "done" ? 1 : s === "in_progress" ? 0.5 : 0;
  const raw = required.length
    ? required.reduce((sum, o) => sum + credit(o.status), 0) / required.length
    : 1;
  const baseline = headline === "minimal" ? 70 : 35;
  let score = Math.round(baseline + (100 - baseline) * raw);
  if (isProhibited) score = Math.min(score, 20);
  if (isExcludedOrOut && !isProhibited) score = 100;

  const level = score >= 75 ? "laag" : score >= 45 ? "gemiddeld" : "hoog";

  const recommendedTier = recommendTier(requiredDocs, answers.size);

  // Advisory upsell: limited today but adjacent to high-risk (carve-out claimed),
  // and only when the recommendation is actually below the suggested tier.
  let advisoryUpsell: AdvisoryUpsell | undefined;
  if (c.riskTiers.includes("high_notify") && tierRank(recommendedTier) < tierRank("groei")) {
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
