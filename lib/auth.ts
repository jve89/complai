import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Returns the authenticated Supabase user joined with their ComplAI profile
 * (User + Company) from Postgres, or null when signed out. Cached per request.
 */
export const getCurrentUser = cache(async () => {
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
