import { renderToBuffer } from "@react-pdf/renderer";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { conformityUnlocked, TIER_LABEL, CONFORMITY_MIN_TIER } from "@/lib/plan";
import { buildConformityEvidence } from "@/lib/conformiteit/templates";
import type { StepsMap } from "@/lib/conformiteit/labels";
import { DocumentPdf } from "@/components/pdf/document-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Company-level "Conformiteitsbeoordeling — statusoverzicht" evidence PDF, built
 * from the company's high-risk systems + their conformity assessments. Not
 * persisted — rendered on demand. Company-scoped and plan-gated like the module.
 */
export async function GET() {
  const { company } = await getActiveCompany();

  if (!conformityUnlocked(company.plan)) {
    return new Response(
      `De conformiteitsbeoordeling is beschikbaar vanaf het pakket ${TIER_LABEL[CONFORMITY_MIN_TIER]}.`,
      { status: 403 }
    );
  }

  const systems = await prisma.aiSystem.findMany({
    where: { companyId: company.id, riskLevel: "high" },
    orderBy: { createdAt: "asc" },
    select: {
      name: true,
      vendor: true,
      conformityAssessment: { select: { route: true, steps: true } },
    },
  });

  const rows = systems.map((s) => ({
    name: s.name,
    vendor: s.vendor,
    route: s.conformityAssessment?.route ?? "internal",
    steps: (s.conformityAssessment?.steps as unknown as StepsMap) ?? {},
  }));

  try {
    const content = buildConformityEvidence(company.name, rows);
    const date = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(new Date());

    const buffer = await renderToBuffer(
      DocumentPdf({
        content,
        companyName: company.name,
        version: 0,
        versionLabel: "Conformiteitsbeoordeling",
        date,
        preview: false,
      })
    );
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="complai-conformiteitsbeoordeling.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(`[pdf/conformiteit] render mislukt (company ${company.id}):`, e);
    return new Response("Kon het statusoverzicht niet genereren.", { status: 500 });
  }
}
