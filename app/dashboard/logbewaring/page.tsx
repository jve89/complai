import Link from "next/link";
import { Lock, Pencil, Archive, FileDown } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getActiveCompany, canAdminister } from "@/lib/auth";
import { cn, formatDate } from "@/lib/utils";
import { logRetentionUnlocked, TIER_LABEL, LOG_RETENTION_MIN_TIER } from "@/lib/plan";
import { surfaceRelevance } from "@/lib/compliance/relevance";
import { readProfile } from "@/lib/compliance/read-profile";
import {
  logStatus,
  LOG_STATUS_LABEL,
  LOG_STATUS_BADGE,
  MIN_RETENTION_MONTHS,
  APPLIES_FROM_NOTE,
  UNDER_CONTROL_NOTE,
} from "@/lib/logbewaring/labels";
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
import { LogRetentionDialog } from "@/components/dashboard/logbewaring/log-retention-dialog";

export const dynamic = "force-dynamic";

export default async function LogbewaringPage() {
  const { company, user } = await getActiveCompany();
  const isAdmin = canAdminister(user);
  const unlocked = logRetentionUnlocked(company.plan);

  // Art 26(6) applies to high-risk systems. We record the retention policy for
  // each; "unacceptable" systems shouldn't be deployed at all, so we scope to high.
  const systems = await prisma.aiSystem.findMany({
    where: { companyId: company.id, riskLevel: "high" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      vendor: true,
      logLocation: true,
      logRetentionMonths: true,
      logRetentionOwner: true,
      logReviewedAt: true,
    },
  });

  const documented = systems.filter((s) => logStatus(s) === "ok").length;

  // Scan-driven visibility (Phase B): does this module apply to the company?
  const relSystems = await prisma.aiSystem.findMany({
    where: { companyId: company.id },
    select: { role: true, riskLevel: true },
  });
  const profile = readProfile(company.profileJson);
  const rel = surfaceRelevance(profile, relSystems).logbewaring;
  const notRelevant = !rel.applies;

  return (
    <>
      <PageHeader
        title="Logbewaring"
        description="Leg vast hoe u de logs van uw hoog-risico AI-systemen bewaart."
      >
        {unlocked && systems.length > 0 && (
          <Button asChild variant="outline">
            <a href="/api/pdf/log-retention" target="_blank" rel="noopener noreferrer">
              <FileDown className="h-4 w-4" /> Logbewaringsbeleid (PDF)
            </a>
          </Button>
        )}
      </PageHeader>

      {notRelevant && <NotRelevantBanner reason={rel.reason} />}

      {!notRelevant && !unlocked && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-navy-100 bg-navy-50 p-4 text-navy-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-semibold">
              De logbewaring is beschikbaar vanaf {TIER_LABEL[LOG_RETENTION_MIN_TIER]}
            </p>
            <p className="text-muted-foreground">
              Hieronder ziet u wat u krijgt. Upgrade om per hoog-risico systeem de
              logbewaring vast te leggen en het beleid als bewijs te genereren.
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/pricing">Bekijk pakketten</Link>
          </Button>
        </div>
      )}

      {!isAdmin && (
        <div className="mb-6 rounded-lg border bg-secondary/30 p-4 text-sm text-muted-foreground">
          U heeft alleen-leestoegang. Alleen de beheerder kan de logbewaring vastleggen.
        </div>
      )}

      <RuleNote
        summary={
          <>
            Bewaar de logs die uw hoog-risico AI automatisch bijhoudt —{" "}
            <strong className="font-medium text-foreground/80">ten minste zes maanden</strong>, voor
            zover u die logs zelf beheert. Draait de AI bij een leverancier? Dan bewaart die de logs
            vaak zelf. Leg dan vast wat u wél zelf in handen heeft. Deze plicht geldt naar verwachting
            vanaf 2 december 2027.
          </>
        }
      >
        <p>{APPLIES_FROM_NOTE}</p>
        <p>{UNDER_CONTROL_NOTE}</p>
        <p>
          Schrijft ander Unie- of nationaal recht — met name de privacyregels (AVG) — een kortere
          bewaartermijn voor, dan gaat dat vóór (Art. 26 lid 6).
        </p>
      </RuleNote>

      <Card>
        <CardContent className="p-0">
          {systems.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <Archive className="h-6 w-6" />
              </div>
              <p className="max-w-md text-muted-foreground">
                U heeft geen systemen als <strong>hoog risico</strong> geclassificeerd. Art. 26
                lid 6 geldt zodra u een hoog-risico Annex III-systeem inzet.
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard/register">Naar het AI-register</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="border-b px-4 py-3 text-sm text-muted-foreground">
                {documented} van {systems.length} hoog-risico systemen hebben een vastgelegde
                logbewaring.
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Systeem</TableHead>
                    <TableHead>Bewaarplaats</TableHead>
                    <TableHead>Bewaartermijn</TableHead>
                    <TableHead>Verantwoordelijke</TableHead>
                    <TableHead>Laatst herzien</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systems.map((s) => {
                    const status = logStatus(s);
                    return (
                      <TableRow key={s.id} className={cn(!unlocked && "opacity-60")}>
                        <TableCell>
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.vendor || "Onbekende leverancier"}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-xs text-sm text-muted-foreground">
                          {s.logLocation?.trim() || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {s.logRetentionMonths != null ? `${s.logRetentionMonths} mnd` : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {s.logRetentionOwner?.trim() || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {s.logReviewedAt ? formatDate(s.logReviewedAt) : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={LOG_STATUS_BADGE[status]}>
                            {LOG_STATUS_LABEL[status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            {isAdmin && unlocked ? (
                              <LogRetentionDialog
                                system={s}
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Logbewaring bewerken"
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
