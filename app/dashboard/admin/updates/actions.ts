"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export type UpdateActionResult = { ok: true; id: string } | { ok: false; error: string };

async function requireSuperAdmin() {
  const user = await getCurrentUser().catch(() => null);
  return user?.superAdmin ? user : null;
}

const schema = z
  .object({
    id: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Datum in formaat JJJJ-MM-DD."),
    title: z.string().trim().min(3, "Titel is te kort."),
    summary: z.string().trim().min(10, "Samenvatting is te kort."),
    detail: z.array(z.string()).default([]),
    category: z.enum([
      "deadline",
      "prohibition",
      "transparency",
      "gpai",
      "literacy",
      "enforcement",
    ]),
    sourceLabel: z.string().trim().min(2, "Bronlabel is verplicht."),
    sourceUrl: z.string().trim().url("Voer een geldige primaire bron-URL in (verplicht)."),
    affectsEveryone: z.boolean().default(false),
    affectsHighRisk: z.boolean().default(false),
    affectsProhibited: z.boolean().default(false),
    affectsLimited: z.boolean().default(false),
    affectsProvider: z.boolean().default(false),
    productImpact: z.string().optional(),
    recert: z.string().optional(),
    status: z.enum(["draft", "published"]).default("draft"),
  })
  .refine(
    (d) =>
      d.affectsEveryone ||
      d.affectsHighRisk ||
      d.affectsProhibited ||
      d.affectsLimited ||
      d.affectsProvider,
    { message: "Kies minstens één doelgroep." }
  );

/** ISO date (YYYY-MM-DD) for today — set as `addedAt` when first published so
 *  the daily email-cron picks the update up. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function revalidateAll() {
  revalidatePath("/dashboard/admin/updates");
  revalidatePath("/dashboard/updates");
  revalidatePath("/updates"); // public page (ISR)
}

export async function saveRegulatoryUpdate(input: unknown): Promise<UpdateActionResult> {
  if (!(await requireSuperAdmin())) return { ok: false, error: "Geen toegang." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }
  const d = parsed.data;
  const data = {
    date: d.date,
    title: d.title,
    summary: d.summary,
    detail: d.detail.map((s) => s.trim()).filter(Boolean),
    category: d.category,
    sourceLabel: d.sourceLabel,
    sourceUrl: d.sourceUrl,
    affectsEveryone: d.affectsEveryone,
    affectsHighRisk: d.affectsHighRisk,
    affectsProhibited: d.affectsProhibited,
    affectsLimited: d.affectsLimited,
    affectsProvider: d.affectsProvider,
    productImpact: d.productImpact?.trim() || null,
    recert: d.recert?.trim() || null,
    status: d.status,
  };

  try {
    if (d.id) {
      const existing = await prisma.regulatoryUpdate.findUnique({
        where: { id: d.id },
        select: { addedAt: true },
      });
      // Stamp addedAt on first publish only, so the cron notifies once.
      const stampAdded = d.status === "published" && !existing?.addedAt;
      const row = await prisma.regulatoryUpdate.update({
        where: { id: d.id },
        data: { ...data, ...(stampAdded ? { addedAt: today() } : {}) },
      });
      revalidateAll();
      return { ok: true, id: row.id };
    }
    const row = await prisma.regulatoryUpdate.create({
      data: { ...data, addedAt: d.status === "published" ? today() : null },
    });
    revalidateAll();
    return { ok: true, id: row.id };
  } catch {
    return { ok: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
}

export async function setRegulatoryUpdateStatus(
  id: string,
  status: "draft" | "published"
): Promise<UpdateActionResult> {
  if (!(await requireSuperAdmin())) return { ok: false, error: "Geen toegang." };
  const existing = await prisma.regulatoryUpdate.findUnique({
    where: { id },
    select: { addedAt: true },
  });
  const stampAdded = status === "published" && !existing?.addedAt;
  await prisma.regulatoryUpdate.update({
    where: { id },
    data: { status, ...(stampAdded ? { addedAt: today() } : {}) },
  });
  revalidateAll();
  return { ok: true, id };
}

export async function deleteRegulatoryUpdate(id: string): Promise<UpdateActionResult> {
  if (!(await requireSuperAdmin())) return { ok: false, error: "Geen toegang." };
  await prisma.regulatoryUpdate.deleteMany({ where: { id } });
  revalidateAll();
  return { ok: true, id };
}
