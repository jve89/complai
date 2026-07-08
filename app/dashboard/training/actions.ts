"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { getLearnerEmployee } from "@/lib/training/learner";
import { getModule, modulesForPath, PASS_FRACTION, isCorrect } from "@/lib/training/content";
import { trainingUnlocked, TIER_LABEL, TRAINING_MIN_TIER } from "@/lib/plan";

/** A single answered question: `q` is the index into the module's bank, `selected`
 *  the chosen option indices (one for single-answer, one or more for multi). */
export type QuizAttempt = { q: number; selected: number[] };

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
  attempts: QuizAttempt[]
): Promise<CompleteResult> {
  const mod = getModule(moduleId);
  if (!mod) return { ok: false, error: "Onbekende module." };

  // Score is recomputed server-side from the questions actually asked, so it
  // can't be spoofed by the client (which never receives the correct answers).
  const asked = attempts.filter((a) => mod.quiz[a.q]);
  const score = asked.reduce(
    (n, a) => n + (isCorrect(mod.quiz[a.q], a.selected) ? 1 : 0),
    0
  );
  const total = asked.length;
  const passed = total > 0 && score / total >= PASS_FRACTION;

  const { company, user } = await getActiveCompany();

  // E-learning is a paid feature: on the free tier modules can't be completed.
  if (!trainingUnlocked(company.plan)) {
    return {
      ok: false,
      error: `E-learning is beschikbaar vanaf het pakket ${TIER_LABEL[TRAINING_MIN_TIER]}. Upgrade om modules te volgen.`,
    };
  }

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

    // "All done" = every module in THIS learner's path is completed.
    const completions = await prisma.trainingCompletion.findMany({
      where: { employeeId: employee.id },
      select: { moduleId: true },
    });
    const done = new Set(completions.map((c) => c.moduleId));
    const allDone = modulesForPath(employee.role).every((m) => done.has(m.id));
    // Sync both ways: if the path grew (new modules added), a previously
    // "complete" learner is no longer done until they finish the new ones.
    if (allDone !== employee.trainingCompleted) {
      await prisma.employee.update({
        where: { id: employee.id },
        data: { trainingCompleted: allDone },
      });
    }

    revalidatePath("/dashboard/training");
    revalidatePath("/dashboard");
    return { ok: true, passed: true, score, total, allDone, employeeId: employee.id };
  } catch {
    return { ok: false, error: "Opslaan van voortgang mislukt." };
  }
}
