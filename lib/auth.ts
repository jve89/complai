import { cache } from "react";
import { redirect } from "next/navigation";
import type { Company } from "@prisma/client";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/env";

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

  return {
    id: user.id,
    email: user.email ?? profile?.email ?? "",
    profile,
    company: profile?.company ?? null,
  };
});

/** Use in protected Server Components: redirects to /login when signed out. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export interface ActiveCompany {
  company: Company;
  user: CurrentUser | null;
  demo: boolean;
}

/**
 * Resolves the company context for the dashboard:
 *  - signed-in user with a company → that company (demo: false)
 *  - Supabase not configured (stub/demo mode) → the seeded demo company, so the
 *    platform is fully usable for demos without auth (demo: true)
 *  - Supabase configured but signed out → redirect to /login
 */
export const getActiveCompany = cache(async (): Promise<ActiveCompany> => {
  const user = await getCurrentUser();
  if (user?.company) {
    return { company: user.company, user, demo: false };
  }

  if (!isSupabaseConfigured) {
    const company = await prisma.company.findFirst({
      orderBy: { createdAt: "asc" },
    });
    if (company) return { company, user: null, demo: true };
  }

  redirect("/login");
});
