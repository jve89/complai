import { renderToBuffer } from "@react-pdf/renderer";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { logRetentionUnlocked, TIER_LABEL, LOG_RETENTION_MIN_TIER } from "@/lib/plan";
import { buildLogRetentionEvidence } from "@/lib/logbewaring/templates";
import { DocumentPdf } from "@/components/pdf/document-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Company-level "Logbewaringsbeleid (Art. 26 lid 6)" evidence PDF, built from the
 * company's high-risk systems + their recorded retention policy. Not persisted —
 * rendered on demand. Company-scoped and plan-gated exactly like the module.
 */
export async function GET() {
  const { company } = await getActiveCompany();

  if (!logRetentionUnlocked(company.plan)) {
    return new Response(
      `De logbewaring is beschikbaar vanaf het pakket ${TIER_LABEL[LOG_RETENTION_MIN_TIER]}.`,
      { status: 403 }
    );
  }

  const systems = await prisma.aiSystem.findMany({
    where: { companyId: company.id, riskLevel: "high" },
    orderBy: { createdAt: "asc" },
    select: {
      name: true,
      vendor: true,
      logLocation: true,
      logRetentionMonths: true,
      logRetentionOwner: true,
      logReviewedAt: true,
    },
  });

  try {
    const content = buildLogRetentionEvidence(company.name, systems);
    const date = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(new Date());

    const buffer = await renderToBuffer(
      DocumentPdf({
        content,
        companyName: company.name,
        version: 0,
        versionLabel: "Logbewaringsbeleid",
        date,
        preview: false,
      })
    );
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="complai-logbewaringsbeleid.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(`[pdf/log-retention] render mislukt (company ${company.id}):`, e);
    return new Response("Kon het logbewaringsbeleid niet genereren.", { status: 500 });
  }
}
