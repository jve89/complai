"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, IMPERSONATE_COOKIE } from "@/lib/auth";
import { deleteAuthUsers } from "@/lib/supabase/admin";
import { TIER_ORDER } from "@/lib/plan";
import type { TierId } from "@/lib/compliance/types";

export type AdminResult = { ok: true } | { ok: false; error: string };

/** Guard: returns the current user only if they are a super-admin. */
async function requireSuperAdmin() {
  const user = await getCurrentUser().catch(() => null);
  if (!user?.superAdmin) return null;
  return user;
}

/**
 * Sets a client company's plan directly (no Stripe). Super-admin only. Used to
 * grant/adjust access manually. For paying clients Stripe stays authoritative
 * (the next webhook reconciles), except for staff companies which are exempt.
 */
export async function setCompanyPlan(
  companyId: string,
  plan: string
): Promise<AdminResult> {
  if (!(await requireSuperAdmin())) return { ok: false, error: "Geen toegang." };
  if (!TIER_ORDER.includes(plan as TierId)) {
    return { ok: false, error: "Onbekend pakket." };
  }

  await prisma.company.update({ where: { id: companyId }, data: { plan } });
  revalidatePath("/dashboard/admin");
  return { ok: true };
}

/** Promote the user with this email to super-admin (they must already have an
 * account). Super-admin only. */
export async function grantSuperAdmin(formData: FormData): Promise<void> {
  if (!(await requireSuperAdmin())) return;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return;

  const target = await prisma.user.findUnique({ where: { email } });
  if (target) {
    await prisma.user.update({ where: { id: target.id }, data: { superAdmin: true } });
  }
  revalidatePath("/dashboard/admin");
}

/** Revoke super-admin from a user. Super-admin only. Cannot revoke yourself
 * (avoids accidental self-lockout). Env-allowlist admins stay super-admin
 * regardless of this flag. */
export async function revokeSuperAdmin(formData: FormData): Promise<void> {
  const me = await requireSuperAdmin();
  if (!me) return;
  const userId = String(formData.get("userId") ?? "");
  if (!userId || userId === me.id) return;

  await prisma.user.update({ where: { id: userId }, data: { superAdmin: false } });
  revalidatePath("/dashboard/admin");
}

/** Grant/revoke super-admin by user id (from the Alle personen table). Cannot
 * change your own status. */
export async function setSuperAdmin(
  userId: string,
  value: boolean
): Promise<AdminResult> {
  const me = await requireSuperAdmin();
  if (!me) return { ok: false, error: "Geen toegang." };
  if (userId === me.id) {
    return { ok: false, error: "U kunt uw eigen super-admin-status niet wijzigen." };
  }
  const res = await prisma.user.updateMany({
    where: { id: userId },
    data: { superAdmin: value },
  });
  if (res.count === 0) return { ok: false, error: "Persoon niet gevonden." };
  revalidatePath("/dashboard/admin");
  return { ok: true };
}

/** Set a person's role within their company (beheerder/manager/medewerker).
 * Super-admin only; keeps the linked e-learning record in sync. */
export async function setUserRole(
  userId: string,
  role: string
): Promise<AdminResult> {
  if (!(await requireSuperAdmin())) return { ok: false, error: "Geen toegang." };
  if (!["admin", "manager", "employee"].includes(role)) {
    return { ok: false, error: "Onbekende rol." };
  }
  const typedRole = role as "admin" | "manager" | "employee";
  const res = await prisma.user.updateMany({
    where: { id: userId },
    data: { role: typedRole },
  });
  if (res.count === 0) return { ok: false, error: "Persoon niet gevonden." };
  await prisma.employee.updateMany({ where: { userId }, data: { role } });
  revalidatePath("/dashboard/admin");
  return { ok: true };
}

/** Enter (impersonate) a client's dashboard. Super-admin only; audit-logged. */
export async function startImpersonation(formData: FormData): Promise<void> {
  const me = await requireSuperAdmin();
  if (!me) return;
  const companyId = String(formData.get("companyId") ?? "");
  if (!companyId || companyId === me.company?.id) return;

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) return;

  await prisma.impersonationLog.create({
    data: {
      adminUserId: me.id,
      adminEmail: me.email,
      companyId: company.id,
      companyName: company.name,
    },
  });

  cookies().set(IMPERSONATE_COOKIE, company.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  redirect("/dashboard");
}

/** Leave impersonation and return to the super-admin's own environment. */
export async function stopImpersonation(): Promise<void> {
  cookies().delete(IMPERSONATE_COOKIE);
  redirect("/dashboard/admin");
}

/**
 * Permanently deletes a single person: their Supabase auth login + User row +
 * linked e-learning record. Super-admin only; cannot delete yourself.
 */
export async function deleteUser(formData: FormData): Promise<void> {
  const me = await requireSuperAdmin();
  if (!me) return;
  const userId = String(formData.get("userId") ?? "");
  if (!userId || userId === me.id) return;

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return;

  console.error(
    `[admin-audit] ${me.email} verwijdert gebruiker ${target.email} (${userId})`
  );
  // DB rows first, atomically; only then the irreversible external auth deletion.
  // If auth deletion fails after commit, the worst state is "auth exists, DB
  // gone" (self-heals on next login) instead of an orphaned User row that shows
  // in the roster but can never authenticate.
  await prisma.$transaction([
    prisma.employee.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
  await deleteAuthUsers([userId]);

  revalidatePath("/dashboard/admin");
}

/**
 * Permanently deletes a whole organisation: every member's auth login + all its
 * data (AI-register, documents, employees, compliance items, training,
 * invites cascade). Super-admin only; cannot delete your own organisation.
 */
export async function deleteCompany(formData: FormData): Promise<void> {
  const me = await requireSuperAdmin();
  if (!me) return;
  const companyId = String(formData.get("companyId") ?? "");
  if (!companyId || companyId === me.company?.id) return;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { users: { select: { id: true } } },
  });
  if (!company) return;

  console.error(
    `[admin-audit] ${me.email} verwijdert organisatie ${company.name} (${companyId}) met ${company.users.length} gebruiker(s)`
  );
  // DB deletes atomically (company.delete cascades its child data), then the
  // irreversible external auth deletion — so a mid-sequence failure can't leave
  // a company whose members' logins are gone but whose data still exists.
  await prisma.$transaction([
    prisma.user.deleteMany({ where: { companyId } }),
    prisma.company.delete({ where: { id: companyId } }),
  ]);
  await deleteAuthUsers(company.users.map((u) => u.id));

  revalidatePath("/dashboard/admin");
}

/**
 * Resets a company's product data to a fresh state WITHOUT deleting logins:
 * clears its scans, generated documents, AI-register, compliance items and
 * e-learning progress, and wipes the derived compliance snapshot
 * (profileJson/roles/tiers) + the onboarding dismissal. Keeps the users
 * (logins), the team roster (employees), and the plan/Stripe billing.
 *
 * Super-admin only; type-to-confirm on the client. Unlike deleteCompany this is
 * allowed on your OWN organisation — it never touches your login — which is how
 * you start a test account over. The demo company is excluded (re-seed resets it).
 */
export async function resetCompanyData(formData: FormData): Promise<void> {
  const me = await requireSuperAdmin();
  if (!me) return;
  const companyId = String(formData.get("companyId") ?? "");
  if (!companyId) return;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true },
  });
  if (!company) return;

  console.error(
    `[admin-audit] ${me.email} reset de gegevens van organisatie ${company.name} (${companyId})`
  );

  await prisma.$transaction([
    prisma.trainingCompletion.deleteMany({ where: { companyId } }),
    prisma.document.deleteMany({ where: { companyId } }),
    prisma.aiSystem.deleteMany({ where: { companyId } }),
    prisma.complianceItem.deleteMany({ where: { companyId } }),
    prisma.scanResult.deleteMany({ where: { companyId } }),
    prisma.company.update({
      where: { id: companyId },
      data: {
        profileJson: Prisma.DbNull,
        entityRoles: [],
        riskTiers: [],
        onboardingDismissedAt: null,
      },
    }),
  ]);

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard");
}
