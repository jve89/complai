import type { Company, Employee } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/auth";

/**
 * Resolves which Employee record the current learner maps to.
 *  - signed-in user → their linked employee (created on first use)
 *  - demo mode (no user) → the first employee who is mid-way through training
 *    (so the module list shows real progress), else the first unfinished one;
 *    falls back to any/created employee.
 */
export async function getLearnerEmployee(
  company: Company,
  user: CurrentUser | null
): Promise<Employee> {
  if (user) {
    // Employee's learning path mirrors their account role (employee/manager/admin),
    // so it lines up with the invite roles and the PATHS ids.
    const role = user.profile?.role ?? "employee";
    const name = user.profile?.name ?? user.email ?? "Gebruiker";

    const existing = await prisma.employee.findUnique({
      where: { userId: user.id },
    });
    if (existing) {
      // Keep the learning path (and name) in sync with the current account role —
      // older records may still carry a role from before the role unification.
      if (existing.role !== role || (user.profile?.name && existing.name !== name)) {
        return prisma.employee.update({
          where: { id: existing.id },
          data: { role, ...(user.profile?.name ? { name } : {}) },
        });
      }
      return existing;
    }

    return prisma.employee.create({
      data: {
        companyId: company.id,
        userId: user.id,
        name,
        role,
      },
    });
  }

  const incompletes = await prisma.employee.findMany({
    where: { companyId: company.id, trainingCompleted: false },
    orderBy: { createdAt: "asc" },
    include: { trainingCompletions: { select: { id: true } } },
  });
  // Prefer someone already mid-way so the module list shows finished modules.
  const learner =
    incompletes.find((e) => e.trainingCompletions.length > 0) ?? incompletes[0];
  if (learner) return learner;

  const any = await prisma.employee.findFirst({
    where: { companyId: company.id },
    orderBy: { createdAt: "asc" },
  });
  if (any) return any;

  return prisma.employee.create({
    data: { companyId: company.id, name: "Demo Gebruiker", role: "employee" },
  });
}
