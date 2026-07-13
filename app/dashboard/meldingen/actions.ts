"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getActiveCompany, canAdminister } from "@/lib/auth";
import { incidentsUnlocked, TIER_LABEL, INCIDENTS_MIN_TIER } from "@/lib/plan";

/** Only a beheerder (or ComplAI super-admin) may manage incident reports. */
const NOT_ADMIN = "Alleen de beheerder kan meldingen beheren.";

/** Empty string / null → undefined, so optional date fields aren't coerced to an
 *  Invalid Date. */
const optionalDate = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.date().optional()
);

const schema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Titel is verplicht."),
  description: z.string().optional().default(""),
  category: z.enum([
    "health",
    "critical_infra",
    "fundamental_rights",
    "property_env",
  ]),
  involvesDeath: z.boolean().default(false),
  widespread: z.boolean().default(false),
  awareAt: z.coerce.date({ message: "Vul de datum in waarop u zich bewust werd." }),
  occurredAt: optionalDate,
  status: z.enum(["open", "reported", "closed"]).default("open"),
  reportedAt: optionalDate,
  reference: z.string().optional().default(""),
});

export type IncidentInput = z.input<typeof schema>;
export type ActionResult = { ok: true } | { ok: false; error: string };

export async function upsertIncident(input: IncidentInput): Promise<ActionResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }
  const { id, occurredAt, reportedAt, ...rest } = parsed.data;
  const { company, user } = await getActiveCompany();
  if (!canAdminister(user)) return { ok: false, error: NOT_ADMIN };

  if (!incidentsUnlocked(company.plan)) {
    return {
      ok: false,
      error: `Incidentmeldingen zijn beschikbaar vanaf het pakket ${TIER_LABEL[INCIDENTS_MIN_TIER]}. Upgrade om meldingen vast te leggen.`,
    };
  }

  const data = {
    ...rest,
    occurredAt: occurredAt ?? null,
    reportedAt: reportedAt ?? null,
  };

  try {
    if (id) {
      // Scope the update to the active company so meldingen can't be edited cross-tenant.
      const result = await prisma.incident.updateMany({
        where: { id, companyId: company.id },
        data,
      });
      if (result.count === 0) return { ok: false, error: "Melding niet gevonden." };
    } else {
      await prisma.incident.create({ data: { ...data, companyId: company.id } });
    }
  } catch {
    return { ok: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }

  revalidatePath("/dashboard/meldingen");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteIncident(id: string): Promise<ActionResult> {
  const { company, user } = await getActiveCompany();
  if (!canAdminister(user)) return { ok: false, error: NOT_ADMIN };
  try {
    await prisma.incident.deleteMany({ where: { id, companyId: company.id } });
  } catch {
    return { ok: false, error: "Verwijderen mislukt." };
  }
  revalidatePath("/dashboard/meldingen");
  revalidatePath("/dashboard");
  return { ok: true };
}
