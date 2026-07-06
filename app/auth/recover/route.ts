import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { baseUrlFrom } from "@/lib/request-url";

/**
 * Landing point for Supabase's password-recovery email link. A dedicated route
 * (rather than reusing /auth/confirm) so the recovery template can point here
 * with a `token_hash`/`type=recovery` pair, which we verify statelessly via
 * verifyOtp — PKCE `?code=` links can't work from a Server Action (no browser
 * code_verifier to hand off). On success, forwards to /wachtwoord-herstellen to
 * set a new password; the `code` branch is kept only as a fallback.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const base = baseUrlFrom(request);
  const supabase = createClient();

  let ok = false;
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
    if (error) console.error("[auth/recover] verifyOtp failed:", error.message);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
    if (error) console.error("[auth/recover] exchangeCodeForSession failed:", error.message);
  }

  return NextResponse.redirect(`${base}${ok ? "/wachtwoord-herstellen" : "/wachtwoord-vergeten?error=1"}`);
}
