import { Award, CheckCircle2, Circle, Download, Users } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { getLearnerEmployee } from "@/lib/training/learner";
import {
  PATHS,
  getPath,
  modulesForPath,
  moduleCountForPath,
} from "@/lib/training/content";
import type { ComplianceProfile, TrainingRequirement } from "@/lib/compliance/types";
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
  const learner = await getLearnerEmployee(company, user);

  const [employees, learnerCompletions] = await Promise.all([
    prisma.employee.findMany({
      where: { companyId: company.id },
      include: { trainingCompletions: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.trainingCompletion.findMany({ where: { employeeId: learner.id } }),
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

  return (
    <>
      <PageHeader
        title="E-learning"
        description="Borg AI-geletterdheid (Art. 4) met rolgerichte leerpaden en certificaten."
      />

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

      {/* Learner progress */}
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

      {/* Modules */}
      <h2 className="mb-4 text-lg font-semibold">Modules</h2>
      <div className="mb-10 space-y-3">
        {learnerModules.map((module, i) => {
          const done = doneIds.has(module.id);
          return (
            <Card key={module.id}>
              <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-brand-600" />
                  ) : (
                    <Circle className="mt-0.5 h-6 w-6 shrink-0 text-muted-foreground/40" />
                  )}
                  <div>
                    <p className="font-medium">
                      {i + 1}. {module.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {module.minutes} min · {module.quiz.length} vragen
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pl-10 sm:pl-0">
                  {done && <Badge variant="success">Afgerond</Badge>}
                  <ModuleQuiz
                    module={module}
                    trigger={
                      <Button variant={done ? "outline" : "default"} size="sm">
                        {done ? "Opnieuw doen" : "Start module"}
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Overview */}
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
  );
}
