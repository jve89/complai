import { renderToBuffer } from "@react-pdf/renderer";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { getDemoCompanyId } from "@/lib/demo";
import { getModule, getPath, moduleCountForPath } from "@/lib/training/content";
import { trainingUnlocked } from "@/lib/plan";
import { CertificatePdf } from "@/components/pdf/certificate-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { employeeId: string } }
) {
  // Look the employee up first; demo certificates are public, real ones are
  // scoped to the active company (which may redirect anonymous users to login).
  const employee = await prisma.employee.findUnique({
    where: { id: params.employeeId },
    include: { trainingCompletions: true, company: { select: { id: true, name: true } } },
  });
  if (!employee || employee.trainingCompletions.length === 0) {
    return new Response("Geen certificaat beschikbaar", { status: 404 });
  }

  // Demo certificates are public; real ones need ownership + a paid plan. Match
  // the demo by its stable id, not the mutable company name (rename-to-bypass).
  const isDemo = employee.companyId === (await getDemoCompanyId());
  if (!isDemo) {
    const { company } = await getActiveCompany();
    if (employee.companyId !== company.id) {
      return new Response("Geen certificaat beschikbaar", { status: 404 });
    }
    // Certificates are a paid deliverable — a downgraded free company can't pull
    // one via the direct URL either.
    if (!trainingUnlocked(company.plan)) {
      return new Response("Certificaten zijn beschikbaar vanaf het pakket Basis", {
        status: 403,
      });
    }
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
