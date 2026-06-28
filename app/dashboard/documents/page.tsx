import { Download, FileCheck2, FileText, ScrollText, ShieldQuestion, type LucideIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { DOCUMENT_META, type DocumentType } from "@/lib/documents/templates";
import { PageHeader } from "@/components/dashboard/page-header";
import { GenerateButton } from "@/components/dashboard/documents/generate-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

const ICONS: Record<DocumentType, LucideIcon> = {
  ai_policy: ScrollText,
  risk_assessment: FileText,
  fria: ShieldQuestion,
  transparency: FileCheck2,
};

export default async function DocumentsPage() {
  const { company } = await getActiveCompany();

  const documents = await prisma.document.findMany({
    where: { companyId: company.id },
    orderBy: { version: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Documenten"
        description="Genereer de verplichte AI Act-documenten, automatisch gevuld met uw gegevens."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {DOCUMENT_META.map((meta) => {
          const versions = documents.filter((d) => d.type === meta.type);
          const latest = versions[0];
          const Icon = ICONS[meta.type];

          return (
            <Card key={meta.type} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-brand-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{meta.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {meta.description}
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
                  <GenerateButton
                    type={meta.type}
                    hasExisting={Boolean(latest)}
                  />
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
                        <li
                          key={doc.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>
                            <span className="font-medium">v{doc.version}</span>{" "}
                            <span className="text-muted-foreground">
                              · {formatDate(doc.createdAt)}
                            </span>
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
        })}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Documenten worden gegenereerd op basis van uw bedrijfsgegevens en het
        AI-register. Controleer de inhoud altijd voordat u deze deelt — het zijn
        sjablonen en geen juridisch advies.
      </p>
    </>
  );
}
