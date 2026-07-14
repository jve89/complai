"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getActiveCompany, canAdminister } from "@/lib/auth";
import { correctiveUnlocked, TIER_LABEL, CORRECTIVE_MIN_TIER } from "@/lib/plan";

/** Only a beheerder (or ComplAI super-admin) may manage corrective actions. */
const NOT_ADMIN = "Alleen de beheerder kan corrigerende maatregelen beheren.";

const optionalDate = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.date().optional()
);

const schema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Onderwerp is verplicht."),
  nonConformity: z.string().optional().default(""),
  aiSystemId: z.string().nullable().optional(),
  actionType: z.enum(["bring_into_conformity", "withdraw", "disable", "recall"]).default(
    "bring_into_conformity"
  ),
  actionTaken: z.string().optional().default(""),
  informed: z.string().optional().default(""),
  presentsRisk: z.boolean().default(false),
  authorityInformed: z.boolean().default(false),
  status: z.enum(["open", "in_progress", "done"]).default("open"),
  identifiedAt: z.coerce.date({ message: "Vul de datum in waarop u de non-conformiteit vaststelde." }),
  resolvedAt: optionalDate,
});

export type CorrectiveInput = z.input<typeof schema>;
export type ActionResult = { ok: true } | { ok: false; error: string };

export async function upsertCorrectiveAction(input: CorrectiveInput): Promise<ActionResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }
  const { id, aiSystemId: rawSystemId, resolvedAt, ...rest } = parsed.data;
  const { company, user } = await getActiveCompany();
  if (!canAdminister(user)) return { ok: false, error: NOT_ADMIN };

  if (!correctiveUnlocked(company.plan)) {
    return {
      ok: false,
      error: `Corrigerende maatregelen zijn beschikbaar vanaf het pakket ${TIER_LABEL[CORRECTIVE_MIN_TIER]}. Upgrade om maatregelen vast te leggen.`,
    };
  }

  // The linked AI-system must be one of this company's own systems; ignore otherwise.
  let aiSystemId = rawSystemId || null;
  if (aiSystemId) {
    const sys = await prisma.aiSystem.findFirst({
      where: { id: aiSystemId, companyId: company.id },
      select: { id: true },
    });
    if (!sys) aiSystemId = null;
  }

  const data = { ...rest, aiSystemId, resolvedAt: resolvedAt ?? null };

  try {
    if (id) {
      // Scope the update to the active company so rows can't be edited cross-tenant.
      const result = await prisma.correctiveAction.updateMany({
        where: { id, companyId: company.id },
        data,
      });
      if (result.count === 0) return { ok: false, error: "Maatregel niet gevonden." };
    } else {
      await prisma.correctiveAction.create({ data: { ...data, companyId: company.id } });
    }
  } catch {
    return { ok: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }

  revalidatePath("/dashboard/corrigerend");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteCorrectiveAction(id: string): Promise<ActionResult> {
  const { company, user } = await getActiveCompany();
  if (!canAdminister(user)) return { ok: false, error: NOT_ADMIN };
  try {
    await prisma.correctiveAction.deleteMany({ where: { id, companyId: company.id } });
  } catch {
    return { ok: false, error: "Verwijderen mislukt." };
  }
  revalidatePath("/dashboard/corrigerend");
  revalidatePath("/dashboard");
  return { ok: true };
}
