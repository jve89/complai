import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BellRing, CheckCircle2, Clock } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_COMPANY_NAME } from "@/lib/demo";
import { TIER_LABEL } from "@/lib/plan";
import { daysSince } from "@/lib/regulatory/updates";
import { getPublishedUpdates } from "@/lib/regulatory/updates-data";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const PAID = new Set(["starter", "groei", "schaal"]);
const STATUS_LABEL: Record<string, string> = {
  active: "Actief",
  trialing: "Proef",
  past_due: "Betaling mislukt",
  canceled: "Opgezegd",
};

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

function FunnelStep({
  label,
  count,
  total,
  hint,
}: {
  label: string;
  count: number;
  total: number;
  hint?: string;
}) {
  const p = pct(count, total);
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {count} <span className="text-xs">({p}%)</span>
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${p}%` }} />
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default async function AdminMetricsPage() {
  const me = await getCurrentUser().catch(() => null);
  if (!me?.superAdmin) notFound();

  // Everything is derived from state we already persist — no event tracking.
  const companies = await prisma.company.findMany({
    where: { name: { not: DEMO_COMPANY_NAME } },
    select: {
      id: true,
      plan: true,
      planStatus: true,
      createdAt: true,
      profileJson: true,
      employees: { select: { trainingCompleted: true } },
    },
  });

  const now = new Date();
  const DAY = 86_400_000;
  const total = companies.length;
  const scanned = companies.filter((c) => c.profileJson != null).length;
  const certified = companies.filter((c) =>
    c.employees.some((e) => e.trainingCompleted)
  ).length;
  const paid = companies.filter((c) => c.plan && PAID.has(c.plan)).length;
  const last30 = companies.filter(
    (c) => now.getTime() - c.createdAt.getTime() <= 30 * DAY
  ).length;

  // Plan tier + billing-status breakdown (paying companies only for status).
  const tierCounts = new Map<string, number>();
  const statusCounts = new Map<string, number>();
  for (const c of companies) {
    const tier = c.plan && PAID.has(c.plan) ? c.plan : "gratis";
    tierCounts.set(tier, (tierCounts.get(tier) ?? 0) + 1);
    if (c.plan && PAID.has(c.plan)) {
      const s = c.planStatus ?? "active";
      statusCounts.set(s, (statusCounts.get(s) ?? 0) + 1);
    }
  }

  // Retention proxy: paying companies older than 30 days that are still active/
  // trialing (real month-3 cohorts populate as the base ages).
  const paidCompanies = companies.filter((c) => c.plan && PAID.has(c.plan));
  const paidCohort30 = paidCompanies.filter(
    (c) => now.getTime() - c.createdAt.getTime() > 30 * DAY
  );
  const retained30 = paidCohort30.filter(
    (c) => c.planStatus === "active" || c.planStatus === "trialing"
  ).length;

  // Regulatory-currency SLA: for each published update, did we react (productImpact)?
  const publishedUpdates = await getPublishedUpdates(); // newest first
  const latest = publishedUpdates[0];
  const reacted = publishedUpdates.filter((u) => u.productImpact).length;

  return (
    <>
      <PageHeader
        title="Statistieken"
        description="Interne funnel-, activatie- en retentiecijfers, berekend uit bestaande data. Alleen zichtbaar voor ComplAI-beheer."
      />

      <Link
        href="/dashboard/admin"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Terug naar beheer
      </Link>

      {total === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Nog geen (niet-demo) organisaties om te meten.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Activation funnel → first value (scan → certificate) → paid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activatie-funnel</CardTitle>
              <p className="text-sm text-muted-foreground">
                Weg naar eerste waarde: aanmelding → risicoscan → AI-geletterdheidscertificaat → betalend.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <FunnelStep label="Aangemeld" count={total} total={total} hint={`${last30} in de laatste 30 dagen`} />
              <FunnelStep label="Risicoscan gedaan" count={scanned} total={total} />
              <FunnelStep label="Certificaat behaald (eerste waarde)" count={certified} total={total} />
              <FunnelStep label="Betalend" count={paid} total={total} />
            </CardContent>
          </Card>

          {/* Plans + billing status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pakketten &amp; status</CardTitle>
              <p className="text-sm text-muted-foreground">
                Betaalde conversie: {pct(paid, total)}% van de organisaties.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Per pakket</p>
                <div className="space-y-1.5">
                  {["gratis", "starter", "groei", "schaal"].map((t) => (
                    <div key={t} className="flex items-center justify-between text-sm">
                      <span>{t === "gratis" ? "Gratis / scan" : (TIER_LABEL as Record<string, string>)[t] ?? t}</span>
                      <span className="tabular-nums text-muted-foreground">{tierCounts.get(t) ?? 0}</span>
                    </div>
                  ))}
                </div>
              </div>
              {statusCounts.size > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Betaalstatus (betalend)</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(statusCounts.entries()).map(([s, n]) => (
                      <Badge key={s} variant={s === "past_due" || s === "canceled" ? "warning" : "secondary"}>
                        {STATUS_LABEL[s] ?? s}: {n}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Retention snapshot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Retentie (momentopname)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Echte maand-3-cohorten vullen zich naarmate de klantbasis veroudert.
              </p>
            </CardHeader>
            <CardContent>
              {paidCohort30.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nog geen betalende organisaties ouder dan 30 dagen om te meten.
                </p>
              ) : (
                <p className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>
                    <strong className="tabular-nums">
                      {retained30}/{paidCohort30.length}
                    </strong>{" "}
                    betalende organisaties (&gt; 30 dagen oud) zijn nog actief —{" "}
                    {pct(retained30, paidCohort30.length)}% behouden.
                  </span>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Regulatory-currency SLA — our differentiator */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Regelgeving-actualiteit</CardTitle>
              <p className="text-sm text-muted-foreground">
                Onze SLA: reageerden we op de laatste wetswijziging? ({reacted}/{publishedUpdates.length} updates met een productreactie.)
              </p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {latest && (
                <>
                  <p className="flex items-start gap-2">
                    <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    <span>
                      <strong>{latest.title}</strong>
                      <span className="block text-xs text-muted-foreground">
                        {formatDate(new Date(latest.date))} · {daysSince(latest.date, now)} dagen geleden
                      </span>
                    </span>
                  </p>
                  {latest.productImpact ? (
                    <p className="flex items-start gap-1.5 pl-6 text-emerald-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>Gereageerd: {latest.productImpact}</span>
                    </p>
                  ) : (
                    <p className="flex items-start gap-1.5 pl-6 text-amber-700">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>Nog geen productreactie vastgelegd voor deze wijziging.</span>
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
