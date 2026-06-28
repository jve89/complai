"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { getLearnerEmployee } from "@/lib/training/learner";
import { getModule, MODULES, PASS_THRESHOLD } from "@/lib/training/content";

export type CompleteResult =
  | {
      ok: true;
      passed: boolean;
      score: number;
      total: number;
      allDone: boolean;
      employeeId: string;
    }
  | { ok: false; error: string };

/**
 * Records a module completion. The score is recomputed server-side from the
 * submitted answers so it can't be spoofed by the client.
 */
export async function completeModule(
  moduleId: string,
  answers: number[]
): Promise<CompleteResult> {
  const mod = getModule(moduleId);
  if (!mod) return { ok: false, error: "Onbekende module." };

  const score = mod.quiz.reduce(
    (n, q, i) => n + (answers[i] === q.answer ? 1 : 0),
    0
  );
  const total = mod.quiz.length;
  const passed = score >= PASS_THRESHOLD;

  const { company, user } = await getActiveCompany();
  const employee = await getLearnerEmployee(company, user);

  if (!passed) {
    return { ok: true, passed: false, score, total, allDone: false, employeeId: employee.id };
  }

  try {
    await prisma.trainingCompletion.upsert({
      where: { employeeId_moduleId: { employeeId: employee.id, moduleId } },
      update: { score, completedAt: new Date() },
      create: { companyId: company.id, employeeId: employee.id, moduleId, score },
    });

    const count = await prisma.trainingCompletion.count({
      where: { employeeId: employee.id },
    });
    const allDone = count >= MODULES.length;
    if (allDone && !employee.trainingCompleted) {
      await prisma.employee.update({
        where: { id: employee.id },
        data: { trainingCompleted: true },
      });
    }

    revalidatePath("/dashboard/training");
    revalidatePath("/dashboard");
    return { ok: true, passed: true, score, total, allDone, employeeId: employee.id };
  } catch {
    return { ok: false, error: "Opslaan van voortgang mislukt." };
  }
}
