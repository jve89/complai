import {
  BadgeCheck,
  ClipboardCheck,
  Cpu,
  Download,
  FileCheck2,
  FileCog,
  FileText,
  ScrollText,
  ShieldQuestion,
  type LucideIcon,
} from "lucide-react";
import type { Document as DocumentRow } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { DOCUMENT_META, type DocumentType } from "@/lib/documents/templates";
import { docLabel } from "@/lib/compliance/labels";
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

function DocCard({ item, versions }: { item: DocItem; versions: DocumentRow[] }) {
  const latest = versions[0];
  const Icon = ICONS[item.slug] ?? FileText;
  const canGenerate = GENERATABLE.has(item.slug);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-brand-400">
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
          {latest ? (
            <Badge variant="success">v{latest.version}</Badge>
          ) : (
            <Badge variant="secondary">Niet gegenereerd</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="mt-auto space-y-4">
        <div className="flex items-center gap-2">
          {canGenerate ? (
            <GenerateButton type={item.slug as DocumentType} hasExisting={Boolean(latest)} />
          ) : (
            <Badge variant="secondary" className="font-normal">
              Zelf opstellen · sjabloon volgt
            </Badge>
          )}
          {latest && (
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

  // Profile-driven: show exactly the documents this company's scan calls for,
  // split into verplicht vs aanbevolen. No scan yet → fall back to the
  // generatable templates so the page is never empty.
  let required: DocItem[];
  let recommended: DocItem[];
  if (profile?.documents) {
    required = profile.documents.required.map((d) => ({ slug: d.slug, reason: d.reason }));
    recommended = profile.documents.recommended.map((d) => ({ slug: d.slug, reason: d.reason }));
  } else {
    required = [];
    recommended = DOCUMENT_META.map((m) => ({ slug: m.type, reason: m.description }));
  }

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

      {required.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-1 text-lg font-semibold">Verplicht ({required.length})</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Deze documenten horen bij uw wettelijke verplichtingen.
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            {required.map((item) => (
              <DocCard key={item.slug} item={item} versions={versionsFor(item.slug)} />
            ))}
          </div>
        </section>
      )}

      {recommended.length > 0 && (
        <section>
          <h2 className="mb-1 text-lg font-semibold">Aanbevolen ({recommended.length})</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Niet verplicht, wel verstandig om klaar te hebben liggen.
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            {recommended.map((item) => (
              <DocCard key={item.slug} item={item} versions={versionsFor(item.slug)} />
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
