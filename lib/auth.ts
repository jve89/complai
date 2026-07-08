import { cache } from "react";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Company } from "@prisma/client";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured, isSuperAdminEmail } from "@/lib/env";
import { getDemoCompany } from "@/lib/demo";

/** Cookie that carries the company a super-admin is currently impersonating. */
export const IMPERSONATE_COOKIE = "complai_impersonate";

/**
 * Returns the authenticated Supabase user joined with their ComplAI profile
 * (User + Company) from Postgres, or null when signed out. Cached per request.
 */
export const getCurrentUser = cache(async () => {
  // No Supabase configured → nobody is signed in (enables demo mode downstream).
  if (!isSupabaseConfigured) return null;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    include: { company: true },
  });

  const email = user.email ?? profile?.email ?? "";

  return {
    id: user.id,
    email,
    profile,
    company: profile?.company ?? null,
    // Super-admin = env allowlist (bootstrap) OR the DB flag (promoted via UI).
    superAdmin: Boolean(profile?.superAdmin) || isSuperAdminEmail(email),
  };
});

/** Use in protected Server Components: redirects to /login when signed out. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Authorization gate for account-administering actions: editing the AI-register,
 * running the risicoscan, generating shared documents, and managing the
 * subscription, business profile and team.
 *
 * - Beheerder (role "admin") and ComplAI super-admins → true.
 * - Managers and medewerkers → false.
 * - No authenticated user (local dev / public /demo) → true, so demo stays fully
 *   usable. The security boundary is "block real workers", not "block demo".
 *
 * Accepts the `user` object from getCurrentUser()/getActiveCompany(). Compute the
 * boolean in a Server Component and pass it to Client Components as a prop.
 */
export function canAdminister(
  user?: {
    superAdmin?: boolean;
    profile?: { role?: string | null } | null;
  } | null
): boolean {
  if (!user) return true;
  return Boolean(user.superAdmin) || user.profile?.role === "admin";
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export interface ActiveCompany {
  company: Company;
  user: CurrentUser | null;
  demo: boolean;
  /** True when a super-admin is viewing this company via impersonation. */
  impersonating: boolean;
}

/**
 * Resolves the company context for the dashboard:
 *  - signed-in user with a company → that company (demo: false)
 *  - Supabase not configured (stub/demo mode) → the seeded demo company, so the
 *    platform is fully usable for demos without auth (demo: true)
 *  - Supabase configured but signed out → redirect to /login
 */
export const getActiveCompany = cache(async (): Promise<ActiveCompany> => {
  // Public demo: middleware flags /demo/* requests; render the dashboard for the
  // fictional demo company without requiring auth.
  if (headers().get("x-demo") === "1") {
    return { company: await getDemoCompany(), user: null, demo: true, impersonating: false };
  }

  const user = await getCurrentUser();

  // Impersonation: a super-admin viewing a client's dashboard. Honored only when
  // the *real* session user is a super-admin (re-checked every request), so the
  // cookie alone grants nothing.
  if (user?.superAdmin) {
    const targetId = cookies().get(IMPERSONATE_COOKIE)?.value;
    if (targetId && targetId !== user.company?.id) {
      const target = await prisma.company.findUnique({ where: { id: targetId } });
      if (target) return { company: target, user, demo: false, impersonating: true };
    }
  }

  if (user?.company) {
    return { company: user.company, user, demo: false, impersonating: false };
  }

  if (!isSupabaseConfigured) {
    const company = await prisma.company.findFirst({
      orderBy: { createdAt: "asc" },
    });
    if (company) return { company, user: null, demo: true, impersonating: false };
  }

  // Self-heal: an authenticated user without a company (e.g. an earlier signup
  // whose profile write failed before the DB was reachable). Provision a
  // company + admin profile so the user is never stranded on the login redirect.
  if (user) {
    // Re-read fresh: the cached `user` can be stale, and a concurrent request may
    // have just provisioned a company for this same user — reuse it instead of
    // creating an orphan duplicate.
    const fresh = await prisma.user.findUnique({
      where: { id: user.id },
      select: { companyId: true },
    });
    if (fresh?.companyId) {
      const existing = await prisma.company.findUnique({ where: { id: fresh.companyId } });
      if (existing) return { company: existing, user, demo: false, impersonating: false };
    }
    const company = await prisma.company.create({
      data: {
        name: user.profile?.name
          ? `Organisatie van ${user.profile.name}`
          : "Mijn organisatie",
      },
    });
    await prisma.user.upsert({
      where: { id: user.id },
      update: { companyId: company.id },
      create: {
        id: user.id,
        email: user.email,
        name: user.profile?.name ?? null,
        role: "admin",
        companyId: company.id,
      },
    });
    return { company, user, demo: false, impersonating: false };
  }

  redirect("/login");
});
