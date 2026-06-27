import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { env } from "@/lib/env";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 * Reads/writes the session from cookies. In a Server Component context cookie
 * writes are no-ops (handled by middleware), so we guard the set/remove calls.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(env.supabaseUrl ?? "", env.supabaseAnonKey ?? "", {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — session refresh is handled in
          // middleware, so this can be safely ignored.
        }
      },
    },
  });
}
