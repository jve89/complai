import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { baseUrlFrom } from "@/lib/request-url";

/**
 * Landing point for Supabase's password-recovery email link. A dedicated,
 * query-free route (rather than /auth/confirm?next=/wachtwoord-herstellen):
 * Supabase's redirect-URL allow-list check can reject a query string on
 * redirectTo and silently fall back to the bare Site URL. Establishes a
 * session from either a PKCE `code` or a `token_hash`/`type` pair, then always
 * forwards to /wachtwoord-herstellen to set a new password.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const base = baseUrlFrom(request);
  const supabase = createClient();

  let ok = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
  }

  return NextResponse.redirect(`${base}${ok ? "/wachtwoord-herstellen" : "/wachtwoord-vergeten?error=1"}`);
}
