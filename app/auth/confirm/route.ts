import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { baseUrlFrom } from "@/lib/request-url";
import { sendWelcome } from "@/lib/email/send";

/**
 * Landing point for Supabase's email-confirmation link. The email template
 * builds a `token_hash`/`type` link straight to this route (not a PKCE `?code=`
 * link — a Server Action has no browser code_verifier to hand off, so
 * exchangeCodeForSession can't work here); we verify it statelessly via
 * verifyOtp. Route Handlers can write cookies, so the session persists. The
 * `code` branch is kept only as a fallback.
 *
 * A picked plan (and the welcome-email context) is stashed in user_metadata at
 * signup and read back here once the session exists — this is also where the
 * welcome email fires when confirmation was required (signup() only sends it
 * immediately if a session already existed there).
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
    if (error) console.error("[auth/confirm] verifyOtp failed:", error.message);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
    if (error) console.error("[auth/confirm] exchangeCodeForSession failed:", error.message);
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
    // Consume the invite now that the account is confirmed and usable (signup
    // defers this to here when email confirmation is required).
    const pendingInviteToken = user?.user_metadata?.pendingInviteToken as string | undefined;
    if (pendingInviteToken) {
      await prisma.invite
        .updateMany({
          where: { token: pendingInviteToken, accepted: false },
          data: { accepted: true },
        })
        .catch((e) => console.error("[auth/confirm] uitnodiging accepteren mislukt:", e));
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
