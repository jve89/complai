"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getActiveCompany, canAdminister } from "@/lib/auth";
import { complaintsUnlocked, TIER_LABEL, COMPLAINTS_MIN_TIER } from "@/lib/plan";

/** Only a beheerder (or ComplAI super-admin) may manage complaints. */
const NOT_ADMIN = "Alleen de beheerder kan klachten beheren.";

/** Empty string / null → undefined, so an optional date isn't coerced to Invalid Date. */
const optionalDate = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.date().optional()
);

const schema = z.object({
  id: z.string().optional(),
  subject: z.string().trim().min(1, "Onderwerp is verplicht."),
  description: z.string().optional().default(""),
  aiSystemId: z.string().nullable().optional(),
  complainant: z.string().optional().default(""),
  channel: z.string().optional().default(""),
  status: z.enum(["open", "in_progress", "resolved", "escalated"]).default("open"),
  receivedAt: z.coerce.date({ message: "Vul de datum van ontvangst in." }),
  resolution: z.string().optional().default(""),
  resolvedAt: optionalDate,
});

export type ComplaintInput = z.input<typeof schema>;
export type ActionResult = { ok: true } | { ok: false; error: string };

export async function upsertComplaint(input: ComplaintInput): Promise<ActionResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }
  const { id, aiSystemId: rawSystemId, resolvedAt, ...rest } = parsed.data;
  const { company, user, demo } = await getActiveCompany();
  if (demo) return { ok: false, error: "In de demo kunt u geen wijzigingen opslaan." };
  if (!canAdminister(user)) return { ok: false, error: NOT_ADMIN };

  if (!complaintsUnlocked(company.plan)) {
    return {
      ok: false,
      error: `Het klachtenregister is beschikbaar vanaf het pakket ${TIER_LABEL[COMPLAINTS_MIN_TIER]}. Upgrade om klachten vast te leggen.`,
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
      // Scope the update to the active company so klachten can't be edited cross-tenant.
      const result = await prisma.complaint.updateMany({
        where: { id, companyId: company.id },
        data,
      });
      if (result.count === 0) return { ok: false, error: "Klacht niet gevonden." };
    } else {
      await prisma.complaint.create({ data: { ...data, companyId: company.id } });
    }
  } catch {
    return { ok: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }

  revalidatePath("/dashboard/klachten");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteComplaint(id: string): Promise<ActionResult> {
  const { company, user, demo } = await getActiveCompany();
  if (demo) return { ok: false, error: "In de demo kunt u geen wijzigingen opslaan." };
  if (!canAdminister(user)) return { ok: false, error: NOT_ADMIN };
  try {
    await prisma.complaint.deleteMany({ where: { id, companyId: company.id } });
  } catch {
    return { ok: false, error: "Verwijderen mislukt." };
  }
  revalidatePath("/dashboard/klachten");
  revalidatePath("/dashboard");
  return { ok: true };
}
