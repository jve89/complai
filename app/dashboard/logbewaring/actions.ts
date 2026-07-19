"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getActiveCompany, canAdminister } from "@/lib/auth";
import { logRetentionUnlocked, TIER_LABEL, LOG_RETENTION_MIN_TIER } from "@/lib/plan";

/** Only a beheerder (or ComplAI super-admin) may edit log-retention records. */
const NOT_ADMIN = "Alleen de beheerder kan de logbewaring wijzigen.";

/** Empty string / null → undefined, so an optional value isn't coerced to
 *  0 / Invalid Date. The inner schema is `.optional()` so the preprocessed
 *  undefined validates. */
const optionalMonths = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().int().min(0).max(1200).optional()
);
const optionalDate = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.date().optional()
);

const schema = z.object({
  id: z.string().min(1, "Systeem ontbreekt."),
  logLocation: z.string().optional().default(""),
  logRetentionMonths: optionalMonths,
  logRetentionOwner: z.string().optional().default(""),
  logReviewedAt: optionalDate,
});

export type LogRetentionInput = z.input<typeof schema>;
export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateLogRetention(input: LogRetentionInput): Promise<ActionResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }
  const { id, logLocation, logRetentionMonths, logRetentionOwner, logReviewedAt } = parsed.data;
  const { company, user, demo } = await getActiveCompany();
  if (demo) return { ok: false, error: "In de demo kunt u geen wijzigingen opslaan." };
  if (!canAdminister(user)) return { ok: false, error: NOT_ADMIN };

  if (!logRetentionUnlocked(company.plan)) {
    return {
      ok: false,
      error: `De logbewaring is beschikbaar vanaf het pakket ${TIER_LABEL[LOG_RETENTION_MIN_TIER]}. Upgrade om de logbewaring vast te leggen.`,
    };
  }

  try {
    // Scope the update to the active company so systems can't be edited cross-tenant.
    const result = await prisma.aiSystem.updateMany({
      where: { id, companyId: company.id },
      data: {
        logLocation: logLocation.trim() || null,
        logRetentionMonths: logRetentionMonths ?? null,
        logRetentionOwner: logRetentionOwner.trim() || null,
        logReviewedAt: logReviewedAt ?? null,
      },
    });
    if (result.count === 0) return { ok: false, error: "Systeem niet gevonden." };
  } catch {
    return { ok: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }

  revalidatePath("/dashboard/logbewaring");
  revalidatePath("/dashboard");
  return { ok: true };
}
