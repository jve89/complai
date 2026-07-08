"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { contactNotificationEmail } from "@/lib/email/templates";
import { env } from "@/lib/env";
import { rateLimitByIp } from "@/lib/rate-limit";

export type ContactState = { ok?: boolean; error?: string } | undefined;

const schema = z.object({
  name: z.string().min(2, "Voer uw naam in."),
  email: z.string().email("Voer een geldig e-mailadres in."),
  company: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, "Schrijf een bericht van minimaal 10 tekens."),
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

    // Notify the team. In stub mode (no RESEND_API_KEY) this logs to the console.
    const mail = contactNotificationEmail({
      name,
      email,
      company,
      formSubject: subject,
      message,
    });
    // Deliver to a mailbox that can actually receive (CONTACT_TO); the EMAIL_FROM
    // sender address may be send-only. The DB row above is the durable record.
    await sendEmail({
      to: env.contactTo || env.emailFrom,
      subject: mail.subject,
      html: mail.html,
    });
  } catch (e) {
    console.error("Contactbericht verwerken mislukt:", e);
    return { error: "Er ging iets mis bij het versturen. Probeer het later opnieuw." };
  }

  return { ok: true };
}
