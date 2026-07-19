"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getActiveCompany, canAdminister } from "@/lib/auth";
import { noticesUnlocked, TIER_LABEL, NOTICES_MIN_TIER } from "@/lib/plan";

/** Only a beheerder (or ComplAI super-admin) may manage notices. */
const NOT_ADMIN = "Alleen de beheerder kan kennisgevingen beheren.";

/** Empty string / null → undefined, so an optional date isn't coerced to Invalid Date. */
const optionalDate = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.date().optional()
);

const schema = z.object({
  id: z.string().optional(),
  type: z.enum(["worker", "affected", "explanation"]),
  aiSystemId: z.string().nullable().optional(),
  recipient: z.string().trim().min(1, "Vul in wie u informeert."),
  method: z.string().optional().default(""),
  detail: z.string().optional().default(""),
  status: z.enum(["draft", "issued"]).default("draft"),
  issuedAt: optionalDate,
});

export type NoticeFormInput = z.input<typeof schema>;
export type ActionResult = { ok: true } | { ok: false; error: string };

export async function upsertNotice(input: NoticeFormInput): Promise<ActionResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }
  const { id, aiSystemId: rawSystemId, issuedAt, ...rest } = parsed.data;
  const { company, user, demo } = await getActiveCompany();
  if (demo) return { ok: false, error: "In de demo kunt u geen wijzigingen opslaan." };
  if (!canAdminister(user)) return { ok: false, error: NOT_ADMIN };

  if (!noticesUnlocked(company.plan)) {
    return {
      ok: false,
      error: `Kennisgevingen zijn beschikbaar vanaf het pakket ${TIER_LABEL[NOTICES_MIN_TIER]}. Upgrade om kennisgevingen vast te leggen.`,
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

  const data = {
    ...rest,
    aiSystemId,
    issuedAt: issuedAt ?? null,
  };

  try {
    if (id) {
      // Scope the update to the active company so notices can't be edited cross-tenant.
      const result = await prisma.notice.updateMany({
        where: { id, companyId: company.id },
        data,
      });
      if (result.count === 0) return { ok: false, error: "Kennisgeving niet gevonden." };
    } else {
      await prisma.notice.create({ data: { ...data, companyId: company.id } });
    }
  } catch {
    return { ok: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }

  revalidatePath("/dashboard/kennisgevingen");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteNotice(id: string): Promise<ActionResult> {
  const { company, user, demo } = await getActiveCompany();
  if (demo) return { ok: false, error: "In de demo kunt u geen wijzigingen opslaan." };
  if (!canAdminister(user)) return { ok: false, error: NOT_ADMIN };
  try {
    await prisma.notice.deleteMany({ where: { id, companyId: company.id } });
  } catch {
    return { ok: false, error: "Verwijderen mislukt." };
  }
  revalidatePath("/dashboard/kennisgevingen");
  revalidatePath("/dashboard");
  return { ok: true };
}
