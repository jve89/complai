import Link from "next/link";
import { Lock, Pencil, Plus, MessageSquareWarning, FileDown } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getActiveCompany, canAdminister } from "@/lib/auth";
import { cn, formatDate } from "@/lib/utils";
import { complaintsUnlocked, TIER_LABEL, COMPLAINTS_MIN_TIER } from "@/lib/plan";
import { surfaceRelevance } from "@/lib/compliance/relevance";
import { readProfile } from "@/lib/compliance/read-profile";
import {
  STATUS_LABEL,
  STATUS_BADGE,
  ART_85_NOTE,
  SCOPE_NOTE,
  type ComplaintStatus,
} from "@/lib/klachten/labels";
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
import { ComplaintDialog } from "@/components/dashboard/klachten/complaint-dialog";
import { DeleteComplaintButton } from "@/components/dashboard/klachten/delete-complaint-button";

export const dynamic = "force-dynamic";

export default async function KlachtenPage() {
  const { company, user } = await getActiveCompany();
  const isAdmin = canAdminister(user);
  const unlocked = complaintsUnlocked(company.plan);

  const [complaints, systems] = await Promise.all([
    prisma.complaint.findMany({
      where: { companyId: company.id },
      orderBy: { receivedAt: "desc" },
      include: { aiSystem: { select: { name: true } } },
    }),
    prisma.aiSystem.findMany({
      where: { companyId: company.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, role: true, riskLevel: true },
    }),
  ]);

  // Scan-driven visibility (Phase B): does this module apply to the company?
  const profile = readProfile(company.profileJson);
  const rel = surfaceRelevance(profile, systems).klachten;
  const notRelevant = !rel.applies;

  const addTrigger = (
    <Button>
      <Plus className="h-4 w-4" /> Klacht registreren
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Klachten"
        description="Registreer en behandel klachten over de inzet van uw AI-systemen."
      >
        {unlocked && complaints.length > 0 && (
          <Button asChild variant="outline">
            <a href="/api/pdf/klachten" target="_blank" rel="noopener noreferrer">
              <FileDown className="h-4 w-4" /> Klachtenregister (PDF)
            </a>
          </Button>
        )}
        {isAdmin &&
          (unlocked ? (
            <ComplaintDialog systems={systems} trigger={addTrigger} />
          ) : (
            <Button asChild variant="outline">
              <Link href="/pricing">
                <Lock className="h-4 w-4" /> Beschikbaar vanaf {TIER_LABEL[COMPLAINTS_MIN_TIER]}
              </Link>
            </Button>
          ))}
      </PageHeader>

      {notRelevant && <NotRelevantBanner reason={rel.reason} />}

      {!notRelevant && !unlocked && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-navy-100 bg-navy-50 p-4 text-navy-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-semibold">
              Het klachtenregister is beschikbaar vanaf {TIER_LABEL[COMPLAINTS_MIN_TIER]}
            </p>
            <p className="text-muted-foreground">
              Hieronder ziet u wat u krijgt. Upgrade om klachten vast te leggen, de
              afhandeling te volgen en uw klachtenprocedure als bewijs te genereren.
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/pricing">Bekijk pakketten</Link>
          </Button>
        </div>
      )}

      {!isAdmin && (
        <div className="mb-6 rounded-lg border bg-secondary/30 p-4 text-sm text-muted-foreground">
          U heeft alleen-leestoegang. Alleen de beheerder kan klachten vastleggen of
          bewerken.
        </div>
      )}

      <RuleNote
        summary={
          <>
            Iedereen mag vanaf 2 augustus 2026 een klacht over AI indienen bij de toezichthouder —
            dat staat los van u. Een eigen klachtenregister is voor de meeste organisaties{" "}
            <strong className="font-medium text-foreground/80">
              goed bestuur, geen wettelijke plicht
            </strong>
            . Houd klachten hier bij zodat u ze netjes en aantoonbaar afhandelt.
          </>
        }
      >
        <p>{ART_85_NOTE}</p>
        <p>{SCOPE_NOTE}</p>
      </RuleNote>

      <Card>
        <CardContent className="p-0">
          {complaints.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <MessageSquareWarning className="h-6 w-6" />
              </div>
              <p className="text-muted-foreground">Nog geen klachten geregistreerd.</p>
              {isAdmin &&
                (unlocked ? (
                  <ComplaintDialog
                    systems={systems}
                    trigger={
                      <Button>
                        <Plus className="h-4 w-4" /> Eerste klacht registreren
                      </Button>
                    }
                  />
                ) : (
                  <Button asChild variant="outline">
                    <Link href="/pricing">
                      <Lock className="h-4 w-4" /> Beschikbaar vanaf {TIER_LABEL[COMPLAINTS_MIN_TIER]}
                    </Link>
                  </Button>
                ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Onderwerp</TableHead>
                  <TableHead>Betreft systeem</TableHead>
                  <TableHead>Klager</TableHead>
                  <TableHead>Ontvangen</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((c) => {
                  const status = c.status as ComplaintStatus;
                  return (
                    <TableRow key={c.id} className={cn(!unlocked && "opacity-60")}>
                      <TableCell className="max-w-xs">
                        <p className="font-medium">{c.subject}</p>
                        {c.resolvedAt && (
                          <p className="text-xs text-muted-foreground">
                            Afgehandeld {formatDate(c.resolvedAt)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.aiSystem?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.complainant?.trim() || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(c.receivedAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE[status] ?? "secondary"}>
                          {STATUS_LABEL[status] ?? c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {isAdmin && unlocked && (
                            <ComplaintDialog
                              complaint={c}
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
                          {isAdmin && <DeleteComplaintButton id={c.id} subject={c.subject} />}
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
