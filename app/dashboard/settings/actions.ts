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

/** Team management (invite, roles, names) is admin-only. Returns the active
 * company + user when the current user is a Beheerder, else null. */
async function requireAdmin() {
  const { company, user, demo } = await getActiveCompany();
  if (demo || !user || user.profile?.role !== "admin") return null;
  return { company, user };
}

export async function updateMemberRole(
  userId: string,
  role: string
): Promise<ActionResult> {
  const parsed = roleSchema.safeParse(role);
  if (!parsed.success) return { ok: false, error: "Onbekende rol." };

  const ctx = await requireAdmin();
  if (!ctx) return { ok: false, error: "Alleen een beheerder kan rollen wijzigen." };
  const { company } = ctx;
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

export async function updateMemberName(
  userId: string,
  name: string
): Promise<ActionResult> {
  const trimmed = name.trim();
  if (trimmed.length < 2) return { ok: false, error: "Naam is te kort." };

  const ctx = await requireAdmin();
  if (!ctx) return { ok: false, error: "Alleen een beheerder kan teamleden beheren." };
  const { company } = ctx;
  try {
    const res = await prisma.user.updateMany({
      where: { id: userId, companyId: company.id },
      data: { name: trimmed },
    });
    if (res.count === 0) return { ok: false, error: "Teamlid niet gevonden." };
    // Keep the linked employee (learning) record in sync.
    await prisma.employee.updateMany({ where: { userId }, data: { name: trimmed } });
  } catch {
    return { ok: false, error: "Naam bijwerken mislukt." };
  }
  revalidatePath("/dashboard/team");
  return { ok: true };
}

const inviteSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in."),
  name: z.string().optional(),
  role: roleSchema,
});

const ROLE_LABEL: Record<string, string> = {
  admin: "Beheerder",
  manager: "Manager",
  employee: "Medewerker",
};

export async function inviteMember(input: {
  email: string;
  name?: string;
  role: string;
}): Promise<ActionResult> {
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }
  const ctx = await requireAdmin();
  if (!ctx) return { ok: false, error: "Alleen een beheerder kan teamleden uitnodigen." };
  const { company } = ctx;
  const email = parsed.data.email.toLowerCase();

  // Don't invite someone who is already a member.
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.companyId === company.id) {
    return { ok: false, error: "Deze persoon is al lid van uw team." };
  }

  // Create a pending invite with a token; the invitee joins this company + role
  // when they sign up via /signup?invite=<token>.
  const token = crypto.randomUUID();
  try {
    await prisma.invite.create({
      data: { email, role: parsed.data.role, token, companyId: company.id },
    });
  } catch {
    return { ok: false, error: "Uitnodiging aanmaken mislukt." };
  }

  const link = `${env.appUrl}/signup?invite=${token}`;
  const result = await sendEmail({
    to: email,
    subject: `Uitnodiging voor ${company.name} op ComplAI`,
    html: `<p>U bent uitgenodigd om deel te nemen aan <strong>${company.name}</strong> op ComplAI als <strong>${ROLE_LABEL[parsed.data.role] ?? parsed.data.role}</strong>.</p>
           <p><a href="${link}">Accepteer de uitnodiging en maak uw account aan</a>.</p>`,
  });

  return {
    ok: true,
    message: result.stubbed
      ? `Uitnodiging klaargezet voor ${email} (e-mail is gelogd; voeg RESEND_API_KEY toe om echt te versturen).`
      : `Uitnodiging verzonden naar ${email}.`,
  };
}
