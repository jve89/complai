"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getActiveCompany, canAdminister } from "@/lib/auth";
import { registerUnlocked, registerLimit, TIER_LABEL, REGISTER_MIN_TIER } from "@/lib/plan";

/** Only a beheerder (or ComplAI super-admin) may edit the AI-register. */
const NOT_ADMIN = "Alleen de beheerder kan het AI-register wijzigen.";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Naam is verplicht."),
  description: z.string().optional().default(""),
  vendor: z.string().optional().default(""),
  role: z.enum(["provider", "deployer"]),
  riskLevel: z.enum(["minimal", "limited", "high", "unacceptable"]),
  status: z.enum(["active", "review", "retired"]),
  oversightEmployeeId: z.string().nullable().optional(), // Art 26(2) — human-oversight assignee
});

export type AiSystemInput = z.input<typeof schema>;
export type ActionResult = { ok: true } | { ok: false; error: string };

export async function upsertAiSystem(
  input: AiSystemInput
): Promise<ActionResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }
  const { id, ...data } = parsed.data;
  const { company, user } = await getActiveCompany();
  if (!canAdminister(user)) return { ok: false, error: NOT_ADMIN };

  // Register is a paid feature: on the free tier existing rows can be viewed and
  // deleted, but not added or edited. (Delete stays open — see deleteAiSystem.)
  if (!registerUnlocked(company.plan)) {
    return {
      ok: false,
      error: `Het AI-register is beschikbaar vanaf het pakket ${TIER_LABEL[REGISTER_MIN_TIER]}. Upgrade om systemen toe te voegen of te bewerken.`,
    };
  }

  // Human-oversight assignee (Art 26(2)) must be one of this company's own
  // employees; ignore anything that isn't.
  let oversightEmployeeId = data.oversightEmployeeId || null;
  if (oversightEmployeeId) {
    const emp = await prisma.employee.findFirst({
      where: { id: oversightEmployeeId, companyId: company.id },
      select: { id: true },
    });
    if (!emp) oversightEmployeeId = null;
  }
  const record = { ...data, oversightEmployeeId };

  try {
    if (id) {
      // Scope the update to the active company so systems can't be edited cross-tenant.
      const result = await prisma.aiSystem.updateMany({
        where: { id, companyId: company.id },
        data: record,
      });
      if (result.count === 0) {
        return { ok: false, error: "Systeem niet gevonden." };
      }
    } else {
      // Enforce the per-tier system cap when adding a NEW system.
      const limit = registerLimit(company.plan);
      const count = await prisma.aiSystem.count({ where: { companyId: company.id } });
      if (count >= limit) {
        return {
          ok: false,
          error:
            limit === 0
              ? `Het AI-register is beschikbaar vanaf het pakket ${TIER_LABEL[REGISTER_MIN_TIER]}.`
              : `U heeft het maximum van ${limit} AI-systemen voor uw pakket bereikt. Upgrade voor meer ruimte.`,
        };
      }
      await prisma.aiSystem.create({
        data: { ...record, companyId: company.id },
      });
    }
  } catch {
    return { ok: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }

  revalidatePath("/dashboard/register");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteAiSystem(id: string): Promise<ActionResult> {
  const { company, user } = await getActiveCompany();
  if (!canAdminister(user)) return { ok: false, error: NOT_ADMIN };
  try {
    await prisma.aiSystem.deleteMany({ where: { id, companyId: company.id } });
  } catch {
    return { ok: false, error: "Verwijderen mislukt." };
  }
  revalidatePath("/dashboard/register");
  revalidatePath("/dashboard");
  return { ok: true };
}
