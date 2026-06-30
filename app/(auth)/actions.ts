"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/env";
import { applyScanToCompany } from "@/lib/scan/claim";

export type AuthState = { error?: string } | undefined;

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

  const redirectTo = (formData.get("redirect") as string) || "/dashboard";
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

  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }
  const { name, companyName, email, password } = parsed.data;

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Registratie mislukt. Probeer opnieuw." };
  }

  // Create the company + admin profile row mirroring the Supabase auth uid.
  try {
    const company = await prisma.company.create({ data: { name: companyName } });
    await prisma.user.upsert({
      where: { id: data.user.id },
      update: { name, email, companyId: company.id },
      create: {
        id: data.user.id,
        email,
        name,
        role: "admin",
        companyId: company.id,
      },
    });

    // Bridge: if they came from an anonymous scan, populate the new dashboard
    // from it so the account opens with their profile + obligations already set.
    const scanId = formData.get("scan") as string | null;
    if (scanId) await applyScanToCompany(scanId, company.id, data.user.id);
  } catch (e) {
    console.error("Profiel aanmaken mislukt:", e);
    return {
      error:
        "Account aangemaakt, maar het profiel kon niet worden opgeslagen. Neem contact op met support.",
    };
  }

  // If email confirmation is required there is no session yet.
  if (!data.session) {
    redirect("/login?registered=1");
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
