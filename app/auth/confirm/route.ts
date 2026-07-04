import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { baseUrlFrom } from "@/lib/request-url";

/**
 * Landing point for Supabase email links (password recovery, email confirm).
 * Establishes a session from either a PKCE `code` or a `token_hash`/`type`
 * pair, then forwards to `next`. Route Handlers can write cookies, so the
 * session persists. `next` is constrained to a same-site path (no open redirect).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const rawNext = url.searchParams.get("next") ?? "/dashboard";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

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

  return NextResponse.redirect(`${base}${ok ? next : "/wachtwoord-vergeten?error=1"}`);
}
