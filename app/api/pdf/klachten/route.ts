import { renderToBuffer } from "@react-pdf/renderer";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { complaintsUnlocked, TIER_LABEL, COMPLAINTS_MIN_TIER } from "@/lib/plan";
import { buildComplaintsRegister } from "@/lib/klachten/templates";
import { DocumentPdf } from "@/components/pdf/document-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Company-level "Klachtenprocedure & -register" evidence PDF, built from the
 * company's logged complaints. Not persisted — rendered on demand. Company-scoped
 * and plan-gated exactly like the module.
 */
export async function GET() {
  const { company } = await getActiveCompany();

  if (!complaintsUnlocked(company.plan)) {
    return new Response(
      `Het klachtenregister is beschikbaar vanaf het pakket ${TIER_LABEL[COMPLAINTS_MIN_TIER]}.`,
      { status: 403 }
    );
  }

  const complaints = await prisma.complaint.findMany({
    where: { companyId: company.id },
    orderBy: { receivedAt: "desc" },
    select: {
      subject: true,
      status: true,
      receivedAt: true,
      resolvedAt: true,
      aiSystem: { select: { name: true } },
    },
  });

  try {
    const content = buildComplaintsRegister(company.name, complaints);
    const date = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(new Date());

    const buffer = await renderToBuffer(
      DocumentPdf({
        content,
        companyName: company.name,
        version: 0,
        versionLabel: "Klachtenregister",
        date,
        preview: false,
      })
    );
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="complai-klachtenregister.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(`[pdf/klachten] render mislukt (company ${company.id}):`, e);
    return new Response("Kon het klachtenregister niet genereren.", { status: 500 });
  }
}
