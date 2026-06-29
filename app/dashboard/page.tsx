import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Circle,
  Database,
  GraduationCap,
  ListChecks,
  Search,
} from "lucide-react";

import { getActiveCompany } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import type { ComplianceProfile } from "@/lib/compliance/types";
import { DASHBOARD_NAV } from "@/components/dashboard/nav-items";
import { ScoreRing } from "@/components/score-ring";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const HEADLINE: Record<
  ComplianceProfile["headline"],
  { label: string; variant: "success" | "info" | "warning" | "danger" | "secondary" }
> = {
  prohibited: { label: "Verboden praktijk", variant: "danger" },
  high_risk: { label: "Hoog risico", variant: "warning" },
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

export default async function DashboardPage() {
  const { company } = await getActiveCompany();
  const profile = (company.profileJson as unknown as ComplianceProfile | null) ?? null;

  const [aiSystems, employees, items] = await Promise.all([
    prisma.aiSystem.count({ where: { companyId: company.id } }),
    prisma.employee.findMany({ where: { companyId: company.id } }),
    prisma.complianceItem.findMany({
      where: { companyId: company.id },
      orderBy: { deadline: "asc" },
    }),
  ]);

  // No scan yet → prompt to run it.
  if (!profile && items.length === 0) {
    return (
      <>
        <PageHeader title={`Welkom bij ${company.name}`} />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Search className="h-6 w-6" />
            </div>
            <p className="max-w-md text-muted-foreground">
              Doe eerst de risicoscan. Daarna ziet u hier precies welke AI Act-verplichtingen
              voor uw organisatie gelden en hoe ver u bent.
            </p>
            <Button asChild>
              <Link href="/scan">
                Start de risicoscan <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  const obligations =
    profile?.obligations ??
    items.map((i) => ({
      code: i.id,
      title: i.title,
      article: i.article,
      status: i.status as string,
      required: i.required ?? true,
    }));

  const required = obligations.filter((o) => o.required);
  const open = required.filter((o) => o.status !== "done" && o.status !== "compliant");
  const score =
    profile?.score ??
    (required.length
      ? Math.round(
          (required.filter((o) => o.status === "compliant" || o.status === "done").length /
            required.length) *
            100
        )
      : 0);
  const trained = employees.filter((e) => e.trainingCompleted).length;
  const deadlines = items
    .filter((i) => i.deadline && i.status !== "compliant")
    .slice(0, 4);

  const stats = [
    { label: "AI-systemen", value: aiSystems, icon: Database },
    { label: "Getrainde medewerkers", value: `${trained}/${employees.length}`, icon: GraduationCap },
    { label: "Open verplichtingen", value: open.length, icon: ListChecks },
    { label: "Aankomende deadlines", value: deadlines.length, icon: CalendarClock },
  ];

  return (
    <>
      <PageHeader
        title={`Welkom bij ${company.name}`}
        description="Uw AI Act-status op basis van uw scan."
      >
        <Button asChild variant="outline">
          <Link href="/scan">Scan opnieuw doen</Link>
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Gereedheid</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <ScoreRing score={score} label="gereedheid" />
            {profile && (
              <Badge variant={HEADLINE[profile.headline].variant}>
                {HEADLINE[profile.headline].label}
              </Badge>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
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
      </div>

      {/* Obligations */}
      <h2 className="mb-4 mt-10 text-lg font-semibold">Uw verplichtingen</h2>
      <div className="grid gap-3">
        {required.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-muted-foreground">
              Geen verplichte acties op basis van uw scan.
            </CardContent>
          </Card>
        ) : (
          required.map((o) => (
            <Card key={o.code}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
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
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Deadlines */}
      {deadlines.length > 0 && (
        <>
          <h2 className="mb-4 mt-10 text-lg font-semibold">Aankomende deadlines</h2>
          <Card>
            <CardContent className="space-y-3 py-5">
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
            </CardContent>
          </Card>
        </>
      )}

      {/* Quick links */}
      <h2 className="mb-4 mt-10 text-lg font-semibold">Snel naar</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DASHBOARD_NAV.filter((n) => n.href !== "/dashboard").map((item) => (
          <Link key={item.href} href={item.href} className="group">
            <Card className="h-full transition-colors group-hover:border-brand-500/50">
              <CardContent className="flex items-start gap-4 py-5">
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-navy-900">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
