import { renderToBuffer } from "@react-pdf/renderer";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import {
  buildDocument,
  getDocumentMeta,
  DOCUMENT_META,
  type DocumentType,
} from "@/lib/documents/templates";
import { docUnlocked, TIER_LABEL, minTierFor } from "@/lib/plan";
import { DocumentPdf } from "@/components/pdf/document-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TYPES = new Set<DocumentType>(DOCUMENT_META.map((m) => m.type));

/**
 * Renders a document from the company's CURRENT data and streams it as a PDF
 * WITHOUT persisting a new version. This is the "regenerate a local copy" path:
 * available to every company member (managers/medewerkers included), it never
 * touches the shared, versioned company record — only the admin's "Genereer"
 * action does that.
 */
export async function GET(
  _req: Request,
  { params }: { params: { type: string } }
) {
  const type = params.type as DocumentType;
  if (!VALID_TYPES.has(type)) {
    return new Response("Onbekend documenttype", { status: 404 });
  }

  // Scopes to the active company (redirects anonymous users to login).
  const { company } = await getActiveCompany();

  // Same plan gate as the persisted generator.
  if (!docUnlocked(company.plan, type)) {
    return new Response(
      `Dit document is beschikbaar vanaf het pakket ${TIER_LABEL[minTierFor(type)]}.`,
      { status: 403 }
    );
  }

  const systems = await prisma.aiSystem.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "asc" },
  });

  const content = buildDocument(type, company, systems);
  const date = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(
    new Date()
  );
  const meta = getDocumentMeta(type);

  const buffer = await renderToBuffer(
    DocumentPdf({
      content,
      companyName: company.name,
      version: 0,
      versionLabel: "Actuele versie",
      date,
      preview: false,
    })
  );

  const filename = `${meta.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-actueel.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
