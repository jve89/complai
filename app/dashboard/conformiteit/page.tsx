import Link from "next/link";
import { Lock, Pencil, ClipboardCheck, FileDown } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getActiveCompany, canAdminister } from "@/lib/auth";
import { cn, formatDate } from "@/lib/utils";
import { conformityUnlocked, TIER_LABEL, CONFORMITY_MIN_TIER } from "@/lib/plan";
import { surfaceRelevance } from "@/lib/compliance/relevance";
import type { ComplianceProfile } from "@/lib/compliance/types";
import {
  ROUTE_LABEL,
  conformityProgress,
  PROVIDER_NOTE,
  ROUTE_NOTE,
  APPLIES_FROM_NOTE,
  type ConformityRoute,
  type StepsMap,
} from "@/lib/conformiteit/labels";
import { PageHeader } from "@/components/dashboard/page-header";
import { NotRelevantBanner } from "@/components/dashboard/relevance";
import { RuleNote } from "@/components/dashboard/rule-note";
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
import { ConformityDialog } from "@/components/dashboard/conformiteit/conformity-dialog";

export const dynamic = "force-dynamic";

export default async function ConformiteitPage() {
  const { company, user } = await getActiveCompany();
  const isAdmin = canAdminister(user);
  const unlocked = conformityUnlocked(company.plan);

  // Art 43 conformity assessment applies to high-risk systems (Annex III).
  const systems = await prisma.aiSystem.findMany({
    where: { companyId: company.id, riskLevel: "high" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      vendor: true,
      conformityAssessment: {
        select: { route: true, steps: true, notes: true, reviewedAt: true },
      },
    },
  });

  const completed = systems.filter((s) => {
    const { done, total } = conformityProgress(
      (s.conformityAssessment?.steps as unknown as StepsMap) ?? null
    );
    return done === total;
  }).length;

  // Scan-driven visibility (Phase B): does this provider module apply? (A separate
  // query — the list above is scoped to high-risk rows and has no role.)
  const relSystems = await prisma.aiSystem.findMany({
    where: { companyId: company.id },
    select: { role: true, riskLevel: true },
  });
  const profile = (company.profileJson as unknown as ComplianceProfile | null) ?? null;
  const rel = surfaceRelevance(profile, relSystems).conformiteit;
  const notRelevant = !rel.applies;

  return (
    <>
      <PageHeader
        title="Conformiteit"
        description="Volg de conformiteitsbeoordeling per hoog-risico systeem tot aan CE-markering."
      >
        {unlocked && systems.length > 0 && (
          <Button asChild variant="outline">
            <a href="/api/pdf/conformiteit" target="_blank" rel="noopener noreferrer">
              <FileDown className="h-4 w-4" /> Statusoverzicht (PDF)
            </a>
          </Button>
        )}
      </PageHeader>

      {notRelevant && <NotRelevantBanner reason={rel.reason} />}

      {!notRelevant && !unlocked && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-navy-100 bg-navy-50 p-4 text-navy-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-semibold">
              De conformiteitsbeoordeling is beschikbaar vanaf {TIER_LABEL[CONFORMITY_MIN_TIER]}
            </p>
            <p className="text-muted-foreground">
              Hieronder ziet u wat u krijgt. Upgrade om per systeem de route en de stappen
              richting CE-markering te volgen en als bewijs te genereren.
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/pricing">Bekijk pakketten</Link>
          </Button>
        </div>
      )}

      {!isAdmin && (
        <div className="mb-6 rounded-lg border bg-secondary/30 p-4 text-sm text-muted-foreground">
          U heeft alleen-leestoegang. Alleen de beheerder kan de conformiteitsbeoordeling
          vastleggen.
        </div>
      )}

      <RuleNote
        summary={
          <>
            Bent u <strong className="font-medium text-foreground/80">alleen gebruiker</strong> van
            andermans AI, zónder er iets wezenlijks aan te veranderen? Dan geldt de
            conformiteitsbeoordeling niet voor u. Bent u zelf de maker van een hoog-risico systeem —
            of zet u uw eigen naam of merk erop, of past u het ingrijpend aan? Dan wordt u aanbieder
            en doorloopt u die beoordeling vóór verkoop, tot en met de CE-markering. Naar verwachting
            verplicht vanaf 2 december 2027.
          </>
        }
      >
        <p>{PROVIDER_NOTE}</p>
        <p>
          Let op: zet u uw eigen naam of merk op een systeem, past u het wezenlijk aan, of gebruikt u
          het voor een ander doel waardoor het hoog-risico wordt? Dan wordt u zelf aanbieder (Art. 25)
          en geldt de beoordeling (opnieuw) voor u (Art. 43 lid 4).
        </p>
        <p>{ROUTE_NOTE}</p>
        <p>{APPLIES_FROM_NOTE}</p>
      </RuleNote>

      <Card>
        <CardContent className="p-0">
          {systems.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <p className="max-w-md text-muted-foreground">
                U heeft geen systemen als <strong>hoog risico</strong> geclassificeerd. De
                conformiteitsbeoordeling (Art. 43) geldt zodra u een hoog-risico systeem als
                aanbieder op de markt brengt.
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard/register">Naar het AI-register</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="border-b px-4 py-3 text-sm text-muted-foreground">
                {completed} van {systems.length} hoog-risico systemen hebben alle stappen
                afgerond.
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Systeem</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Voortgang</TableHead>
                    <TableHead>Laatst herzien</TableHead>
                    <TableHead className="text-right">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systems.map((s) => {
                    const ca = s.conformityAssessment;
                    const steps = (ca?.steps as unknown as StepsMap) ?? null;
                    const { done, total } = conformityProgress(steps);
                    const route = (ca?.route as ConformityRoute) ?? "internal";
                    return (
                      <TableRow key={s.id} className={cn(!unlocked && "opacity-60")}>
                        <TableCell>
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.vendor || "Onbekende leverancier"}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {ca ? ROUTE_LABEL[route] : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={done === total ? "success" : done > 0 ? "info" : "secondary"}>
                            {done}/{total} stappen
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {ca?.reviewedAt ? formatDate(ca.reviewedAt) : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            {isAdmin && unlocked ? (
                              <ConformityDialog
                                system={{
                                  id: s.id,
                                  name: s.name,
                                  route: ca?.route ?? null,
                                  steps,
                                  notes: ca?.notes ?? null,
                                  reviewedAt: ca?.reviewedAt ?? null,
                                }}
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Beoordeling bewerken"
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                }
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
