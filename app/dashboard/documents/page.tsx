import Link from "next/link";
import {
  BadgeCheck,
  ClipboardCheck,
  Cpu,
  Download,
  FileCheck2,
  FileCog,
  FileText,
  Lock,
  ScrollText,
  ShieldQuestion,
  type LucideIcon,
} from "lucide-react";
import type { Document as DocumentRow } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { cn, formatDate } from "@/lib/utils";
import { DOCUMENT_META, type DocumentType } from "@/lib/documents/templates";
import { docLabel } from "@/lib/compliance/labels";
import { docUnlocked, minTierFor, tierRank, TIER_LABEL, TIER_ORDER } from "@/lib/plan";
import type { ComplianceProfile } from "@/lib/compliance/types";
import { PageHeader } from "@/components/dashboard/page-header";
import { GenerateButton } from "@/components/dashboard/documents/generate-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const ICONS: Record<string, LucideIcon> = {
  ai_policy: ScrollText,
  risk_assessment: FileText,
  fria: ShieldQuestion,
  transparency: FileCheck2,
  tech_doc: FileCog,
  doc_conformity: BadgeCheck,
  assessment_record: ClipboardCheck,
  gpai_docs: Cpu,
};

// Slugs the generator can actually build today.
const GENERATABLE = new Set<string>(DOCUMENT_META.map((m) => m.type));

interface DocItem {
  slug: string;
  reason: string;
}

function DocCard({
  item,
  versions,
  plan,
}: {
  item: DocItem;
  versions: DocumentRow[];
  plan: string | null;
}) {
  const latest = versions[0];
  const Icon = ICONS[item.slug] ?? FileText;
  const canGenerate = GENERATABLE.has(item.slug);
  const unlocked = docUnlocked(plan, item.slug);
  const requiredTier = minTierFor(item.slug);

  return (
    <Card className={cn("flex flex-col", !unlocked && "border-dashed")}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                unlocked ? "bg-navy-900 text-brand-400" : "bg-secondary text-muted-foreground"
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-base">{docLabel(item.slug)}</CardTitle>
              <CardDescription className="mt-1">
                <span className="font-medium text-foreground/70">Waarom: </span>
                {item.reason}
              </CardDescription>
            </div>
          </div>
          {!unlocked ? (
            <Badge variant="secondary" className="shrink-0 gap-1 font-normal">
              <Lock className="h-3 w-3" /> {TIER_LABEL[requiredTier]}
            </Badge>
          ) : latest ? (
            <Badge variant="success">v{latest.version}</Badge>
          ) : (
            <Badge variant="secondary">Niet gegenereerd</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="mt-auto space-y-4">
        <div className="flex items-center gap-2">
          {!unlocked ? (
            <Button asChild size="sm" variant="outline">
              <Link href="/pricing">
                <Lock className="h-4 w-4" /> Beschikbaar vanaf {TIER_LABEL[requiredTier]}
              </Link>
            </Button>
          ) : canGenerate ? (
            <GenerateButton type={item.slug as DocumentType} hasExisting={Boolean(latest)} />
          ) : (
            <Badge variant="secondary" className="font-normal">
              Zelf opstellen · sjabloon volgt
            </Badge>
          )}
          {unlocked && latest && (
            <Button asChild variant="ghost" size="sm">
              <a
                href={`/api/pdf/document/${latest.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4" /> Download laatste
              </a>
            </Button>
          )}
        </div>

        {versions.length > 0 && (
          <div className="rounded-lg border bg-secondary/30 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Versiegeschiedenis
            </p>
            <ul className="space-y-1.5">
              {versions.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between text-sm">
                  <span>
                    <span className="font-medium">v{doc.version}</span>{" "}
                    <span className="text-muted-foreground">· {formatDate(doc.createdAt)}</span>
                  </span>
                  <a
                    href={`/api/pdf/document/${doc.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function DocumentsPage() {
  const { company } = await getActiveCompany();

  const documents = await prisma.document.findMany({
    where: { companyId: company.id },
    orderBy: { version: "desc" },
  });
  const versionsFor = (slug: string) => documents.filter((d) => d.type === slug);

  const profile = (company.profileJson as unknown as ComplianceProfile | null) ?? null;
  const plan = company.plan;
  const isTopPlan = tierRank(plan) >= tierRank("schaal");

  // Two lenses combine here:
  //  • Scan-driven — what THIS company must (verplicht) / should (aanbevolen)
  //    have, from its ComplianceProfile.
  //  • Plan-driven — everything else the pakket includes ("u krijgt waar u voor
  //    betaalt"): the rest of the full handboek, split into what you can build
  //    now vs. what a higher pakket would add. So the top tier shows all 8.
  const catalogReason = new Map<string, string>(
    DOCUMENT_META.map((m) => [m.type, m.description])
  );
  const catalogItem = (slug: string): DocItem => ({ slug, reason: catalogReason.get(slug) ?? "" });

  const required: DocItem[] = profile?.documents
    ? profile.documents.required.map((d) => ({ slug: d.slug, reason: d.reason }))
    : [];
  const recommended: DocItem[] = profile?.documents
    ? profile.documents.recommended.map((d) => ({ slug: d.slug, reason: d.reason }))
    : [];

  const flagged = new Set([...required, ...recommended].map((d) => d.slug));
  const rest = DOCUMENT_META.map((m) => m.type).filter((slug) => !flagged.has(slug));
  const available: DocItem[] = rest.filter((slug) => docUnlocked(plan, slug)).map(catalogItem);
  const lockedExtra: DocItem[] = rest
    .filter((slug) => !docUnlocked(plan, slug))
    .sort((a, b) => tierRank(minTierFor(a)) - tierRank(minTierFor(b)))
    .map(catalogItem);

  return (
    <>
      <PageHeader
        title="Documenten"
        description="De documenten die op basis van uw scan voor u gelden — automatisch gevuld met uw gegevens."
      />

      {!profile && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Doe eerst de risicoscan om te zien welke documenten voor uw organisatie
          verplicht of aanbevolen zijn. Hieronder ziet u de beschikbare sjablonen.
        </div>
      )}

      <div
        className={cn(
          "mb-8 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between",
          isTopPlan
            ? "border-brand-100 bg-brand-50 text-navy-900"
            : "border-navy-100 bg-navy-50 text-navy-900"
        )}
      >
        <div className="text-sm">
          <p className="font-semibold">Uw pakket: {TIER_LABEL[TIER_ORDER[tierRank(plan)]]}</p>
          <p className="text-muted-foreground">
            {isTopPlan
              ? "U heeft toegang tot alle documenten — samen vormen ze uw volledige AI-compliancehandboek."
              : "Uw pakket bepaalt welke documenten u kunt genereren. Upgrade voor het volledige documentenpakket."}
          </p>
        </div>
        {!isTopPlan && (
          <Button asChild size="sm">
            <Link href="/pricing">Bekijk pakketten</Link>
          </Button>
        )}
      </div>

      {required.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-1 text-lg font-semibold">Verplicht ({required.length})</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Deze documenten horen bij uw wettelijke verplichtingen.
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            {required.map((item) => (
              <DocCard key={item.slug} item={item} versions={versionsFor(item.slug)} plan={plan} />
            ))}
          </div>
        </section>
      )}

      {recommended.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-1 text-lg font-semibold">Aanbevolen ({recommended.length})</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Niet verplicht, wel verstandig om klaar te hebben liggen.
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            {recommended.map((item) => (
              <DocCard key={item.slug} item={item} versions={versionsFor(item.slug)} plan={plan} />
            ))}
          </div>
        </section>
      )}

      {available.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-1 text-lg font-semibold">Ook beschikbaar in uw pakket ({available.length})</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Uw scan markeerde deze niet als nodig, maar ze zitten in uw pakket —
            samen vormen ze het volledige compliancehandboek. U kunt ze alvast opstellen.
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            {available.map((item) => (
              <DocCard key={item.slug} item={item} versions={versionsFor(item.slug)} plan={plan} />
            ))}
          </div>
        </section>
      )}

      {lockedExtra.length > 0 && (
        <section>
          <h2 className="mb-1 text-lg font-semibold">Beschikbaar in een hoger pakket ({lockedExtra.length})</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Onderdeel van het volledige compliancehandboek. Upgrade om deze te ontgrendelen.
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            {lockedExtra.map((item) => (
              <DocCard key={item.slug} item={item} versions={versionsFor(item.slug)} plan={plan} />
            ))}
          </div>
        </section>
      )}

      <p className="mt-8 text-sm text-muted-foreground">
        Gegenereerde documenten zijn <strong>bewerkbare concept-sjablonen</strong>{" "}
        die u zelf invult en vaststelt. Het is beslissingsondersteuning op basis van
        uw eigen opgaven — geen juridisch advies en geen garantie op naleving.
        Controleer en laat toetsen voordat u ze gebruikt of deelt.
      </p>
    </>
  );
}
