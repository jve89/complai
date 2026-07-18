import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Circle,
  Database,
  Info,
  GraduationCap,
  ListChecks,
  Search,
  ShieldAlert,
} from "lucide-react";

import { getActiveCompany, canAdminister } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn, formatDate } from "@/lib/utils";
import { TIER_LABEL, TIER_ORDER, tierRank } from "@/lib/plan";
import { HREF_TO_SURFACE } from "@/lib/compliance/relevance";
import type { ComplianceProfile } from "@/lib/compliance/types";
import { readProfile } from "@/lib/compliance/read-profile";
import { buildDashboardView } from "@/lib/dashboard/view-model";
import { onboardingState } from "@/lib/onboarding";
import { companySignals } from "@/lib/compliance/signals";
import { daysSince } from "@/lib/regulatory/updates";
import { getEvaluatedUpdates } from "@/lib/regulatory/updates-data";
import { DASHBOARD_NAV } from "@/components/dashboard/nav-items";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { UpdatesCard } from "@/components/dashboard/updates-card";
import { RelevanceReveal, LockBadge } from "@/components/dashboard/relevance";
import { ScoreRing } from "@/components/score-ring";
import { PageHeader } from "@/components/dashboard/page-header";
import { PendingPublicationNote } from "@/components/pending-publication-note";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const dynamic = "force-dynamic";

const HEADLINE: Record<
  ComplianceProfile["headline"],
  { label: string; variant: "success" | "info" | "warning" | "danger" | "secondary" }
> = {
  prohibited: { label: "Verboden praktijk", variant: "danger" },
  high_risk: { label: "Hoog risico", variant: "warning" },
  high_notify: { label: "Geen hoog risico (Art. 6(3))", variant: "info" },
  limited_risk: { label: "Beperkt risico", variant: "info" },
  out_of_scope: { label: "Buiten de reikwijdte", variant: "secondary" },
  excluded: { label: "Uitgesloten", variant: "secondary" },
  minimal: { label: "Minimaal risico", variant: "success" },
};

function statusBadge(status: string) {
  if (status === "compliant" || status === "done")
    return <Badge variant="success">Op orde</Badge>;
  if (status === "in_progress") return <Badge variant="warning">Bezig</Badge>;
  return <Badge variant="secondary">Te doen</Badge>;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { checkout?: string };
}) {
  const { company, demo, user } = await getActiveCompany();
  const isAdmin = canAdminister(user);
  const profile = readProfile(company.profileJson);

  const [aiSystems, documents, employees, items, incidents, complaints] = await Promise.all([
    prisma.aiSystem.findMany({ where: { companyId: company.id } }),
    prisma.document.findMany({ where: { companyId: company.id } }),
    prisma.employee.findMany({ where: { companyId: company.id } }),
    prisma.complianceItem.findMany({
      where: { companyId: company.id },
      orderBy: { deadline: "asc" },
    }),
    // For the Art 26(5) post-market-monitoring kwartaalcheck: outstanding
    // escalations to review (open incidents + open/in-behandeling complaints).
    prisma.incident.findMany({ where: { companyId: company.id }, select: { status: true } }),
    prisma.complaint.findMany({ where: { companyId: company.id }, select: { status: true } }),
  ]);

  // "Aan de slag": account (inherently done here) + scan + pakket. Hidden
  // forever once everything is done or the user dismisses it. Shared with the
  // scan-results CTA via onboardingState so both surfaces stay in sync.
  const { scanDone, packageDone: planDone } = onboardingState(company);
  const planLabel = TIER_LABEL[TIER_ORDER[tierRank(company.plan)]];
  // Onboarding (scan + pakket) is beheerder work, so only admins see the checklist.
  // When all steps are done the checklist auto-dismisses itself via a client effect
  // (see OnboardingChecklist / AutoDismissOnboarding) rather than writing to the DB
  // during this GET render — so it still never returns, without a render-time mutation.
  const showChecklist = isAdmin && !demo && !company.onboardingDismissedAt;

  const checkoutBanner =
    searchParams.checkout === "success" ? (
      <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <strong>Gelukt!</strong>{" "}
        {planDone
          ? "Uw pakket is geactiveerd en uw documenten zijn ontgrendeld."
          : "Uw pakket wordt geactiveerd — dit duurt hooguit enkele seconden. Ververs de pagina als het nog niet zichtbaar is."}
      </div>
    ) : null;

  const checklist = showChecklist ? (
    <OnboardingChecklist scanDone={scanDone} planDone={planDone} planLabel={planLabel} />
  ) : null;

  // No scan yet → the checklist is the main content; fall back to the classic
  // prompt when it was dismissed.
  if (!profile && items.length === 0) {
    return (
      <>
        <PageHeader title={`Welkom bij ${company.name}`} />
        {checkoutBanner}
        {checklist ?? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Search className="h-6 w-6" />
              </div>
              <p className="max-w-md text-muted-foreground">
                {isAdmin
                  ? "Doe eerst de risicoscan. Daarna ziet u hier precies welke AI Act-verplichtingen voor uw organisatie gelden en hoe ver u bent."
                  : "Er is nog geen risicoscan gedaan. Zodra de beheerder de scan uitvoert, ziet u hier de AI Act-status van uw organisatie."}
              </p>
              {isAdmin && (
                <Button asChild>
                  <Link href="/scan">
                    Start de risicoscan <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </>
    );
  }

  // All the derivation (evidence overlay, obligations, scores, governance,
  // relevance, quick-links) lives in one pure, testable place.
  const {
    required,
    openCount,
    outOfReach,
    gereedheidScore,
    systemsCount,
    trainedCount,
    employeesTotal,
    deadlines,
    governance,
    voortgang,
    rel,
    notApplicableDuties,
    liveExceedsScan,
    relevantLinks,
    irrelevantLinks,
    quickState,
  } = buildDashboardView({
    company,
    profile,
    isAdmin,
    aiSystems,
    documents,
    employees,
    items,
    incidents,
    complaints,
    now: new Date(),
  });

  // "Keep you current": recent AI Act changes relevant to this company (async, so
  // it stays in the page rather than the pure view-model).
  const relevantUpdates = (
    await getEvaluatedUpdates(companySignals(profile, aiSystems.map((s) => s.riskLevel)))
  )
    .filter((u) => u.relevant && daysSince(u.date, new Date()) <= 90)
    .slice(0, 3);

  const stats = [
    { label: "AI-systemen", value: systemsCount, icon: Database },
    { label: "Getrainde medewerkers", value: `${trainedCount}/${employeesTotal}`, icon: GraduationCap },
    { label: "Open verplichtingen", value: openCount, icon: ListChecks },
    { label: "Aankomende deadlines", value: deadlines.length, icon: CalendarClock },
  ];

  const quickCard = (item: (typeof DASHBOARD_NAV)[number]) => {
    const state = quickState(item.href);
    const key = HREF_TO_SURFACE[item.href];
    return (
      <Link key={item.href} href={item.href} className="group">
        <Card
          className={cn(
            "h-full transition-colors group-hover:border-brand-500/50",
            state !== "shown" && "border-dashed"
          )}
        >
          <CardContent className="flex items-start gap-4 py-5">
            <div
              className={cn(
                "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-navy-900",
                state === "irrelevant" && "opacity-60"
              )}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{item.label}</p>
                {state === "locked" && key && <LockBadge tier={rel[key].requiredTier} />}
              </div>
              <p className="text-sm text-muted-foreground">
                {state === "irrelevant" && key ? rel[key].reason : item.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <>
      {/* Welcome + current pakket in one banner — actions always sit side by side. */}
      <div className="mb-6 flex flex-col gap-4 rounded-lg border bg-card p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welkom bij {company.name}</h1>
          <p className="mt-1 text-muted-foreground">Uw AI Act-status op basis van uw scan.</p>
          <p className="mt-3 text-sm">
            <span className="text-muted-foreground">Uw pakket: </span>
            <span className="font-semibold">{planLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button asChild variant="outline">
              <Link href="/scan">Scan bijwerken</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href={company.stripeCustomerId ? "/dashboard/settings" : "/pricing"}>
              {company.stripeCustomerId ? "Abonnement beheren" : "Kies een pakket"}
            </Link>
          </Button>
        </div>
      </div>

      {isAdmin && liveExceedsScan && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-semibold">
              Uw AI-register wijst op zwaardere verplichtingen dan uw laatste scan.
            </p>
            <p className="text-amber-900/80">
              U heeft AI-systemen geregistreerd die op een hoger pakket duiden dan uw scan
              adviseerde. Werk uw risicoscan bij zodat uw advies en dashboard weer kloppen.
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/scan">Scan bijwerken</Link>
          </Button>
        </div>
      )}

      {checkoutBanner}
      {checklist}

      <UpdatesCard updates={relevantUpdates} />

      {/* Two dials: Voortgang (live, moves with activity) + Gereedheid (scan snapshot). */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-brand-200 bg-brand-50/30">
          <CardHeader>
            <CardTitle className="text-base">Voortgang</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <ScoreRing score={voortgang.score} label="voortgang" />
            <Badge variant={voortgang.variant}>{voortgang.label}</Badge>
            <p className="max-w-xs text-xs text-muted-foreground">
              Beweegt mee met wat u doet: AI-systemen registreren, documenten
              genereren en medewerkers trainen.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gereedheid</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 text-center">
            {outOfReach ? (
              <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-full border-4 border-dashed border-muted-foreground/25 text-center">
                <Info className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">geen score</span>
              </div>
            ) : (
              <ScoreRing score={gereedheidScore} label="gereedheid" />
            )}
            {profile && (
              <Badge variant={(HEADLINE[profile.headline] ?? HEADLINE.minimal).variant}>
                {(HEADLINE[profile.headline] ?? HEADLINE.minimal).label}
              </Badge>
            )}
            <p className="max-w-xs text-xs text-muted-foreground">
              {outOfReach
                ? "Op basis van uw laatste scan valt u buiten de AI-wet. Controleer of dit klopt — gebruikt u AI, dan valt u er meestal wél onder."
                : "Op basis van uw laatste risicoscan. Loop de scan elk kwartaal opnieuw door om dit actueel te houden."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex h-full flex-col justify-between gap-4 py-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-3xl font-bold tabular-nums">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance-status: signalen, verplichtingen, kwartaalcheck en deadlines
          grouped in one container (they're all governance detail) as
          independently-collapsible sections — one click each, nothing nested,
          so a danger signal is never more than a glance away. Verplichtingen
          and deadlines (when any) start open; signalen opens by default only
          when there's something to flag; kwartaalcheck starts collapsed
          (periodic, lower priority). */}
      <h2 className="mb-3 mt-10 text-lg font-semibold">Uw compliance in detail</h2>
      <div className="rounded-xl border bg-card">
        <Accordion
          type="multiple"
          defaultValue={[
            "verplichtingen",
            ...(governance.alerts.length > 0 ? ["signalen"] : []),
            ...(deadlines.length > 0 ? ["deadlines"] : []),
          ]}
          className="divide-y-2 divide-slate-200"
        >
          <AccordionItem value="signalen" className="border-0">
            <AccordionTrigger className="px-5 py-4 hover:no-underline">
              <span className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="text-base font-semibold">Signalen</span>
                {governance.alerts.length > 0 ? (
                  <Badge variant="danger">{governance.alerts.length}</Badge>
                ) : (
                  <Badge variant="secondary" className="font-normal">
                    Op orde
                  </Badge>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5">
              {governance.alerts.length === 0 ? (
                <p className="flex items-center gap-2 pb-1 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-brand-600" />
                  Geen openstaande signalen op dit moment.
                </p>
              ) : (
                <ul className="space-y-3 pb-1">
                  {governance.alerts.map((alert, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <AlertTriangle
                        className={
                          alert.severity === "danger"
                            ? "mt-0.5 h-4 w-4 shrink-0 text-red-500"
                            : "mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                        }
                      />
                      <span className="text-sm">{alert.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="verplichtingen" className="border-0">
            <AccordionTrigger className="px-5 py-4 hover:no-underline">
              <span className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="text-base font-semibold">Uw verplichtingen</span>
                {required.length > 0 &&
                  (openCount > 0 ? (
                    <Badge variant="warning">{openCount} open</Badge>
                  ) : (
                    <Badge variant="secondary" className="font-normal">
                      Op orde
                    </Badge>
                  ))}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5">
              <div className="grid gap-3 pb-1">
                {required.length === 0 ? (
                  <p className="py-2 text-sm text-muted-foreground">
                    Geen verplichte acties op basis van uw scan.
                  </p>
                ) : (
                  required.map((o) => (
                    <div
                      key={o.code}
                      className="flex items-center justify-between gap-4 rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        {o.status === "done" || o.status === "compliant" ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" />
                        ) : (
                          <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                        )}
                        <div>
                          <p className="font-medium">{o.title}</p>
                          <p className="text-xs text-muted-foreground">{o.article}</p>
                        </div>
                      </div>
                      {statusBadge(o.status)}
                    </div>
                  ))
                )}
              </div>
              {profile && notApplicableDuties.length > 0 && (
                <RelevanceReveal
                  count={notApplicableDuties.length}
                  label="Toon wat nu niet voor u geldt"
                >
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {notApplicableDuties.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </RelevanceReveal>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="kwartaalcheck" className="border-0">
            <AccordionTrigger className="px-5 py-4 hover:no-underline">
              <span className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="text-base font-semibold">Kwartaalcheck — {governance.quarter}</span>
                <Badge variant="secondary" className="font-normal">
                  {governance.checks.filter((c) => c.done).length}/{governance.checks.length}
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5">
              <div className="space-y-4 pb-1">
                {governance.checks.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-start justify-between gap-4 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      {check.done ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                      ) : (
                        <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/40" />
                      )}
                      <div>
                        <p className="font-medium">{check.label}</p>
                        <p className="text-sm text-muted-foreground">{check.detail}</p>
                      </div>
                    </div>
                    <div className="w-20 shrink-0 pt-1">
                      <Progress value={check.progress * 100} />
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {deadlines.length > 0 && (
            <AccordionItem value="deadlines" className="border-0">
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <span className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="text-base font-semibold">Aankomende deadlines</span>
                  <Badge variant="warning">{deadlines.length}</Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-5">
                <div className="space-y-3 pb-1">
                  {deadlines.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.article}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium">
                        {item.deadline ? formatDate(item.deadline) : "—"}
                      </p>
                    </div>
                  ))}
                </div>
                <PendingPublicationNote className="mt-3" />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>

      {/* Quick links */}
      <h2 className="mb-4 mt-10 text-lg font-semibold">Snel naar</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relevantLinks.map((item) => quickCard(item))}
      </div>
      <RelevanceReveal count={irrelevantLinks.length}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {irrelevantLinks.map((item) => quickCard(item))}
        </div>
      </RelevanceReveal>
    </>
  );
}
