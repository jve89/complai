import { renderToBuffer } from "@react-pdf/renderer";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { getModule, getPath, moduleCountForPath } from "@/lib/training/content";
import { CertificatePdf } from "@/components/pdf/certificate-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { employeeId: string } }
) {
  const { company } = await getActiveCompany();

  const employee = await prisma.employee.findFirst({
    where: { id: params.employeeId, companyId: company.id },
    include: { trainingCompletions: true },
  });
  if (!employee || employee.trainingCompletions.length === 0) {
    return new Response("Geen certificaat beschikbaar", { status: 404 });
  }

  const completedTitles = employee.trainingCompletions
    .map((c) => getModule(c.moduleId)?.title)
    .filter((t): t is string => Boolean(t));

  const pathLabel = getPath(employee.role)?.label ?? "Medewerker";
  const complete =
    employee.trainingCompletions.length >= moduleCountForPath(employee.role);

  const latest = employee.trainingCompletions.reduce((a, b) =>
    a.completedAt > b.completedAt ? a : b
  );
  const date = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(
    latest.completedAt
  );

  const buffer = await renderToBuffer(
    CertificatePdf({
      name: employee.name,
      pathLabel,
      modules: completedTitles,
      date,
      complete,
    })
  );

  const filename = `certificaat-${employee.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
