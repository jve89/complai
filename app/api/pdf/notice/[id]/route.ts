import { renderToBuffer } from "@react-pdf/renderer";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { buildNoticeContent } from "@/lib/kennisgevingen/templates";
import { DocumentPdf } from "@/components/pdf/document-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  // Notices are always company-scoped: fetch scoped to the active company, so a
  // user can only ever download their own (or the demo) company's notice.
  const { company } = await getActiveCompany();
  const notice = await prisma.notice.findFirst({
    where: { id: params.id, companyId: company.id },
    include: { aiSystem: { select: { name: true, vendor: true } } },
  });
  if (!notice) return new Response("Kennisgeving niet gevonden", { status: 404 });

  try {
    const content = buildNoticeContent(notice, company.name, notice.aiSystem);
    const date = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(new Date());

    const buffer = await renderToBuffer(
      DocumentPdf({
        content,
        companyName: company.name,
        version: 0,
        versionLabel: "Kennisgeving",
        date,
        preview: false,
      })
    );
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="complai-kennisgeving.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(`[pdf/notice] render mislukt (notice ${notice.id}):`, e);
    return new Response("Kon deze kennisgeving niet genereren.", { status: 500 });
  }
}
