import { renderToBuffer } from "@react-pdf/renderer";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { IncidentReportPdf } from "@/components/pdf/incident-report-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  // Incidents are always company-scoped: fetch scoped to the active company, so a
  // user can only ever download their own (or the demo) company's report.
  const { company } = await getActiveCompany();
  const incident = await prisma.incident.findFirst({
    where: { id: params.id, companyId: company.id },
  });
  if (!incident) return new Response("Melding niet gevonden", { status: 404 });

  try {
    const buffer = await renderToBuffer(
      IncidentReportPdf({ incident, companyName: company.name })
    );
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="complai-meldrapport.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(`[pdf/incident] render mislukt (incident ${incident.id}):`, e);
    return new Response("Kon dit meldrapport niet genereren.", { status: 500 });
  }
}
