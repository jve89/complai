import type { Company, Employee } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/auth";

/**
 * Resolves which Employee record the current learner maps to.
 *  - signed-in user → their linked employee (created on first use)
 *  - demo mode (no user) → the first employee who hasn't finished training yet,
 *    so progress is visible in the overview; falls back to any/created employee.
 */
export async function getLearnerEmployee(
  company: Company,
  user: CurrentUser | null
): Promise<Employee> {
  if (user) {
    const existing = await prisma.employee.findUnique({
      where: { userId: user.id },
    });
    if (existing) return existing;

    const path = user.profile?.role === "employee" ? "employee" : "manager";
    return prisma.employee.create({
      data: {
        companyId: company.id,
        userId: user.id,
        name: user.profile?.name ?? user.email ?? "Gebruiker",
        role: path,
      },
    });
  }

  const incomplete = await prisma.employee.findFirst({
    where: { companyId: company.id, trainingCompleted: false },
    orderBy: { createdAt: "asc" },
  });
  if (incomplete) return incomplete;

  const any = await prisma.employee.findFirst({
    where: { companyId: company.id },
    orderBy: { createdAt: "asc" },
  });
  if (any) return any;

  return prisma.employee.create({
    data: { companyId: company.id, name: "Demo Gebruiker", role: "employee" },
  });
}
