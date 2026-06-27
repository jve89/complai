import { Resend } from "resend";

import { env, isResendConfigured } from "@/lib/env";

const resend = isResendConfigured ? new Resend(env.resendApiKey) : null;

interface SendEmailArgs {
  to: string | string[];
  subject: string;
  html: string;
}

/**
 * Sends a transactional email via Resend. In stub mode (no RESEND_API_KEY) it
 * logs the email to the server console and resolves successfully, so flows that
 * trigger emails (invites, certificates) work end-to-end during development.
 */
export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  if (!resend) {
    console.info(
      `[resend:stub] E-mail niet verzonden (geen RESEND_API_KEY). Aan: ${
        Array.isArray(to) ? to.join(", ") : to
      } — Onderwerp: ${subject}`
    );
    return { id: "stub", stubbed: true as const };
  }

  const { data, error } = await resend.emails.send({
    from: env.emailFrom,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend-fout: ${error.message}`);
  }
  return { id: data?.id, stubbed: false as const };
}

export { isResendConfigured };
