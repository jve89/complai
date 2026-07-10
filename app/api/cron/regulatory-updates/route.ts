import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { companySignals } from "@/lib/compliance/signals";
import { evaluateUpdates, updatesToNotify } from "@/lib/regulatory/updates";
import { getPublishedUpdates } from "@/lib/regulatory/updates-data";
import type { ComplianceProfile } from "@/lib/compliance/types";
import { sendRegulatoryDigest } from "@/lib/email/send";

export const dynamic = "force-dynamic";

/**
 * Daily cron ("we keep you current"): emails each company the regulatory updates
 * we published one day earlier that are relevant to its risk profile. Stateless
 * — `updatesToNotify` selects by publish date, so no per-company marker is
 * needed and a redeploy never re-sends.
 *
 * Activated only when CRON_SECRET is set; Vercel Cron sends it as a Bearer
 * token. Emails only reach real customers once a Resend sending domain is
 * verified (until then Resend delivers to the account owner only).
 */
export async function GET(req: Request) {
  if (!env.cronSecret) {
    return NextResponse.json({ error: "cron not configured" }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${env.cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const published = await getPublishedUpdates();
  const fresh = updatesToNotify(published, now);
  if (fresh.length === 0) {
    return NextResponse.json({ ok: true, published: 0, companiesNotified: 0 });
  }
  const freshIds = new Set(fresh.map((u) => u.id));

  const companies = await prisma.company.findMany({
    select: {
      id: true,
      profileJson: true,
      aiSystems: { select: { riskLevel: true } },
    },
  });

  let notified = 0;
  for (const c of companies) {
    try {
      const profile = (c.profileJson as unknown as ComplianceProfile | null) ?? null;
      const sig = companySignals(
        profile,
        c.aiSystems.map((s) => s.riskLevel)
      );
      const relevant = evaluateUpdates(published, sig).filter(
        (u) => u.relevant && freshIds.has(u.id)
      );
      if (relevant.length === 0) continue;
      await sendRegulatoryDigest({
        companyId: c.id,
        updates: relevant.map((u) => ({ title: u.title, summary: u.summary })),
        baseUrl: env.appUrl,
      });
      notified++;
    } catch (err) {
      console.error(
        `[cron:updates] company ${c.id} mislukt:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  return NextResponse.json({
    ok: true,
    published: fresh.length,
    companiesNotified: notified,
  });
}
