import Link from "next/link";
import { Lock, Pencil, Plus, Wrench, FileDown } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getActiveCompany, canAdminister } from "@/lib/auth";
import { cn, formatDate } from "@/lib/utils";
import { correctiveUnlocked, TIER_LABEL, CORRECTIVE_MIN_TIER } from "@/lib/plan";
import { surfaceRelevance } from "@/lib/compliance/relevance";
import type { ComplianceProfile } from "@/lib/compliance/types";
import {
  ACTION_LABEL,
  STATUS_LABEL,
  STATUS_BADGE,
  PROVIDER_NOTE,
  INCIDENT_LINK_NOTE,
  APPLIES_FROM_NOTE,
  type ActionType,
  type CorrectiveStatus,
} from "@/lib/corrigerend/labels";
import { PageHeader } from "@/components/dashboard/page-header";
import { NotRelevantBanner } from "@/components/dashboard/relevance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CorrectiveActionDialog } from "@/components/dashboard/corrigerend/corrective-action-dialog";
import { DeleteCorrectiveActionButton } from "@/components/dashboard/corrigerend/delete-corrective-action-button";

export const dynamic = "force-dynamic";

export default async function CorrigerendPage() {
  const { company, user } = await getActiveCompany();
  const isAdmin = canAdminister(user);
  const unlocked = correctiveUnlocked(company.plan);

  const [actions, systems] = await Promise.all([
    prisma.correctiveAction.findMany({
      where: { companyId: company.id },
      orderBy: { identifiedAt: "desc" },
      include: { aiSystem: { select: { name: true } } },
    }),
    prisma.aiSystem.findMany({
      where: { companyId: company.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, role: true, riskLevel: true },
    }),
  ]);

  // Scan-driven visibility (Phase B): does this provider module apply?
  const profile = (company.profileJson as unknown as ComplianceProfile | null) ?? null;
  const rel = surfaceRelevance(profile, systems).corrigerend;
  const notRelevant = !rel.applies;

  const addTrigger = (
    <Button>
      <Plus className="h-4 w-4" /> Maatregel vastleggen
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Corrigerende maatregelen"
        description="Leg corrigerende maatregelen vast bij non-conforme hoog-risico systemen."
      >
        {unlocked && actions.length > 0 && (
          <Button asChild variant="outline">
            <a href="/api/pdf/corrigerend" target="_blank" rel="noopener noreferrer">
              <FileDown className="h-4 w-4" /> Register (PDF)
            </a>
          </Button>
        )}
        {isAdmin &&
          (unlocked ? (
            <CorrectiveActionDialog systems={systems} trigger={addTrigger} />
          ) : (
            <Button asChild variant="outline">
              <Link href="/pricing">
                <Lock className="h-4 w-4" /> Beschikbaar vanaf {TIER_LABEL[CORRECTIVE_MIN_TIER]}
              </Link>
            </Button>
          ))}
      </PageHeader>

      {notRelevant && <NotRelevantBanner reason={rel.reason} />}

      {!notRelevant && !unlocked && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-navy-100 bg-navy-50 p-4 text-navy-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-semibold">
              Corrigerende maatregelen zijn beschikbaar vanaf {TIER_LABEL[CORRECTIVE_MIN_TIER]}
            </p>
            <p className="text-muted-foreground">
              Hieronder ziet u wat u krijgt. Upgrade om maatregelen bij non-conformiteit vast
              te leggen en het register als bewijs te genereren.
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/pricing">Bekijk pakketten</Link>
          </Button>
        </div>
      )}

      {!isAdmin && (
        <div className="mb-6 rounded-lg border bg-secondary/30 p-4 text-sm text-muted-foreground">
          U heeft alleen-leestoegang. Alleen de beheerder kan corrigerende maatregelen
          vastleggen of bewerken.
        </div>
      )}

      <div className="mb-4 rounded-lg border bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
        <p>{PROVIDER_NOTE}</p>
        <p className="mt-1">{INCIDENT_LINK_NOTE}</p>
        <p className="mt-1">{APPLIES_FROM_NOTE}</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {actions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <Wrench className="h-6 w-6" />
              </div>
              <p className="text-muted-foreground">Nog geen corrigerende maatregelen geregistreerd.</p>
              {isAdmin &&
                (unlocked ? (
                  <CorrectiveActionDialog
                    systems={systems}
                    trigger={
                      <Button>
                        <Plus className="h-4 w-4" /> Eerste maatregel vastleggen
                      </Button>
                    }
                  />
                ) : (
                  <Button asChild variant="outline">
                    <Link href="/pricing">
                      <Lock className="h-4 w-4" /> Beschikbaar vanaf {TIER_LABEL[CORRECTIVE_MIN_TIER]}
                    </Link>
                  </Button>
                ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Non-conformiteit</TableHead>
                  <TableHead>Betreft systeem</TableHead>
                  <TableHead>Maatregel</TableHead>
                  <TableHead>Vastgesteld</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actions.map((a) => {
                  const status = a.status as CorrectiveStatus;
                  return (
                    <TableRow key={a.id} className={cn(!unlocked && "opacity-60")}>
                      <TableCell className="max-w-xs">
                        <p className="font-medium">{a.title}</p>
                        {a.presentsRisk && (
                          <p className="text-xs text-amber-600">Art. 79(1)-risico</p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {a.aiSystem?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ACTION_LABEL[a.actionType as ActionType] ?? a.actionType}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(a.identifiedAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE[status] ?? "secondary"}>
                          {STATUS_LABEL[status] ?? a.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {isAdmin && unlocked && (
                            <CorrectiveActionDialog
                              action={a}
                              systems={systems}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Bewerken"
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              }
                            />
                          )}
                          {isAdmin && <DeleteCorrectiveActionButton id={a.id} title={a.title} />}
                          {!isAdmin && <span className="text-xs text-muted-foreground">—</span>}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
