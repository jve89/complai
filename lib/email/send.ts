import "server-only";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import {
  welcomeEmail,
  scanResultEmail,
  purchaseEmail,
  paymentFailedEmail,
  cancelRequestedEmail,
  subscriptionEndedEmail,
  regulatoryUpdateEmail,
  type EmailContent,
} from "@/lib/email/templates";

/** Transactional mail must never break the flow that triggers it. */
async function deliver(to: string | null | undefined, content: EmailContent) {
  if (!to) return;
  try {
    await sendEmail({ to, subject: content.subject, html: content.html });
  } catch (err) {
    console.error(
      `[email] verzenden mislukt (${content.subject} → ${to}):`,
      err instanceof Error ? err.message : err
    );
  }
}

/** Billing emails go to the company's beheerder (fallback: any member). Never
 * throws: a failed lookup means "no email", not a failed webhook. */
async function companyRecipient(companyId: string): Promise<string | null> {
  try {
    const admin = await prisma.user.findFirst({
      where: { companyId, role: "admin" },
      orderBy: { createdAt: "asc" },
      select: { email: true },
    });
    if (admin?.email) return admin.email;
    const any = await prisma.user.findFirst({
      where: { companyId },
      orderBy: { createdAt: "asc" },
      select: { email: true },
    });
    return any?.email ?? null;
  } catch (err) {
    console.error(
      `[email] ontvanger opzoeken mislukt (company ${companyId}):`,
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

export async function sendWelcome(opts: {
  to: string;
  name?: string | null;
  baseUrl: string;
  withScan: boolean;
}) {
  await deliver(opts.to, welcomeEmail(opts));
}

export async function sendScanResult(opts: {
  to: string;
  score: number;
  headlineLabel: string;
  baseUrl: string;
  resultPath: string;
}) {
  await deliver(opts.to, scanResultEmail(opts));
}

export async function sendPurchaseConfirmation(opts: {
  companyId: string;
  planLabel: string | null;
  renewsAt?: string | null;
  baseUrl: string;
}) {
  await deliver(await companyRecipient(opts.companyId), purchaseEmail(opts));
}

export async function sendPaymentFailed(opts: { companyId: string; baseUrl: string }) {
  await deliver(await companyRecipient(opts.companyId), paymentFailedEmail(opts));
}

export async function sendCancelRequested(opts: {
  companyId: string;
  accessUntil?: string | null;
  baseUrl: string;
}) {
  await deliver(await companyRecipient(opts.companyId), cancelRequestedEmail(opts));
}

export async function sendSubscriptionEnded(opts: {
  companyId: string;
  involuntary: boolean;
  baseUrl: string;
}) {
  await deliver(await companyRecipient(opts.companyId), subscriptionEndedEmail(opts));
}

/** "We keep you current": digest of newly-published, company-relevant regulatory
 *  updates. Goes to the beheerder (fallback: any member). No-ops on empty. */
export async function sendRegulatoryDigest(opts: {
  companyId: string;
  updates: { title: string; summary: string }[];
  baseUrl: string;
}) {
  if (opts.updates.length === 0) return;
  await deliver(
    await companyRecipient(opts.companyId),
    regulatoryUpdateEmail({ updates: opts.updates, baseUrl: opts.baseUrl })
  );
}
