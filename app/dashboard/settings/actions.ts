"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getActiveCompany, canAdminister, getCurrentUser } from "@/lib/auth";
import { DEMO_COMPANY_NAME } from "@/lib/demo";
import { deleteAuthUsers } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/resend";
import { inviteEmail } from "@/lib/email/templates";
import { userLimit } from "@/lib/plan";
import { rateLimitByIp } from "@/lib/rate-limit";
import { currentBaseUrl } from "@/lib/request-url";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Bedrijfsnaam is verplicht.")
    .refine(
      (n) => n.trim().toLowerCase() !== DEMO_COMPANY_NAME.toLowerCase(),
      "Deze bedrijfsnaam is niet beschikbaar."
    ),
  size: z.string().optional(),
  sector: z.string().optional(),
  country: z.string().min(2, "Land is verplicht."),
  logoUrl: z
    .string()
    .url("Voer een geldige URL in.")
    .optional()
    .or(z.literal("")),
  // Optional legal-identity fields — blank is fine (see schema).
  kvk: z.string().optional(),
  address: z.string().optional(),
  legalRepName: z.string().optional(),
  legalRepRole: z.string().optional(),
});

export async function updateCompanyProfile(input: {
  name: string;
  size?: string;
  sector?: string;
  country?: string;
  logoUrl?: string;
  kvk?: string;
  address?: string;
  legalRepName?: string;
  legalRepRole?: string;
}): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }
  const { company, user } = await getActiveCompany();
  if (!canAdminister(user)) {
    return { ok: false, error: "Alleen de beheerder kan het bedrijfsprofiel wijzigen." };
  }
  const d = parsed.data;
  try {
    await prisma.company.update({
      where: { id: company.id },
      data: {
        ...d,
        logoUrl: d.logoUrl || null,
        // Normalise empty strings to null so blanks stay truly blank.
        kvk: d.kvk?.trim() || null,
        address: d.address?.trim() || null,
        legalRepName: d.legalRepName?.trim() || null,
        legalRepRole: d.legalRepRole?.trim() || null,
      },
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

  // Never leave a company without a beheerder: block demoting its last admin
  // (there'd be no in-app way to invite members, manage billing, or edit the
  // profile — recovery would need ComplAI support).
  const target = await prisma.user.findFirst({
    where: { id: userId, companyId: company.id },
    select: { role: true },
  });
  if (!target) return { ok: false, error: "Teamlid niet gevonden." };
  if (target.role === "admin" && parsed.data !== "admin") {
    const otherAdmins = await prisma.user.count({
      where: { companyId: company.id, role: "admin", id: { not: userId } },
    });
    if (otherAdmins === 0) {
      return { ok: false, error: "Er moet minstens één beheerder overblijven." };
    }
  }

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
  // Cap invite volume (a compromised/over-eager admin session can't fire off a
  // burst of invite emails). Fails open on a limiter error.
  const rl = await rateLimitByIp("invite", 20, 3600);
  if (!rl.ok) return { ok: false, error: rl.error };
  const { company } = ctx;
  const email = parsed.data.email.toLowerCase();
  // Optional: the admin may prefill the invitee's name. Stored to prefill the
  // signup form; the invitee's own entry there stays authoritative.
  const name = parsed.data.name?.trim() || null;

  // Don't invite someone who is already a member.
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.companyId === company.id) {
    return { ok: false, error: "Deze persoon is al lid van uw team." };
  }

  // Enforce the per-tier team-size cap: current members + still-open invites.
  const limit = userLimit(company.plan);
  if (limit !== Infinity) {
    const [members, pending] = await Promise.all([
      prisma.user.count({ where: { companyId: company.id } }),
      prisma.invite.count({
        where: {
          companyId: company.id,
          accepted: false,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      }),
    ]);
    if (members + pending >= limit) {
      return {
        ok: false,
        error: `Uw pakket staat maximaal ${limit} teamleden toe. Upgrade om meer collega's uit te nodigen.`,
      };
    }
  }

  // Create a pending invite with a token; the invitee joins this company + role
  // when they sign up via /signup?invite=<token>.
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
  try {
    await prisma.invite.create({
      data: { email, name, role: parsed.data.role, token, companyId: company.id, expiresAt },
    });
  } catch {
    return { ok: false, error: "Uitnodiging aanmaken mislukt." };
  }

  const link = `${currentBaseUrl()}/signup?invite=${token}`;
  const { subject, html } = inviteEmail({
    companyName: company.name,
    roleLabel: ROLE_LABEL[parsed.data.role] ?? parsed.data.role,
    url: link,
  });

  // Never let a Resend error throw the action: the invite row already exists, so
  // report a partial success rather than a silent failure the admin can't see.
  let emailed = false;
  let stubbed = false;
  try {
    const result = await sendEmail({ to: email, subject, html });
    emailed = true;
    stubbed = result.stubbed;
  } catch (e) {
    console.error("[invite] e-mail verzenden mislukt:", e instanceof Error ? e.message : e);
  }

  return {
    ok: true,
    message: !emailed
      ? `Uitnodiging aangemaakt, maar de e-mail kon niet worden verzonden. Probeer het later opnieuw.`
      : stubbed
        ? `Uitnodiging klaargezet voor ${email} (e-mail is gelogd; voeg RESEND_API_KEY toe om echt te versturen).`
        : `Uitnodiging verzonden naar ${email}.`,
  };
}

/**
 * Permanently removes a colleague: their Supabase auth login + User row +
 * linked e-learning record. Admin-only, scoped to the caller's own company.
 * Cannot remove yourself, nor the company's last beheerder (that would leave
 * the org with no one able to manage it). Scans they ran stay (attributed to
 * nobody) and any high-risk oversight assignment is cleared — both via
 * onDelete: SetNull, so no company data is lost.
 */
export async function removeMember(userId: string): Promise<ActionResult> {
  const ctx = await requireAdmin();
  if (!ctx) return { ok: false, error: "Alleen een beheerder kan collega's verwijderen." };
  const { company, user } = ctx;

  if (userId === user.id) {
    return { ok: false, error: "U kunt uzelf niet verwijderen." };
  }

  const target = await prisma.user.findFirst({
    where: { id: userId, companyId: company.id },
    select: { role: true, email: true },
  });
  if (!target) return { ok: false, error: "Collega niet gevonden." };

  // Never leave the company without a beheerder.
  if (target.role === "admin") {
    const otherAdmins = await prisma.user.count({
      where: { companyId: company.id, role: "admin", id: { not: userId } },
    });
    if (otherAdmins === 0) {
      return { ok: false, error: "Er moet minstens één beheerder overblijven." };
    }
  }

  console.error(
    `[team-audit] ${user.email} verwijdert collega ${target.email} (${userId}) uit ${company.name}`
  );
  // DB rows first, atomically; then the irreversible external auth deletion —
  // so a mid-sequence failure can't orphan a roster row that can never log in.
  try {
    await prisma.$transaction([
      prisma.employee.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);
  } catch {
    return { ok: false, error: "Collega verwijderen mislukt." };
  }
  await deleteAuthUsers([userId]);

  revalidatePath("/dashboard/team");
  return { ok: true, message: "Collega verwijderd." };
}

/** Intrekken van een openstaande uitnodiging. Admin-only, scoped to the
 * caller's company so one company can't touch another's invites. */
export async function revokeInvite(inviteId: string): Promise<ActionResult> {
  const ctx = await requireAdmin();
  if (!ctx) return { ok: false, error: "Alleen een beheerder kan uitnodigingen intrekken." };
  const { company } = ctx;

  const res = await prisma.invite.deleteMany({
    where: { id: inviteId, companyId: company.id, accepted: false },
  });
  if (res.count === 0) return { ok: false, error: "Uitnodiging niet gevonden." };

  revalidatePath("/dashboard/team");
  return { ok: true, message: "Uitnodiging ingetrokken." };
}

// ── Personal account (self-service, every signed-in user) ───────────────────
// Not admin-gated: any user manages their own name and password. These never
// touch company-level data.

export async function updateOwnName(name: string): Promise<ActionResult> {
  const trimmed = name.trim();
  if (trimmed.length < 2) return { ok: false, error: "Naam is te kort." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Log in om uw gegevens te wijzigen." };

  try {
    await prisma.user.updateMany({ where: { id: user.id }, data: { name: trimmed } });
    // Keep the linked employee (learning/certificate) record in sync.
    await prisma.employee.updateMany({ where: { userId: user.id }, data: { name: trimmed } });
  } catch {
    return { ok: false, error: "Naam bijwerken mislukt." };
  }
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Naam opgeslagen." };
}

export async function updateOwnPassword(password: string): Promise<ActionResult> {
  if (password.length < 8) {
    return { ok: false, error: "Wachtwoord moet minstens 8 tekens bevatten." };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Log in om uw wachtwoord te wijzigen." };

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: "Wachtwoord bijwerken mislukt." };

  return { ok: true, message: "Wachtwoord bijgewerkt." };
}
