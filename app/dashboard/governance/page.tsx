import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Circle,
  ShieldAlert,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { computeGovernance } from "@/lib/governance/score";
import type { ComplianceProfile } from "@/lib/compliance/types";
import { PageHeader } from "@/components/dashboard/page-header";
import { ScoreRing } from "@/components/score-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function GovernancePage() {
  const { company } = await getActiveCompany();

  const [aiSystems, documents, employees, complianceItems] = await Promise.all([
    prisma.aiSystem.findMany({ where: { companyId: company.id } }),
    prisma.document.findMany({ where: { companyId: company.id } }),
    prisma.employee.findMany({ where: { companyId: company.id } }),
    prisma.complianceItem.findMany({ where: { companyId: company.id } }),
  ]);

  const profile = (company.profileJson as unknown as ComplianceProfile | null) ?? null;

  const report = computeGovernance(
    { aiSystems, documents, employees, complianceItems, profile },
    new Date()
  );

  const passed = report.checks.filter((c) => c.done).length;
  const level =
    report.score >= 80 ? "success" : report.score >= 50 ? "warning" : "danger";
  const levelLabel =
    report.score >= 80
      ? "Goed in control"
      : report.score >= 50
        ? "Redelijk in control"
        : "Aandacht nodig";

  return (
    <>
      <PageHeader
        title="Governance"
        description="Blijf continu in control met kwartaalchecks en signalen."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Score */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarCheck className="h-5 w-5 text-muted-foreground" />
              Governance-score · {report.quarter}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <ScoreRing score={report.score} label="governance" />
            <Badge variant={level}>{levelLabel}</Badge>
            <p className="text-sm text-muted-foreground">
              {passed}/{report.checks.length} kwartaalchecks afgerond
            </p>
          </CardContent>
        </Card>

        {/* Quarterly checklist */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Kwartaalcheck — {report.quarter}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.checks.map((check) => (
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
                    <p className="text-sm text-muted-foreground">
                      {check.detail}
                    </p>
                  </div>
                </div>
                <div className="w-20 shrink-0 pt-1">
                  <Progress value={check.progress * 100} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="mt-8 flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Signalen</h2>
        {report.alerts.length > 0 && (
          <Badge variant="danger">{report.alerts.length}</Badge>
        )}
      </div>

      <Card className="mt-4">
        <CardContent className="py-5">
          {report.alerts.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-brand-600" />
              Geen openstaande signalen. Alles is up-to-date.
            </p>
          ) : (
            <ul className="space-y-3">
              {report.alerts.map((alert, i) => (
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
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { href: "/dashboard/register", label: "Naar AI-register" },
          { href: "/dashboard/documents", label: "Naar documenten" },
          { href: "/dashboard/training", label: "Naar e-learning" },
        ].map((link) => (
          <Button key={link.href} asChild variant="outline" className="justify-between">
            <Link href={link.href}>
              {link.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ))}
      </div>
    </>
  );
}
