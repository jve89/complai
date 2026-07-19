"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/env";
import { applyScanToCompany } from "@/lib/scan/claim";
import { DEMO_COMPANY_NAME } from "@/lib/demo";
import { sendWelcome } from "@/lib/email/send";
import { currentBaseUrl } from "@/lib/request-url";
import { rateLimitByIp } from "@/lib/rate-limit";

export type AuthState = { error?: string } | undefined;
export type ResetState = { error?: string; sent?: boolean } | undefined;

const loginSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in."),
  password: z.string().min(1, "Voer uw wachtwoord in."),
});

const signupSchema = z.object({
  name: z.string().min(2, "Voer uw naam in."),
  companyName: z.string().min(2, "Voer de naam van uw organisatie in."),
  email: z.string().email("Voer een geldig e-mailadres in."),
  password: z.string().min(8, "Het wachtwoord moet minstens 8 tekens bevatten."),
});

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (!isSupabaseConfigured) {
    return {
      error:
        "Supabase is nog niet geconfigureerd. Vul NEXT_PUBLIC_SUPABASE_URL en _ANON_KEY in.",
    };
  }

  const rl = await rateLimitByIp("login", 10, 300);
  if (!rl.ok) return { error: rl.error };

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.message === "Email not confirmed") {
      return {
        error:
          "Bevestig eerst uw e-mailadres via de link die we u hebben gestuurd, en log daarna in.",
      };
    }
    return { error: "Inloggen mislukt. Controleer uw gegevens." };
  }

  // Carry an anonymous scan into the just-authenticated account, if one was passed.
  const scanId = formData.get("scan") as string | null;
  if (scanId) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const profile = await prisma.user.findUnique({
          where: { id: user.id },
          select: { companyId: true, role: true, superAdmin: true },
        });
        // A scan rewrites company-wide state (roles, risk tiers, obligations), so
        // only a beheerder/super-admin may apply it — a manager/medewerker who
        // logs in via a ?scan= link must not clobber the shared profile.
        const mayAdminister = profile?.role === "admin" || profile?.superAdmin === true;
        if (profile?.companyId && mayAdminister) {
          await applyScanToCompany(scanId, profile.companyId, user.id);
        }
      }
    } catch (e) {
      console.error("Scan koppelen bij inloggen mislukt:", e);
    }
  }

  // Continue an account-first checkout that was interrupted by email confirmation.
  const plan = (formData.get("plan") as string | null) || null;
  const intervalParam =
    (formData.get("interval") as string | null) === "year" ? "year" : "month";
  // Only honour a local path as the post-login destination — never an absolute
  // or protocol-relative URL (open-redirect / phishing vector).
  const rawRedirect = (formData.get("redirect") as string) || "/dashboard";
  const safeRedirect =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/dashboard";
  const redirectTo = plan
    ? `/api/stripe/checkout?plan=${encodeURIComponent(plan)}&interval=${intervalParam}`
    : safeRedirect;
  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function signup(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (!isSupabaseConfigured) {
    return {
      error:
        "Supabase is nog niet geconfigureerd. Vul NEXT_PUBLIC_SUPABASE_URL en _ANON_KEY in.",
    };
  }

  const rl = await rateLimitByIp("signup", 5, 3600);
  if (!rl.ok) return { error: rl.error };

  const base = z
    .object({
      name: z.string().min(2, "Voer uw naam in."),
      email: z.string().email("Voer een geldig e-mailadres in."),
      password: z.string().min(8, "Het wachtwoord moet minstens 8 tekens bevatten."),
    })
    .safeParse(Object.fromEntries(formData));
  if (!base.success) {
    return { error: base.error.issues[0]?.message };
  }
  const { name, email, password } = base.data;

  // Invite path: join an existing company with the assigned role. Otherwise the
  // signer creates a new company and becomes its Beheerder.
  const inviteToken = (formData.get("invite") as string | null) || null;
  let invite: { id: string; companyId: string; role: string } | null = null;
  if (inviteToken) {
    const rec = await prisma.invite.findUnique({ where: { token: inviteToken } });
    if (!rec || rec.accepted) {
      return { error: "Deze uitnodiging is niet meer geldig. Vraag de beheerder om een nieuwe." };
    }
    if (rec.expiresAt && rec.expiresAt < new Date()) {
      return { error: "Deze uitnodiging is verlopen. Vraag de beheerder om een nieuwe." };
    }
    // The invite grants a company + role, so bind it to the invited address: the
    // signup email must match (the readOnly field is only a client-side hint).
    if (rec.email.toLowerCase() !== email.toLowerCase()) {
      return {
        error:
          "Deze uitnodiging hoort bij een ander e-mailadres. Gebruik het adres waarop u de uitnodiging ontving.",
      };
    }
    invite = { id: rec.id, companyId: rec.companyId, role: rec.role };
  }

  let companyName = "";
  if (!invite) {
    const cn = z
      .string()
      .min(2, "Voer de naam van uw organisatie in.")
      .refine(
        (n) => n.trim().toLowerCase() !== DEMO_COMPANY_NAME.toLowerCase(),
        "Deze bedrijfsnaam is niet beschikbaar."
      )
      .safeParse(formData.get("companyName"));
    if (!cn.success) return { error: cn.error.issues[0]?.message };
    companyName = cn.data;
  }

  const plan = (formData.get("plan") as string | null) || null;
  const intervalParam =
    (formData.get("interval") as string | null) === "year" ? "year" : "month";
  const confirmNext = plan
    ? `/api/stripe/checkout?plan=${encodeURIComponent(plan)}&interval=${intervalParam}`
    : "/dashboard";
  const scanId = formData.get("scan") as string | null;

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Supabase's redirect-URL allow-list check can reject a query string on
      // emailRedirectTo and silently fall back to the bare Site URL, dropping
      // even the path — so the confirmation link carries no destination info.
      // Instead, stash where to go (and the welcome-email context) in
      // user_metadata, which /auth/confirm reads back once the session and
      // profile exist — that's also where the welcome email fires when
      // confirmation is required, so it never claims access is ready early.
      data: {
        name,
        withScan: Boolean(scanId),
        ...(plan ? { pendingPlan: plan, pendingInterval: intervalParam } : {}),
        // Carried to /auth/confirm so the invite is consumed only once the
        // account is confirmed (not burned by an abandoned confirmation).
        ...(inviteToken ? { pendingInviteToken: inviteToken } : {}),
      },
      emailRedirectTo: `${currentBaseUrl()}/auth/confirm`,
    },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Registratie mislukt. Probeer opnieuw." };
  }

  try {
    let companyId: string;
    let role: "admin" | "manager" | "employee" = "admin";
    if (invite) {
      companyId = invite.companyId;
      role = z.enum(["admin", "manager", "employee"]).catch("employee").parse(invite.role);
      // Consume the invite now only if the account is immediately usable; when
      // email confirmation is required, /auth/confirm marks it accepted once the
      // session exists — so an abandoned confirmation doesn't burn the invite.
      if (data.session) {
        await prisma.invite.update({ where: { id: invite.id }, data: { accepted: true } });
      }
    } else {
      const company = await prisma.company.create({ data: { name: companyName } });
      companyId = company.id;
    }

    await prisma.user.upsert({
      where: { id: data.user.id },
      update: { name, email, companyId, role },
      create: { id: data.user.id, email, name, role, companyId },
    });

    // Bridge: if they came from an anonymous scan, populate the dashboard from
    // it — but only a beheerder may reshape company-wide state. A non-invite
    // signer is the new company's beheerder ("admin"); an invited manager/
    // medewerker joining an existing company must not clobber its profile.
    if (scanId && role === "admin") {
      await applyScanToCompany(scanId, companyId, data.user.id);
    }

    // Welcome email (never blocks signup — sendWelcome catches its own errors).
    // Only send it now if the account is actually usable already; when
    // confirmation is required, /auth/confirm sends it once they've confirmed.
    if (data.session) {
      await sendWelcome({
        to: email,
        name,
        baseUrl: currentBaseUrl(),
        withScan: Boolean(scanId),
      });
    }
  } catch (e) {
    console.error("Profiel aanmaken mislukt:", e);
    return {
      error:
        "Account aangemaakt, maar het profiel kon niet worden opgeslagen. Neem contact op met support.",
    };
  }

  // If email confirmation is required there is no session yet — the user
  // continues via the confirmation link (emailRedirectTo above), which lands on
  // /auth/confirm and forwards straight to confirmNext.
  if (!data.session) {
    redirect(`/login?registered=1${plan ? `&plan=${encodeURIComponent(plan)}` : ""}`);
  }

  revalidatePath("/", "layout");
  redirect(confirmNext);
}

/**
 * Sends a Supabase password-recovery email. The link lands on /auth/recover,
 * which establishes a session and forwards to /wachtwoord-herstellen. Uses a
 * dedicated query-free route rather than /auth/confirm?next=... because
 * Supabase's redirect-URL allow-list check can reject a query string and fall
 * back to the bare Site URL. We always report success so the form never
 * reveals whether an address has an account.
 */
export async function requestPasswordReset(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  if (!isSupabaseConfigured) {
    return { error: "Supabase is nog niet geconfigureerd." };
  }

  const rl = await rateLimitByIp("pwreset", 5, 3600);
  if (!rl.ok) return { error: rl.error };

  const parsed = z
    .string()
    .email("Voer een geldig e-mailadres in.")
    .safeParse(formData.get("email"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${currentBaseUrl()}/auth/recover`,
  });
  return { sent: true };
}

/**
 * Sets a new password for the user whose recovery session was just established
 * by /auth/confirm. Requires an authenticated session (the recovery link).
 */
export async function updatePassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (!isSupabaseConfigured) {
    return { error: "Supabase is nog niet geconfigureerd." };
  }
  const parsed = z
    .string()
    .min(8, "Het wachtwoord moet minstens 8 tekens bevatten.")
    .safeParse(formData.get("password"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Uw herstel-link is verlopen of ongeldig. Vraag een nieuwe aan." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) {
    return { error: "Wachtwoord bijwerken mislukt. Probeer het opnieuw." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Signs the current user out and returns to the invite link, so a logged-in
 * visitor can accept an invitation meant for another account. The token is only
 * ever re-attached as a query param on our own /signup route — never used as a
 * raw redirect target — so it can't be turned into an open redirect.
 */
export async function logoutToInvite(formData: FormData) {
  const token = ((formData.get("invite") as string | null) ?? "").trim();
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(token ? `/signup?invite=${encodeURIComponent(token)}` : "/signup");
}
