import { renderToBuffer } from "@react-pdf/renderer";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { getDocumentMeta, type DocumentContent, type DocumentType } from "@/lib/documents/templates";
import { DocumentPdf } from "@/components/pdf/document-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { company } = await getActiveCompany();

  const doc = await prisma.document.findFirst({
    where: { id: params.id, companyId: company.id },
  });
  if (!doc) {
    return new Response("Document niet gevonden", { status: 404 });
  }

  const content = doc.content as unknown as DocumentContent;
  const date = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(
    doc.createdAt
  );
  const meta = getDocumentMeta(doc.type as DocumentType);

  const buffer = await renderToBuffer(
    DocumentPdf({
      content,
      companyName: company.name,
      version: doc.version,
      date,
    })
  );

  const filename = `${meta.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-v${doc.version}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
