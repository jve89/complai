"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/env";
import { applyScanToCompany } from "@/lib/scan/claim";
import { sendWelcome } from "@/lib/email/send";
import { currentBaseUrl } from "@/lib/request-url";

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

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
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
          select: { companyId: true },
        });
        if (profile?.companyId) await applyScanToCompany(scanId, profile.companyId, user.id);
      }
    } catch (e) {
      console.error("Scan koppelen bij inloggen mislukt:", e);
    }
  }

  // Continue an account-first checkout that was interrupted by email confirmation.
  const plan = (formData.get("plan") as string | null) || null;
  const intervalParam =
    (formData.get("interval") as string | null) === "year" ? "year" : "month";
  const redirectTo = plan
    ? `/api/stripe/checkout?plan=${encodeURIComponent(plan)}&interval=${intervalParam}`
    : (formData.get("redirect") as string) || "/dashboard";
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
    invite = { id: rec.id, companyId: rec.companyId, role: rec.role };
  }

  let companyName = "";
  if (!invite) {
    const cn = z
      .string()
      .min(2, "Voer de naam van uw organisatie in.")
      .safeParse(formData.get("companyName"));
    if (!cn.success) return { error: cn.error.issues[0]?.message };
    companyName = cn.data;
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
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
      await prisma.invite.update({ where: { id: invite.id }, data: { accepted: true } });
    } else {
      const company = await prisma.company.create({ data: { name: companyName } });
      companyId = company.id;
    }

    await prisma.user.upsert({
      where: { id: data.user.id },
      update: { name, email, companyId, role },
      create: { id: data.user.id, email, name, role, companyId },
    });

    // Bridge: if they came from an anonymous scan, populate the dashboard from it.
    const scanId = formData.get("scan") as string | null;
    if (scanId) await applyScanToCompany(scanId, companyId, data.user.id);

    // Welcome email (never blocks signup — sendWelcome catches its own errors).
    await sendWelcome({
      to: email,
      name,
      baseUrl: currentBaseUrl(),
      withScan: Boolean(scanId),
    });
  } catch (e) {
    console.error("Profiel aanmaken mislukt:", e);
    return {
      error:
        "Account aangemaakt, maar het profiel kon niet worden opgeslagen. Neem contact op met support.",
    };
  }

  // Account-first checkout: if they picked a paid plan, continue to Stripe after
  // auth (carried through email confirmation via the login redirect).
  const plan = (formData.get("plan") as string | null) || null;
  const intervalParam =
    (formData.get("interval") as string | null) === "year" ? "year" : "month";
  const planQuery = plan
    ? `&plan=${encodeURIComponent(plan)}&interval=${intervalParam}`
    : "";

  // If email confirmation is required there is no session yet.
  if (!data.session) {
    redirect(`/login?registered=1${planQuery}`);
  }

  revalidatePath("/", "layout");
  redirect(
    plan
      ? `/api/stripe/checkout?plan=${encodeURIComponent(plan)}&interval=${intervalParam}`
      : "/dashboard"
  );
}

/**
 * Sends a Supabase password-recovery email. The link lands on /auth/confirm,
 * which establishes a session and forwards to /wachtwoord-herstellen. We always
 * report success so the form never reveals whether an address has an account.
 */
export async function requestPasswordReset(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  if (!isSupabaseConfigured) {
    return { error: "Supabase is nog niet geconfigureerd." };
  }
  const parsed = z
    .string()
    .email("Voer een geldig e-mailadres in.")
    .safeParse(formData.get("email"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${currentBaseUrl()}/auth/confirm?next=/wachtwoord-herstellen`,
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
