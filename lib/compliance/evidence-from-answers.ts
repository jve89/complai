// Turns the self-reported readiness answers (Sectie 6) into the CompanyEvidence
// shape the resolver reads — so a public, no-account scan still produces a real,
// non-zero gereedheidsscore that reflects what the company has actually done.
//
// ja → done (full credit) · deels → in_progress (half credit) · nee/absent → open.
// These are the user's own, UNVERIFIED claims; for logged-in companies we merge
// them with real DB evidence (mergeEvidence), and the DB wins.

import type { ScanAnswers } from "@/lib/compliance/questions";
import type { CompanyEvidence } from "@/lib/compliance/types";

// Readiness keys → the document slug(s) they attest to. (training & register are
// handled separately because they resolve via different evidence kinds.)
const SLUG_MAP: Record<string, string[]> = {
  policy: ["ai_policy"],
  transparency: ["transparency"],
  riskAssessment: ["risk_assessment"],
  oversight: ["risk_assessment"], // part of Art. 26 deployer obligations
  logging: ["risk_assessment"], // idem
  fria: ["fria"],
  techDoc: ["tech_doc"],
};

export function evidenceFromAnswers(answers: ScanAnswers): CompanyEvidence {
  const r = (answers.readiness ?? {}) as Record<string, string | undefined>;
  const full = new Set<string>();
  const partial = new Set<string>();

  for (const key of Object.keys(SLUG_MAP)) {
    const v = r[key];
    if (v === "ja") SLUG_MAP[key].forEach((s) => full.add(s));
    else if (v === "deels") SLUG_MAP[key].forEach((s) => partial.add(s));
  }
  // A slug claimed fully anywhere shouldn't also count as partial.
  partial.forEach((s) => {
    if (full.has(s)) partial.delete(s);
  });

  // Training (Art. 4): ja → fully trained, deels → in progress, nee → none.
  let employeesTotal = 0;
  let employeesTrained = 0;
  if (answers.readiness?.training === "ja") {
    employeesTotal = 1;
    employeesTrained = 1;
  } else if (answers.readiness?.training === "deels") {
    employeesTotal = 2;
    employeesTrained = 1;
  }

  const reg = answers.readiness?.register;
  const systemsRegistered = reg === "ja" || reg === "deels" ? 1 : 0;

  return {
    documentSlugs: Array.from(full),
    partialDocumentSlugs: Array.from(partial),
    systemsRegistered,
    employeesTotal,
    employeesTrained,
    completedTrainingPaths: [],
  };
}

/** Merge self-reported answer-evidence with real DB evidence; DB facts win. */
export function mergeEvidence(
  fromAnswers: CompanyEvidence,
  fromDb: CompanyEvidence
): CompanyEvidence {
  const uniq = (a: string[], b: string[]) => Array.from(new Set([...a, ...b]));
  return {
    documentSlugs: uniq(fromDb.documentSlugs, fromAnswers.documentSlugs),
    partialDocumentSlugs: uniq(
      fromDb.partialDocumentSlugs ?? [],
      fromAnswers.partialDocumentSlugs ?? []
    ),
    systemsRegistered: Math.max(fromDb.systemsRegistered, fromAnswers.systemsRegistered),
    employeesTotal: Math.max(fromDb.employeesTotal, fromAnswers.employeesTotal),
    employeesTrained: Math.max(fromDb.employeesTrained, fromAnswers.employeesTrained),
    completedTrainingPaths: uniq(
      fromDb.completedTrainingPaths,
      fromAnswers.completedTrainingPaths
    ),
  };
}
