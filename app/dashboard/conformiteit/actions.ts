"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getActiveCompany, canAdminister } from "@/lib/auth";
import { conformityUnlocked, TIER_LABEL, CONFORMITY_MIN_TIER } from "@/lib/plan";
import { STEP_KEYS, type StepKey, type StepsMap } from "@/lib/conformiteit/labels";

/** Only a beheerder (or ComplAI super-admin) may edit the conformity tracker. */
const NOT_ADMIN = "Alleen de beheerder kan de conformiteitsbeoordeling wijzigen.";

const optionalDate = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.date().optional()
);

const schema = z.object({
  aiSystemId: z.string().min(1, "Systeem ontbreekt."),
  route: z.enum(["internal", "notified_body"]).default("internal"),
  steps: z.record(z.string(), z.enum(["todo", "in_progress", "done"])).default({}),
  notes: z.string().optional().default(""),
  reviewedAt: optionalDate,
});

export type ConformityInput = z.input<typeof schema>;
export type ActionResult = { ok: true } | { ok: false; error: string };

export async function upsertConformityAssessment(
  input: ConformityInput
): Promise<ActionResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }
  const { aiSystemId, route, steps, notes, reviewedAt } = parsed.data;
  const { company, user } = await getActiveCompany();
  if (!canAdminister(user)) return { ok: false, error: NOT_ADMIN };

  if (!conformityUnlocked(company.plan)) {
    return {
      ok: false,
      error: `De conformiteitsbeoordeling is beschikbaar vanaf het pakket ${TIER_LABEL[CONFORMITY_MIN_TIER]}. Upgrade om de beoordeling vast te leggen.`,
    };
  }

  // The system must be one of this company's own — never trust a client id.
  const sys = await prisma.aiSystem.findFirst({
    where: { id: aiSystemId, companyId: company.id },
    select: { id: true },
  });
  if (!sys) return { ok: false, error: "Systeem niet gevonden." };

  // Keep only known step keys, so the JSON map can't be stuffed with junk.
  const cleanSteps: StepsMap = {};
  for (const k of STEP_KEYS) {
    const v = steps[k as StepKey];
    if (v) cleanSteps[k as StepKey] = v;
  }
  const stepsJson = cleanSteps as unknown as Prisma.InputJsonValue;

  try {
    await prisma.conformityAssessment.upsert({
      where: { aiSystemId },
      create: {
        companyId: company.id,
        aiSystemId,
        route,
        steps: stepsJson,
        notes: notes.trim() || null,
        reviewedAt: reviewedAt ?? null,
      },
      update: {
        route,
        steps: stepsJson,
        notes: notes.trim() || null,
        reviewedAt: reviewedAt ?? null,
      },
    });
  } catch {
    return { ok: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }

  revalidatePath("/dashboard/conformiteit");
  revalidatePath("/dashboard");
  return { ok: true };
}
