import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { env } from "@/lib/env";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 * Reads/writes the session from cookies. In a Server Component context cookie
 * writes are no-ops (handled by middleware), so we guard the set/remove calls.
 *
 * flowType is forced to "implicit" (rather than the @supabase/ssr default of
 * "pkce"): PKCE needs the *browser* to hold a code_verifier cookie between
 * signUp()/resetPasswordForEmail() and the user later clicking the emailed
 * link, but those calls happen here in a Server Action — there's no such
 * cookie to hand off, so exchangeCodeForSession always failed with "PKCE code
 * verifier not found in storage." Implicit flow makes Supabase email links use
 * a token_hash instead, which app/auth/confirm and app/auth/recover verify
 * statelessly via verifyOtp — no stored verifier needed.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(env.supabaseUrl ?? "", env.supabaseAnonKey ?? "", {
    auth: { flowType: "implicit" },
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
