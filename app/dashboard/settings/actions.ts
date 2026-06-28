"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { sendEmail } from "@/lib/resend";
import { env } from "@/lib/env";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const profileSchema = z.object({
  name: z.string().min(2, "Bedrijfsnaam is verplicht."),
  size: z.string().optional(),
  sector: z.string().optional(),
  country: z.string().min(2, "Land is verplicht."),
  logoUrl: z
    .string()
    .url("Voer een geldige URL in.")
    .optional()
    .or(z.literal("")),
});

export async function updateCompanyProfile(input: {
  name: string;
  size?: string;
  sector?: string;
  country?: string;
  logoUrl?: string;
}): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }
  const { company } = await getActiveCompany();
  try {
    await prisma.company.update({
      where: { id: company.id },
      data: { ...parsed.data, logoUrl: parsed.data.logoUrl || null },
    });
  } catch {
    return { ok: false, error: "Opslaan mislukt." };
  }
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Bedrijfsprofiel opgeslagen." };
}

const roleSchema = z.enum(["admin", "manager", "employee"]);

export async function updateMemberRole(
  userId: string,
  role: string
): Promise<ActionResult> {
  const parsed = roleSchema.safeParse(role);
  if (!parsed.success) return { ok: false, error: "Onbekende rol." };

  const { company } = await getActiveCompany();
  try {
    const res = await prisma.user.updateMany({
      where: { id: userId, companyId: company.id },
      data: { role: parsed.data },
    });
    if (res.count === 0) return { ok: false, error: "Teamlid niet gevonden." };
  } catch {
    return { ok: false, error: "Rol bijwerken mislukt." };
  }
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

const inviteSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in."),
  name: z.string().optional(),
  role: roleSchema,
});

export async function inviteMember(input: {
  email: string;
  name?: string;
  role: string;
}): Promise<ActionResult> {
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }
  const { company } = await getActiveCompany();

  // Sends an invitation email (logged to console in stub mode). Account creation
  // happens when the invitee signs up; once Supabase admin invites are wired
  // this can pre-provision the user.
  const result = await sendEmail({
    to: parsed.data.email,
    subject: `Uitnodiging voor ${company.name} op ComplAI`,
    html: `<p>U bent uitgenodigd om deel te nemen aan <strong>${company.name}</strong> op ComplAI als <strong>${parsed.data.role}</strong>.</p>
           <p><a href="${env.appUrl}/signup">Maak uw account aan</a> om te beginnen.</p>`,
  });

  return {
    ok: true,
    message: result.stubbed
      ? `Uitnodiging klaargezet voor ${parsed.data.email} (e-mail is gelogd; voeg RESEND_API_KEY toe om echt te versturen).`
      : `Uitnodiging verzonden naar ${parsed.data.email}.`,
  };
}
