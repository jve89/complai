import Link from "next/link";
import { Lock, Pencil, Plus, Bell, FileDown } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getActiveCompany, canAdminister } from "@/lib/auth";
import { cn, formatDate } from "@/lib/utils";
import { incidentsUnlocked, TIER_LABEL, INCIDENTS_MIN_TIER } from "@/lib/plan";
import {
  CATEGORY_LABEL,
  STATUS_LABEL,
  STATUS_BADGE,
  reportDeadline,
  daysUntil,
  type IncidentCategory,
  type IncidentStatus,
} from "@/lib/meldingen/labels";
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
import { IncidentDialog } from "@/components/dashboard/meldingen/incident-dialog";
import { DeleteIncidentButton } from "@/components/dashboard/meldingen/delete-incident-button";

export const dynamic = "force-dynamic";

/** Deadline cell for an OPEN incident: the Art 73 cap + a days-left badge. */
function DeadlineCell({
  awareAt,
  facts,
}: {
  awareAt: Date;
  facts: { category: string; involvesDeath: boolean; widespread: boolean };
}) {
  const deadline = reportDeadline(awareAt, facts);
  const left = daysUntil(deadline);
  const variant = left < 0 ? "danger" : left <= 2 ? "danger" : left <= 5 ? "warning" : "secondary";
  const label =
    left < 0 ? `${Math.abs(left)} dag(en) te laat` : left === 0 ? "vandaag" : `nog ${left} dag(en)`;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm">{formatDate(deadline)}</span>
      <Badge variant={variant} className="w-fit">
        {label}
      </Badge>
    </div>
  );
}

export default async function MeldingenPage() {
  const { company, user } = await getActiveCompany();
  const isAdmin = canAdminister(user);
  const unlocked = incidentsUnlocked(company.plan);

  const incidents = await prisma.incident.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
  });

  const addTrigger = (
    <Button>
      <Plus className="h-4 w-4" /> Incident melden
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Meldingen"
        description="Registreer ernstige incidenten en meld ze op tijd aan de toezichthouder (Art. 73)."
      >
        {isAdmin &&
          (unlocked ? (
            <IncidentDialog trigger={addTrigger} />
          ) : (
            <Button asChild variant="outline">
              <Link href="/pricing">
                <Lock className="h-4 w-4" /> Beschikbaar vanaf {TIER_LABEL[INCIDENTS_MIN_TIER]}
              </Link>
            </Button>
          ))}
      </PageHeader>

      {!unlocked && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-navy-100 bg-navy-50 p-4 text-navy-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-semibold">
              Incidentmeldingen zijn beschikbaar vanaf {TIER_LABEL[INCIDENTS_MIN_TIER]}
            </p>
            <p className="text-muted-foreground">
              Hieronder ziet u wat u krijgt. Upgrade om meldingen vast te leggen, de
              meldtermijn te bewaken en een meldrapport te genereren.
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/pricing">Bekijk pakketten</Link>
          </Button>
        </div>
      )}

      {!isAdmin && (
        <div className="mb-6 rounded-lg border bg-secondary/30 p-4 text-sm text-muted-foreground">
          U heeft alleen-leestoegang. Alleen de beheerder kan meldingen vastleggen of
          bewerken.
        </div>
      )}

      <div className="mb-4 rounded-lg border bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
        Een ernstig incident (Art. 3(49)) meldt u <strong>onmiddellijk</strong> aan de
        markttoezichthouder — en uiterlijk binnen <strong>2, 10 of 15 dagen</strong>,
        afhankelijk van de aard (Art. 73). Als gebruiksverantwoordelijke informeert u
        eerst de aanbieder (Art. 26(5)).
      </div>

      <Card>
        <CardContent className="p-0">
          {incidents.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <Bell className="h-6 w-6" />
              </div>
              <p className="text-muted-foreground">Nog geen incidenten geregistreerd.</p>
              {isAdmin &&
                (unlocked ? (
                  <IncidentDialog
                    trigger={
                      <Button>
                        <Plus className="h-4 w-4" /> Eerste incident melden
                      </Button>
                    }
                  />
                ) : (
                  <Button asChild variant="outline">
                    <Link href="/pricing">
                      <Lock className="h-4 w-4" /> Beschikbaar vanaf {TIER_LABEL[INCIDENTS_MIN_TIER]}
                    </Link>
                  </Button>
                ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incident</TableHead>
                  <TableHead>Categorie</TableHead>
                  <TableHead>Meldtermijn</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((i) => {
                  const status = i.status as IncidentStatus;
                  return (
                    <TableRow key={i.id} className={cn(!unlocked && "opacity-60")}>
                      <TableCell>
                        <p className="font-medium">{i.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Bekend geworden {formatDate(i.awareAt)}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-xs text-sm text-muted-foreground">
                        {CATEGORY_LABEL[i.category as IncidentCategory] ?? i.category}
                      </TableCell>
                      <TableCell>
                        {status === "open" ? (
                          <DeadlineCell
                            awareAt={i.awareAt}
                            facts={{
                              category: i.category,
                              involvesDeath: i.involvesDeath,
                              widespread: i.widespread,
                            }}
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {i.reportedAt ? `Gemeld ${formatDate(i.reportedAt)}` : "—"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE[status] ?? "secondary"}>
                          {STATUS_LABEL[status] ?? i.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            aria-label="Meldrapport (PDF)"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <a href={`/api/pdf/incident/${i.id}`} target="_blank" rel="noopener noreferrer">
                              <FileDown className="h-4 w-4" />
                            </a>
                          </Button>
                          {isAdmin && unlocked && (
                            <IncidentDialog
                              incident={i}
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
                          {isAdmin && <DeleteIncidentButton id={i.id} title={i.title} />}
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
