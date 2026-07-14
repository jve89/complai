import Link from "next/link";
import { Lock, Pencil, Plus, Megaphone, FileDown } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getActiveCompany, canAdminister } from "@/lib/auth";
import { cn, formatDate } from "@/lib/utils";
import { noticesUnlocked, TIER_LABEL, NOTICES_MIN_TIER } from "@/lib/plan";
import { surfaceRelevance } from "@/lib/compliance/relevance";
import type { ComplianceProfile } from "@/lib/compliance/types";
import {
  NOTICE_TYPE_SHORT,
  NOTICE_TYPE_ARTICLE,
  STATUS_LABEL,
  STATUS_BADGE,
  APPLIES_FROM_NOTE,
  EXPLANATION_SCOPE_NOTE,
  type NoticeType,
  type NoticeStatus,
} from "@/lib/kennisgevingen/labels";
import { PageHeader } from "@/components/dashboard/page-header";
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
import { NotRelevantBanner } from "@/components/dashboard/relevance";
import { RuleNote } from "@/components/dashboard/rule-note";
import { NoticeDialog } from "@/components/dashboard/kennisgevingen/notice-dialog";
import { DeleteNoticeButton } from "@/components/dashboard/kennisgevingen/delete-notice-button";

export const dynamic = "force-dynamic";

export default async function KennisgevingenPage() {
  const { company, user } = await getActiveCompany();
  const isAdmin = canAdminister(user);
  const unlocked = noticesUnlocked(company.plan);

  const [notices, systems] = await Promise.all([
    prisma.notice.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
      include: { aiSystem: { select: { name: true } } },
    }),
    prisma.aiSystem.findMany({
      where: { companyId: company.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, riskLevel: true, role: true },
    }),
  ]);

  const systemOptions = systems.map((s) => ({ id: s.id, name: s.name }));
  const highRiskCount = systems.filter((s) => s.riskLevel === "high").length;

  // Scan-driven visibility (Phase B): does this module apply to the company?
  const profile = (company.profileJson as unknown as ComplianceProfile | null) ?? null;
  const rel = surfaceRelevance(profile, systems).kennisgevingen;
  const notRelevant = !rel.applies;

  const addTrigger = (
    <Button>
      <Plus className="h-4 w-4" /> Kennisgeving vastleggen
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Kennisgevingen"
        description="Informeer werknemers en betrokkenen over hoog-risico AI, en geef uitleg bij AI-besluiten."
      >
        {isAdmin &&
          (unlocked ? (
            <NoticeDialog systems={systemOptions} trigger={addTrigger} />
          ) : (
            <Button asChild variant="outline">
              <Link href="/pricing">
                <Lock className="h-4 w-4" /> Beschikbaar vanaf {TIER_LABEL[NOTICES_MIN_TIER]}
              </Link>
            </Button>
          ))}
      </PageHeader>

      {notRelevant && <NotRelevantBanner reason={rel.reason} />}

      {!notRelevant && !unlocked && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-navy-100 bg-navy-50 p-4 text-navy-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-semibold">
              Kennisgevingen zijn beschikbaar vanaf {TIER_LABEL[NOTICES_MIN_TIER]}
            </p>
            <p className="text-muted-foreground">
              Hieronder ziet u wat u krijgt. Upgrade om kennisgevingen vast te leggen en de
              bijbehorende brief of uitleg te genereren.
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/pricing">Bekijk pakketten</Link>
          </Button>
        </div>
      )}

      {!isAdmin && (
        <div className="mb-6 rounded-lg border bg-secondary/30 p-4 text-sm text-muted-foreground">
          U heeft alleen-leestoegang. Alleen de beheerder kan kennisgevingen vastleggen of
          bewerken.
        </div>
      )}

      <RuleNote
        summary={
          <>
            Zet u <strong className="font-medium text-foreground/80">hoog-risico AI</strong> (Annex
            III) in die mensen raakt? Informeer dan vooraf uw personeelsvertegenwoordiging en de
            betrokken werknemers, en informeer de mensen over wie de AI meebeslist. Neemt de AI een
            besluit met{" "}
            <strong className="font-medium text-foreground/80">
              rechtsgevolgen of een ander ingrijpend gevolg
            </strong>{" "}
            voor iemand? Dan legt u dat op verzoek uit. Deze plichten gaan naar verwachting in vanaf 2
            december 2027 — leg nu alvast vast wie u informeert.
            {unlocked && highRiskCount === 0 && (
              <span className="mt-2 block">
                U heeft nog geen systemen als{" "}
                <strong className="font-medium text-foreground/80">hoog risico</strong> geclassificeerd
                in uw{" "}
                <Link href="/dashboard/register" className="font-medium text-primary hover:underline">
                  AI-register
                </Link>
                . Deze plichten gelden zodra u een hoog-risico Annex III-systeem inzet.
              </span>
            )}
          </>
        }
      >
        <p>{APPLIES_FROM_NOTE}</p>
        <p>{EXPLANATION_SCOPE_NOTE}</p>
      </RuleNote>

      <Card>
        <CardContent className="p-0">
          {notices.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <Megaphone className="h-6 w-6" />
              </div>
              <p className="text-muted-foreground">Nog geen kennisgevingen vastgelegd.</p>
              {isAdmin &&
                (unlocked ? (
                  <NoticeDialog
                    systems={systemOptions}
                    trigger={
                      <Button>
                        <Plus className="h-4 w-4" /> Eerste kennisgeving vastleggen
                      </Button>
                    }
                  />
                ) : (
                  <Button asChild variant="outline">
                    <Link href="/pricing">
                      <Lock className="h-4 w-4" /> Beschikbaar vanaf {TIER_LABEL[NOTICES_MIN_TIER]}
                    </Link>
                  </Button>
                ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Soort</TableHead>
                  <TableHead>Ontvanger</TableHead>
                  <TableHead>Betreft systeem</TableHead>
                  <TableHead>Verstrekt op</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notices.map((n) => {
                  const status = n.status as NoticeStatus;
                  const type = n.type as NoticeType;
                  return (
                    <TableRow key={n.id} className={cn(!unlocked && "opacity-60")}>
                      <TableCell>
                        <p className="font-medium">{NOTICE_TYPE_SHORT[type] ?? n.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {NOTICE_TYPE_ARTICLE[type] ?? ""}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-xs text-sm">{n.recipient}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {n.aiSystem?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {n.issuedAt ? formatDate(n.issuedAt) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE[status] ?? "secondary"}>
                          {STATUS_LABEL[status] ?? n.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            aria-label="Kennisgeving (PDF)"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <a href={`/api/pdf/notice/${n.id}`} target="_blank" rel="noopener noreferrer">
                              <FileDown className="h-4 w-4" />
                            </a>
                          </Button>
                          {isAdmin && unlocked && (
                            <NoticeDialog
                              notice={n}
                              systems={systemOptions}
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
                          {isAdmin && (
                            <DeleteNoticeButton
                              id={n.id}
                              label={`${NOTICE_TYPE_SHORT[type] ?? n.type} — ${n.recipient}`}
                            />
                          )}
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
