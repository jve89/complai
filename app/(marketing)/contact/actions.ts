"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { contactNotificationEmail } from "@/lib/email/templates";
import { env } from "@/lib/env";
import { rateLimitByIp } from "@/lib/rate-limit";

export type ContactState = { ok?: boolean; error?: string } | undefined;

const schema = z.object({
  name: z.string().min(2, "Voer uw naam in.").max(200, "Naam is te lang."),
  email: z.string().email("Voer een geldig e-mailadres in.").max(320, "E-mailadres is te lang."),
  company: z.string().max(200, "Bedrijfsnaam is te lang.").optional(),
  subject: z.string().max(200, "Onderwerp is te lang.").optional(),
  message: z
    .string()
    .min(10, "Schrijf een bericht van minimaal 10 tekens.")
    .max(5000, "Bericht is te lang (max. 5000 tekens)."),
});

export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const rl = await rateLimitByIp("contact", 5, 3600);
  if (!rl.ok) return { error: rl.error };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { name, email, company, subject, message } = parsed.data;

  // The DB row is the durable lead record — persist it first.
  try {
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        company: company || null,
        subject: subject || null,
        message,
      },
    });
  } catch (e) {
    console.error("Contactbericht opslaan mislukt:", e);
    return { error: "Er ging iets mis bij het versturen. Probeer het later opnieuw." };
  }

  // Notify the team — best-effort, isolated so a mail failure never masks the
  // already-saved lead. (Pre-launch, Resend runs without a verified domain and
  // can't deliver to arbitrary CONTACT_TO addresses, so this WILL throw; the
  // visitor must still see success, else they re-submit → duplicate leads.)
  try {
    const mail = contactNotificationEmail({
      name,
      email,
      company,
      formSubject: subject,
      message,
    });
    await sendEmail({
      to: env.contactTo || env.emailFrom,
      subject: mail.subject,
      html: mail.html,
    });
  } catch (e) {
    console.error("Contact-notificatie e-mail mislukt (bericht wél opgeslagen):", e);
  }

  return { ok: true };
}
