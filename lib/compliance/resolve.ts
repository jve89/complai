// Resolves an obligation's status against the company's real data. This is what
// makes the dashboard reflect reality instead of seed data: a generated document,
// completed training, or a populated register marks the matching obligation done.

import { OBLIGATION_CATALOG } from "@/lib/compliance/obligations";
import type { CompanyEvidence, ObligationStatus } from "@/lib/compliance/types";

export function resolveStatus(
  code: string,
  evidence: CompanyEvidence
): ObligationStatus {
  const entry = OBLIGATION_CATALOG[code];
  if (!entry) return "open";

  switch (entry.evidenceKind) {
    case "document":
      return entry.docSlug && evidence.documentSlugs.includes(entry.docSlug)
        ? "done"
        : "open";
    case "training":
      // AI literacy is "done" when all (and at least one) employees are trained,
      // or the specific path is recorded as completed.
      if (entry.trainingPath && evidence.completedTrainingPaths.includes(entry.trainingPath))
        return "done";
      if (evidence.employeesTotal > 0 && evidence.employeesTrained >= evidence.employeesTotal)
        return "done";
      return evidence.employeesTrained > 0 ? "in_progress" : "open";
    case "register":
      return evidence.systemsRegistered > 0 ? "done" : "open";
    case "process":
    default:
      // Process obligations need a manual attestation we don't capture yet.
      return "open";
  }
}
