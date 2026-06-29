// Builds the CompanyEvidence snapshot the resolver checks obligations against —
// real documents, registered systems and training, so the profile reflects what
// the company has actually done.

import { prisma } from "@/lib/prisma";
import type { CompanyEvidence } from "@/lib/compliance/types";

export async function buildEvidence(companyId: string): Promise<CompanyEvidence> {
  const [documents, systemsRegistered, employees] = await Promise.all([
    prisma.document.findMany({
      where: { companyId },
      select: { type: true },
    }),
    prisma.aiSystem.count({ where: { companyId } }),
    prisma.employee.findMany({
      where: { companyId },
      select: { trainingCompleted: true, role: true },
    }),
  ]);

  const employeesTrained = employees.filter((e) => e.trainingCompleted).length;

  return {
    documentSlugs: Array.from(new Set(documents.map((d) => d.type))),
    systemsRegistered,
    employeesTotal: employees.length,
    employeesTrained,
    completedTrainingPaths: Array.from(
      new Set(employees.filter((e) => e.trainingCompleted).map((e) => e.role))
    ),
  };
}
