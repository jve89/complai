import { renderToBuffer } from "@react-pdf/renderer";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { correctiveUnlocked, TIER_LABEL, CORRECTIVE_MIN_TIER } from "@/lib/plan";
import { buildCorrectiveRegister } from "@/lib/corrigerend/templates";
import { DocumentPdf } from "@/components/pdf/document-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Company-level "Register corrigerende maatregelen" evidence PDF (Art 20). Not
 * persisted — rendered on demand. Company-scoped and plan-gated like the module.
 */
export async function GET() {
  const { company } = await getActiveCompany();

  if (!correctiveUnlocked(company.plan)) {
    return new Response(
      `Corrigerende maatregelen zijn beschikbaar vanaf het pakket ${TIER_LABEL[CORRECTIVE_MIN_TIER]}.`,
      { status: 403 }
    );
  }

  const actions = await prisma.correctiveAction.findMany({
    where: { companyId: company.id },
    orderBy: { identifiedAt: "desc" },
    select: {
      title: true,
      actionType: true,
      presentsRisk: true,
      identifiedAt: true,
      resolvedAt: true,
      status: true,
      aiSystem: { select: { name: true } },
    },
  });

  try {
    const content = buildCorrectiveRegister(company.name, actions);
    const date = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(new Date());

    const buffer = await renderToBuffer(
      DocumentPdf({
        content,
        companyName: company.name,
        version: 0,
        versionLabel: "Register corrigerende maatregelen",
        date,
        preview: false,
      })
    );
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="complai-corrigerende-maatregelen.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(`[pdf/corrigerend] render mislukt (company ${company.id}):`, e);
    return new Response("Kon het register niet genereren.", { status: 500 });
  }
}
