import Link from "next/link";
import { ArrowRight, Database, Eye, Lightbulb, ScanSearch } from "lucide-react";

import { getActiveCompany } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TOOL_GROUPS } from "@/lib/compliance/questions";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const HOW_TO = [
  "Vraag elk team welke AI-tools, plug-ins en browserextensies zij gebruiken.",
  "Loop de SaaS-abonnementen en facturen langs op AI-functies (vaak 'AI', 'Copilot' of 'Assistant').",
  "Controleer of standaardsoftware (Microsoft 365, Google Workspace, CRM) AI-functies aan heeft staan.",
  "Leg elk gevonden systeem vast in het AI-register met rol, doel en risicoklasse.",
];

export default async function SchaduwAiPage() {
  const { company } = await getActiveCompany();
  const registered = await prisma.aiSystem.count({ where: { companyId: company.id } });

  return (
    <>
      <PageHeader
        title="Schaduw-AI"
        description="AI die in uw organisatie wordt gebruikt zonder dat het is vastgelegd — de grootste blinde vlek bij een audit."
      >
        <Button asChild variant="outline">
          <Link href="/dashboard/register">
            Naar AI-register <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-5 w-5 text-brand-600" /> Waarom dit telt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              De AI Act gaat ervan uit dat u wéét welke AI u inzet. Een onvolledig
              register is daarom het eerste wat bij een controle opvalt: een
              gebruiksverantwoordelijke moet AI volgens de instructies inzetten,
              menselijk toezicht borgen en logs bewaren (Art. 26) — dat kan niet
              voor systemen die u niet kent.
            </p>
            <p>
              Ook AI-geletterdheid (Art. 4) en uw transparantieplichten (Art. 50)
              gelden alleen aantoonbaar als u het volledige plaatje heeft.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-5 w-5 text-brand-600" /> In uw register
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2 py-4">
            <p className="text-4xl font-bold tabular-nums">{registered}</p>
            <p className="text-center text-sm text-muted-foreground">
              vastgelegde AI-systemen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Discovery checklist */}
      <h2 className="mb-2 mt-10 flex items-center gap-2 text-lg font-semibold">
        <ScanSearch className="h-5 w-5 text-brand-600" /> Veelgebruikte AI-tools — welke herkent u?
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Loop deze lijst langs met uw teams. Staat iets in gebruik dat niet in het
        register staat? Voeg het toe.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {TOOL_GROUPS.filter((g) => g.label !== "Anders").map((group) => (
          <Card key={group.label}>
            <CardContent className="py-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {group.options.map((opt) => (
                  <span
                    key={opt.value}
                    className="rounded-md border bg-secondary/60 px-2 py-1 text-xs"
                  >
                    {opt.label}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How to */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-brand-600" /> Zo spoort u schaduw-AI op
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {HOW_TO.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <Button asChild className="mt-6">
            <Link href="/dashboard/register">
              Gevonden systeem vastleggen <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
