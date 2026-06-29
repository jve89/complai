import { renderToBuffer } from "@react-pdf/renderer";

import { prisma } from "@/lib/prisma";
import type { ComplianceProfile } from "@/lib/compliance/types";
import { ScanReportPdf } from "@/components/pdf/scan-report-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const result = await prisma.scanResult.findUnique({
    where: { id: params.id },
  });

  if (!result || !result.profile) {
    return new Response("Rapport niet gevonden", { status: 404 });
  }

  const profile = result.profile as unknown as ComplianceProfile;
  const date = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(
    result.createdAt
  );

  const buffer = await renderToBuffer(ScanReportPdf({ profile, date }));

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="complai-rapport.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
