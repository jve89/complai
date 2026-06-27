"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Naam is verplicht."),
  description: z.string().optional().default(""),
  vendor: z.string().optional().default(""),
  role: z.enum(["provider", "deployer"]),
  riskLevel: z.enum(["minimal", "limited", "high", "unacceptable"]),
  status: z.enum(["active", "review", "retired"]),
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
  const { company } = await getActiveCompany();

  try {
    if (id) {
      // Scope the update to the active company so systems can't be edited cross-tenant.
      const result = await prisma.aiSystem.updateMany({
        where: { id, companyId: company.id },
        data,
      });
      if (result.count === 0) {
        return { ok: false, error: "Systeem niet gevonden." };
      }
    } else {
      await prisma.aiSystem.create({
        data: { ...data, companyId: company.id },
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
  const { company } = await getActiveCompany();
  try {
    await prisma.aiSystem.deleteMany({ where: { id, companyId: company.id } });
  } catch {
    return { ok: false, error: "Verwijderen mislukt." };
  }
  revalidatePath("/dashboard/register");
  revalidatePath("/dashboard");
  return { ok: true };
}
