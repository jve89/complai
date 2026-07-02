import { renderToBuffer } from "@react-pdf/renderer";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { DEMO_COMPANY_NAME } from "@/lib/demo";
import { getDocumentMeta, type DocumentContent, type DocumentType } from "@/lib/documents/templates";
import { DocumentPdf } from "@/components/pdf/document-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // Look the document up first; demo documents are public (rendered as a
  // watermarked preview), real documents are scoped to the active company.
  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    include: { company: { select: { id: true, name: true } } },
  });
  if (!doc) {
    return new Response("Document niet gevonden", { status: 404 });
  }

  const preview = doc.company.name === DEMO_COMPANY_NAME;
  if (!preview) {
    // Real document → enforce ownership (this path may redirect anonymous users
    // to login via getActiveCompany).
    const { company } = await getActiveCompany();
    if (doc.companyId !== company.id) {
      return new Response("Document niet gevonden", { status: 404 });
    }
  }

  const content = doc.content as unknown as DocumentContent;
  const date = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(
    doc.createdAt
  );
  const meta = getDocumentMeta(doc.type as DocumentType);

  const buffer = await renderToBuffer(
    DocumentPdf({
      content,
      companyName: doc.company.name,
      version: doc.version,
      date,
      preview,
    })
  );

  const suffix = preview ? "voorbeeld" : `v${doc.version}`;
  const filename = `${meta.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${suffix}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
