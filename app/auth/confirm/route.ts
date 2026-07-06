import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { baseUrlFrom } from "@/lib/request-url";
import { sendWelcome } from "@/lib/email/send";

/**
 * Landing point for Supabase's email-confirmation link. Establishes a session
 * from either a PKCE `code` or a `token_hash`/`type` pair, then forwards to
 * the dashboard (or Stripe checkout, if a plan was picked at signup). Route
 * Handlers can write cookies, so the session persists.
 *
 * We don't pass `?next=...` on the emailRedirectTo used to build this link:
 * Supabase's redirect-URL allow-list check can reject a query string and
 * silently fall back to the bare Site URL, dropping the destination entirely.
 * So a picked plan (and the welcome-email context) is stashed in user_metadata
 * at signup instead, and read back here once the session exists. This is also
 * where the welcome email fires when confirmation was required — signup()
 * only sends it immediately if a session already existed there.
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
    if (error) console.error("[auth/confirm] exchangeCodeForSession failed:", error.message, error.status);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
    if (error) console.error("[auth/confirm] verifyOtp failed:", error.message, error.status);
  } else {
    console.error("[auth/confirm] no code or token_hash/type in request:", url.search);
  }

  let next = "/dashboard";
  if (ok) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const pendingPlan = user?.user_metadata?.pendingPlan as string | undefined;
    if (pendingPlan) {
      const pendingInterval = user?.user_metadata?.pendingInterval === "year" ? "year" : "month";
      next = `/api/stripe/checkout?plan=${encodeURIComponent(pendingPlan)}&interval=${pendingInterval}`;
    }
    if (user?.email) {
      await sendWelcome({
        to: user.email,
        name: user.user_metadata?.name as string | undefined,
        baseUrl: base,
        withScan: Boolean(user.user_metadata?.withScan),
      });
    }
  }

  return NextResponse.redirect(`${base}${ok ? next : "/wachtwoord-vergeten?error=1"}`);
}
