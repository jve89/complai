import Link from "next/link";
import { Award, CheckCircle2, Circle, Download, Lock, Users } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { trainingUnlocked, TIER_LABEL, TRAINING_MIN_TIER } from "@/lib/plan";
import { getLearnerEmployee } from "@/lib/training/learner";
import {
  PATHS,
  getPath,
  modulesForPath,
  moduleCountForPath,
  askCount,
} from "@/lib/training/content";
import type { ComplianceProfile, TrainingRequirement } from "@/lib/compliance/types";
import { companySignals } from "@/lib/compliance/signals";
import { PageHeader } from "@/components/dashboard/page-header";
import { ModuleQuiz } from "@/components/dashboard/training/module-quiz";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function TrainingPage() {
  const { company, user } = await getActiveCompany();
  const unlocked = trainingUnlocked(company.plan);
  const learner = await getLearnerEmployee(company, user);

  const [employees, learnerCompletions, aiSystems] = await Promise.all([
    prisma.employee.findMany({
      where: { companyId: company.id },
      include: { trainingCompletions: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.trainingCompletion.findMany({ where: { employeeId: learner.id } }),
    prisma.aiSystem.findMany({
      where: { companyId: company.id },
      select: { riskLevel: true },
    }),
  ]);

  const doneIds = new Set(learnerCompletions.map((c) => c.moduleId));
  const learnerModules = modulesForPath(learner.role);
  const learnerDone = learnerModules.filter((m) => doneIds.has(m.id)).length;
  const learnerTotal = learnerModules.length;
  const learnerComplete = learnerDone >= learnerTotal;
  const learnerPath = getPath(learner.role)?.label ?? "Medewerker";

  // Which learning paths this company's scan makes required vs recommended.
  const profile = (company.profileJson as unknown as ComplianceProfile | null) ?? null;
  const requiredPaths = new Map<string, TrainingRequirement>(
    (profile?.training?.required ?? []).map((t) => [t.pathSlug, t])
  );
  const recommendedPaths = new Map<string, TrainingRequirement>(
    (profile?.training?.recommended ?? []).map((t) => [t.pathSlug, t])
  );

  // Module-level relevance (Art. 4 "context"): which modules the company's own
  // scan + AI-register make especially pertinent. Grounded in concrete signals,
  // so the "voor u"-markers are honest rather than decorative.
  const { hasProhibited, hasHighRisk, hasLimited, isProvider } = companySignals(
    profile,
    aiSystems.map((s) => s.riskLevel)
  );

  const moduleRelevance = new Map<string, string>();
  if (hasProhibited)
    moduleRelevance.set(
      "prohibited-practices",
      "Uw scan wees op een mogelijk verboden praktijk — ken de grenzen van Art. 5."
    );
  if (hasHighRisk) {
    moduleRelevance.set("high-risk", "U heeft hoog-risico AI in beeld — deze module gaat daar direct over.");
    moduleRelevance.set("human-oversight", "Hoog-risico AI vereist effectief menselijk toezicht (Art. 14).");
    moduleRelevance.set(
      "deployer-duties",
      "Als gebruiksverantwoordelijke van hoog-risico AI heeft u concrete plichten (Art. 26/27)."
    );
    moduleRelevance.set(
      "risk-management",
      "Hoog-risico AI vraagt om risicomanagement, logging en robuustheid (Art. 9/12/15)."
    );
  }
  if (hasLimited)
    moduleRelevance.set(
      "responsible-use",
      "U gebruikt AI met transparantieplichten (Art. 50) — verantwoord gebruik is dan cruciaal."
    );
  if (isProvider)
    moduleRelevance.set(
      "technical-docs",
      "U treedt (mede) op als aanbieder — technische documentatie is dan verplicht (Art. 11)."
    );

  const anyRelevant = unlocked && learnerModules.some((m) => moduleRelevance.has(m.id));

  return (
    <>
      <PageHeader
        title="E-learning"
        description="Borg AI-geletterdheid (Art. 4) met rolgerichte leerpaden en certificaten."
      />

      {!unlocked && (
        <div className="mb-8 flex flex-col gap-3 rounded-lg border border-navy-100 bg-navy-50 p-4 text-navy-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-semibold">
              E-learning is beschikbaar vanaf {TIER_LABEL[TRAINING_MIN_TIER]}
            </p>
            <p className="text-muted-foreground">
              Hieronder ziet u welke leerpaden en modules u krijgt. Upgrade om ze te
              volgen, de voortgang van uw team te bewaken en certificaten te behalen.
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/pricing">Bekijk pakketten</Link>
          </Button>
        </div>
      )}

      {/* Paths */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {PATHS.map((path) => {
          const active = path.id === learner.role;
          const req = requiredPaths.get(path.id);
          const rec = recommendedPaths.get(path.id);
          return (
            <Card
              key={path.id}
              className={active ? "border-brand-500 ring-1 ring-brand-500" : ""}
            >
              <CardContent className="space-y-2 py-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold">{path.label}</span>
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {req ? (
                      <Badge variant="warning">Verplicht</Badge>
                    ) : (
                      rec && <Badge variant="secondary">Aanbevolen</Badge>
                    )}
                    {active && <Badge>Uw leerpad</Badge>}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{path.audience}</p>
                <p className="text-xs font-medium text-muted-foreground">
                  {moduleCountForPath(path.id)} modules
                </p>
                {(req ?? rec) && (
                  <p className="text-xs font-medium text-brand-700">
                    {(req ?? rec)!.reason}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Learner progress — hidden on the free tier (no completions possible). */}
      {unlocked && (
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">
                Uw voortgang — {learner.name}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Leerpad {learnerPath} · {learnerDone}/{learnerTotal} modules
                afgerond
              </p>
            </div>
            {learnerComplete && (
              <Button asChild>
                <a
                  href={`/api/pdf/certificate/${learner.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Award className="h-4 w-4" /> Download certificaat
                </a>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={(learnerDone / learnerTotal) * 100} />
        </CardContent>
      </Card>
      )}

      {/* Modules */}
      <h2 className="mb-1 text-lg font-semibold">Modules</h2>
      {anyRelevant && (
        <p className="mb-4 text-sm text-muted-foreground">
          Op basis van uw risicoscan en AI-register zijn sommige modules{" "}
          <span className="font-medium text-brand-700">
            extra relevant voor uw organisatie
          </span>{" "}
          — die staan gemarkeerd.
        </p>
      )}
      <div className="mb-10 space-y-3">
        {learnerModules.map((module, i) => {
          const done = unlocked && doneIds.has(module.id);
          return (
            <Card key={module.id} className={cn(!unlocked && "opacity-75")}>
              <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  {!unlocked ? (
                    <Lock className="mt-0.5 h-6 w-6 shrink-0 text-muted-foreground/50" />
                  ) : done ? (
                    <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-brand-600" />
                  ) : (
                    <Circle className="mt-0.5 h-6 w-6 shrink-0 text-muted-foreground/40" />
                  )}
                  <div>
                    <p className="font-medium">
                      {i + 1}. {module.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {module.minutes} min · {askCount(module)} vragen
                    </p>
                    {unlocked && moduleRelevance.has(module.id) && (
                      <p className="mt-1 text-xs font-medium text-brand-700">
                        {moduleRelevance.get(module.id)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 pl-10 sm:pl-0">
                  {unlocked ? (
                    <>
                      {moduleRelevance.has(module.id) && !done && (
                        <Badge variant="warning">Voor u relevant</Badge>
                      )}
                      {done && <Badge variant="success">Afgerond</Badge>}
                      <ModuleQuiz
                        module={module}
                        trigger={
                          <Button variant={done ? "outline" : "default"} size="sm">
                            {done ? "Opnieuw doen" : "Start module"}
                          </Button>
                        }
                      />
                    </>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <Link href="/pricing">
                        <Lock className="h-4 w-4" /> Beschikbaar vanaf{" "}
                        {TIER_LABEL[TRAINING_MIN_TIER]}
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Overview — team tracking is part of the paid e-learning feature. */}
      {unlocked && (
      <>
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Voortgang medewerkers</h2>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medewerker</TableHead>
                <TableHead>Leerpad</TableHead>
                <TableHead>Voortgang</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Certificaat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => {
                const empTotal = moduleCountForPath(emp.role);
                const completed = Math.min(emp.trainingCompletions.length, empTotal);
                const pct = Math.round((completed / empTotal) * 100);
                const complete = completed >= empTotal;
                return (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell className="text-sm">
                      {getPath(emp.role)?.label ?? emp.role}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="w-24" />
                        <span className="text-xs text-muted-foreground">
                          {completed}/{empTotal}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {complete ? (
                        <Badge variant="success">Afgerond</Badge>
                      ) : completed > 0 ? (
                        <Badge variant="warning">Bezig</Badge>
                      ) : (
                        <Badge variant="secondary">Niet gestart</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {completed > 0 ? (
                        <a
                          href={`/api/pdf/certificate/${emp.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <Download className="h-4 w-4" /> Download
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </>
      )}
    </>
  );
}
