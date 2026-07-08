import { renderToBuffer } from "@react-pdf/renderer";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
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

  // A claimed scan is company data — only its members (or a super-admin) may
  // download it; anonymous/unclaimed scans stay shareable by link.
  if (result.companyId) {
    const user = await getCurrentUser().catch(() => null);
    if (result.companyId !== user?.company?.id && !user?.superAdmin) {
      return new Response("Rapport niet gevonden", { status: 404 });
    }
  }

  const profile = result.profile as unknown as ComplianceProfile;
  const date = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(
    result.createdAt
  );

  try {
    const buffer = await renderToBuffer(ScanReportPdf({ profile, date }));
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="complai-rapport.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(`[pdf/scan] render mislukt (scan ${result.id}):`, e);
    return new Response("Kon dit rapport niet genereren.", { status: 500 });
  }
}
