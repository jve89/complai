import { renderToBuffer } from "@react-pdf/renderer";

import { prisma } from "@/lib/prisma";
import { scoreScan } from "@/lib/scan/scoring";
import type { ScanAnswers } from "@/lib/scan/questions";
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

  if (!result) {
    return new Response("Rapport niet gevonden", { status: 404 });
  }

  const report = scoreScan(result.answers as ScanAnswers);
  const date = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(
    result.createdAt
  );

  const buffer = await renderToBuffer(ScanReportPdf({ report, date }));

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="complai-risicoscan.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
