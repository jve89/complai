// Builds the CompanyEvidence snapshot the resolver checks obligations against —
// real documents, registered systems and training, so the profile reflects what
// the company has actually done.

import { prisma } from "@/lib/prisma";
import type { CompanyEvidence } from "@/lib/compliance/types";

/**
 * Build the CompanyEvidence snapshot from already-loaded rows. Pure — the SINGLE
 * source of the evidence shape, shared by buildEvidence() (which queries) and by
 * callers that already hold the data (the dashboard), so the two can never drift.
 */
export function evidenceFromData(data: {
  documents: { type: string }[];
  systemsRegistered: number;
  employees: { trainingCompleted: boolean; role: string }[];
}): CompanyEvidence {
  const trained = data.employees.filter((e) => e.trainingCompleted);
  return {
    documentSlugs: Array.from(new Set(data.documents.map((d) => d.type))),
    systemsRegistered: data.systemsRegistered,
    employeesTotal: data.employees.length,
    employeesTrained: trained.length,
    completedTrainingPaths: Array.from(new Set(trained.map((e) => e.role))),
  };
}

export async function buildEvidence(companyId: string): Promise<CompanyEvidence> {
  const [documents, systemsRegistered, employees] = await Promise.all([
    prisma.document.findMany({ where: { companyId }, select: { type: true } }),
    prisma.aiSystem.count({ where: { companyId } }),
    prisma.employee.findMany({
      where: { companyId },
      select: { trainingCompleted: true, role: true },
    }),
  ]);
  return evidenceFromData({ documents, systemsRegistered, employees });
}
