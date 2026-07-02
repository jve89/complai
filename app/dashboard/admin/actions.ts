"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, IMPERSONATE_COOKIE } from "@/lib/auth";
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
