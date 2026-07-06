import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { env } from "@/lib/env";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 * Reads/writes the session from cookies. In a Server Component context cookie
 * writes are no-ops (handled by middleware), so we guard the set/remove calls.
 *
 * Email confirmation / password-reset links do NOT use the PKCE code exchange
 * (a Server Action has no browser code_verifier cookie to hand off, so
 * exchangeCodeForSession fails with "PKCE code verifier not found in storage").
 * Instead the Supabase email templates are configured to send a token_hash
 * link straight to /auth/confirm and /auth/recover, which verify it statelessly
 * via verifyOtp — no stored verifier needed. So the default flowType is fine.
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
