import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

/**
 * Service-role Supabase client for admin operations (deleting auth users).
 * Null when not configured (local demo mode / missing service key). Never
 * import this into client code — it holds full-access credentials.
 */
function adminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.supabaseUrl || !key) return null;
  return createClient(env.supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Deletes Supabase auth accounts (User.id == auth uid). Best-effort: returns
 * how many were removed and whether it was skipped (no service key) — so a
 * missing key never blocks the DB-side deletion, it just leaves the login.
 */
export async function deleteAuthUsers(
  ids: string[]
): Promise<{ removed: number; skipped: boolean }> {
  const supabase = adminClient();
  if (!supabase) return { removed: 0, skipped: true };

  let removed = 0;
  for (const id of ids) {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) {
      console.error(`[admin] auth-account verwijderen mislukt (${id}): ${error.message}`);
    } else {
      removed++;
    }
  }
  return { removed, skipped: false };
}
