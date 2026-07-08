import { BellRing, CheckCircle2, ExternalLink } from "lucide-react";

import { getActiveCompany } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { companySignals } from "@/lib/compliance/signals";
import { evaluateUpdates, daysSince, CATEGORY_LABEL } from "@/lib/regulatory/updates";
import type { ComplianceProfile } from "@/lib/compliance/types";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
  const { company } = await getActiveCompany();
  const systems = await prisma.aiSystem.findMany({
    where: { companyId: company.id },
    select: { riskLevel: true },
  });
  const profile = (company.profileJson as unknown as ComplianceProfile | null) ?? null;
  const sig = companySignals(profile, systems.map((s) => s.riskLevel));
  const now = new Date();
  const updates = evaluateUpdates(sig);

  return (
    <>
      <PageHeader
        title="Updates"
        description="Wijzigingen in de EU AI Act — en wat wij in het platform hebben bijgewerkt. De gemarkeerde items zijn extra relevant voor uw organisatie."
      />

      <div className="space-y-4">
        {updates.map((u) => {
          const isNew = daysSince(u.date, now) <= 30;
          return (
            <Card key={u.id} className={u.relevant ? "border-brand-100" : ""}>
              <CardContent className="py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="font-normal">
                    {CATEGORY_LABEL[u.category]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(new Date(u.date))}</span>
                  {isNew && <Badge variant="success">Nieuw</Badge>}
                  {u.relevant && <Badge variant="warning">Voor u relevant</Badge>}
                </div>

                <div className="mt-2 flex items-start gap-2">
                  <BellRing className="mt-1 h-4 w-4 shrink-0 text-brand-600" />
                  <div>
                    <p className="font-semibold">{u.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{u.summary}</p>
                  </div>
                </div>

                {u.reason && (
                  <p className="mt-2 pl-6 text-xs font-medium text-brand-700">{u.reason}</p>
                )}

                {u.detail && u.detail.length > 0 && (
                  <div className="mt-3 space-y-2 pl-6">
                    {u.detail.map((d, i) => (
                      <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                        {d}
                      </p>
                    ))}
                  </div>
                )}

                {u.productImpact && (
                  <p className="mt-3 flex items-start gap-1.5 pl-6 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Wij hebben bijgewerkt: {u.productImpact}</span>
                  </p>
                )}

                <a
                  href={u.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 pl-6 text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  Bron: {u.source.label} <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        ComplAI houdt deze tijdlijn actueel op basis van primaire bronnen (Europese Commissie, Raad,
        Parlement en het Publicatieblad). Dit is beslissingsondersteuning, geen juridisch advies.
      </p>
    </>
  );
}
