import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  CalendarClock,
  CheckCircle2,
  Database,
  Eye,
  GraduationCap,
  Layers,
  ListChecks,
  type LucideIcon,
} from "lucide-react";

import { getActiveCompany } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { STATUS_BADGE, STATUS_LABEL } from "@/lib/scan/status";
import type { ArticleStatus } from "@/lib/scan/scoring";
import { DASHBOARD_NAV } from "@/components/dashboard/nav-items";
import { ScoreRing } from "@/components/score-ring";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STATUS_SCORE: Record<ArticleStatus, number> = {
  compliant: 100,
  in_progress: 50,
  open: 0,
};

const ARTICLE_META: Record<string, { icon: LucideIcon; name: string }> = {
  "Art. 4": { icon: GraduationCap, name: "AI-geletterdheid" },
  "Art. 5": { icon: Ban, name: "Verboden praktijken" },
  "Art. 50": { icon: Eye, name: "Transparantie" },
  "Art. 6": { icon: Layers, name: "Hoog-risico classificatie" },
};
const ARTICLE_ORDER = ["Art. 4", "Art. 5", "Art. 50", "Art. 6"];

function daysUntil(date: Date) {
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default async function DashboardPage() {
  const { company } = await getActiveCompany();

  const [aiSystems, employees, items] = await Promise.all([
    prisma.aiSystem.findMany({ where: { companyId: company.id } }),
    prisma.employee.findMany({ where: { companyId: company.id } }),
    prisma.complianceItem.findMany({
      where: { companyId: company.id },
      orderBy: { deadline: "asc" },
    }),
  ]);

  const score = items.length
    ? Math.round(
        items.reduce((s, i) => s + STATUS_SCORE[i.status as ArticleStatus], 0) /
          items.length
      )
    : 0;

  const openActions = items.filter((i) => i.status !== "compliant");
  const deadlines = items
    .filter((i) => i.deadline && i.status !== "compliant")
    .slice(0, 4);

  const trainedCount = employees.filter((e) => e.trainingCompleted).length;
  const level =
    score >= 75 ? "Goed op orde" : score >= 45 ? "Op de goede weg" : "Actie nodig";

  const stats = [
    { label: "AI-systemen", value: aiSystems.length, icon: Database },
    {
      label: "Getrainde medewerkers",
      value: `${trainedCount}/${employees.length}`,
      icon: GraduationCap,
    },
    { label: "Open acties", value: openActions.length, icon: ListChecks },
    {
      label: "Aankomende deadlines",
      value: deadlines.length,
      icon: CalendarClock,
    },
  ];

  return (
    <>
      <PageHeader
        title={`Welkom bij ${company.name}`}
        description="Uw compliance-status met de EU AI Act in één oogopslag."
      >
        <Button asChild>
          <Link href="/dashboard/register">
            Naar AI-register <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </PageHeader>

      {/* Score + stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Compliance-score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <ScoreRing score={score} />
            <Badge
              variant={
                score >= 75 ? "success" : score >= 45 ? "warning" : "danger"
              }
            >
              {level}
            </Badge>
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

      {/* Article status cards */}
      <h2 className="mb-4 mt-10 text-lg font-semibold">
        Status per AI Act-artikel
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ARTICLE_ORDER.map((article) => {
          const item = items.find((i) => i.article === article);
          const meta = ARTICLE_META[article];
          const status = (item?.status ?? "open") as ArticleStatus;
          return (
            <Card key={article}>
              <CardContent className="space-y-3 py-6">
                <div className="flex items-center justify-between">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-brand-400">
                    <meta.icon className="h-5 w-5" />
                  </div>
                  <Badge variant={STATUS_BADGE[status]}>
                    {STATUS_LABEL[status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {article}
                  </p>
                  <p className="font-semibold">{meta.name}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions + deadlines */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <ListChecks className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Openstaande acties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {openActions.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-brand-600" />
                Geen openstaande acties. Goed bezig!
              </p>
            ) : (
              openActions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.article}
                    </p>
                  </div>
                  <Badge variant={STATUS_BADGE[item.status as ArticleStatus]}>
                    {STATUS_LABEL[item.status as ArticleStatus]}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Aankomende deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Geen aankomende deadlines.
              </p>
            ) : (
              deadlines.map((item) => {
                const days = item.deadline ? daysUntil(item.deadline) : null;
                const urgent = days !== null && days <= 30;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-2">
                      {urgent && (
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.article}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {item.deadline ? formatDate(item.deadline) : "—"}
                      </p>
                      {days !== null && (
                        <p
                          className={
                            urgent
                              ? "text-xs font-medium text-amber-600"
                              : "text-xs text-muted-foreground"
                          }
                        >
                          over {days} dagen
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

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
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
