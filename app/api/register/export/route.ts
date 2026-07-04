import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { getDemoCompany } from "@/lib/demo";
import { RISK_LABEL, ROLE_LABEL, STATUS_LABEL } from "@/lib/register/labels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(value: string | null | undefined) {
  const v = (value ?? "").replace(/"/g, '""');
  return `"${v}"`;
}

export async function GET(req: Request) {
  // The demo register is public, so its export skips auth (demo data only).
  const isDemo = new URL(req.url).searchParams.get("demo") === "1";
  const company = isDemo ? await getDemoCompany() : (await getActiveCompany()).company;
  const systems = await prisma.aiSystem.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "asc" },
  });

  const headers = [
    "Naam",
    "Leverancier",
    "Omschrijving",
    "Rol",
    "Risiconiveau",
    "Status",
    "Aangemaakt",
  ];

  // Semicolon separator + UTF-8 BOM so Dutch Excel opens it cleanly.
  const rows = systems.map((s) =>
    [
      s.name,
      s.vendor,
      s.description,
      ROLE_LABEL[s.role],
      RISK_LABEL[s.riskLevel],
      STATUS_LABEL[s.status] ?? s.status,
      s.createdAt.toISOString().slice(0, 10),
    ]
      .map(csvCell)
      .join(";")
  );

  const csv = "﻿" + [headers.map(csvCell).join(";"), ...rows].join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ai-register-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
