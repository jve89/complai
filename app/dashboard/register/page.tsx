import type { Prisma, RiskLevel } from "@prisma/client";
import { Download, Pencil, Plus, Database } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import {
  RISK_LEVELS,
  RISK_LABEL,
  RISK_BADGE,
  ROLE_LABEL,
  STATUSES,
  STATUS_LABEL,
  STATUS_BADGE,
} from "@/lib/register/labels";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AiSystemDialog } from "@/components/dashboard/register/ai-system-dialog";
import { DeleteSystemButton } from "@/components/dashboard/register/delete-system-button";
import { RegisterFilters } from "@/components/dashboard/register/register-filters";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { risk?: string; status?: string };
}) {
  const { company } = await getActiveCompany();

  const riskFilter = RISK_LEVELS.includes(searchParams.risk as RiskLevel)
    ? (searchParams.risk as RiskLevel)
    : undefined;
  const statusFilter = (STATUSES as readonly string[]).includes(
    searchParams.status ?? ""
  )
    ? searchParams.status
    : undefined;

  const where: Prisma.AiSystemWhereInput = {
    companyId: company.id,
    ...(riskFilter ? { riskLevel: riskFilter } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const [systems, total] = await Promise.all([
    prisma.aiSystem.findMany({ where, orderBy: { createdAt: "asc" } }),
    prisma.aiSystem.count({ where: { companyId: company.id } }),
  ]);

  return (
    <>
      <PageHeader
        title="AI-register"
        description="Beheer al uw AI-systemen en hun risicoclassificatie."
      >
        <Button asChild variant="outline">
          <a href="/api/register/export">
            <Download className="h-4 w-4" /> Exporteer CSV
          </a>
        </Button>
        <AiSystemDialog
          trigger={
            <Button>
              <Plus className="h-4 w-4" /> Nieuw systeem
            </Button>
          }
        />
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <RegisterFilters />
        <p className="text-sm text-muted-foreground">
          {systems.length} van {total} systemen
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {systems.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <Database className="h-6 w-6" />
              </div>
              <p className="text-muted-foreground">
                {total === 0
                  ? "Nog geen AI-systemen geregistreerd."
                  : "Geen systemen die aan de filters voldoen."}
              </p>
              {total === 0 && (
                <AiSystemDialog
                  trigger={
                    <Button>
                      <Plus className="h-4 w-4" /> Eerste systeem toevoegen
                    </Button>
                  }
                />
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Systeem</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Risiconiveau</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Toegevoegd</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {systems.map((system) => (
                  <TableRow key={system.id}>
                    <TableCell>
                      <p className="font-medium">{system.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {system.vendor || "Onbekende leverancier"}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {ROLE_LABEL[system.role]}
                    </TableCell>
                    <TableCell>
                      <Badge variant={RISK_BADGE[system.riskLevel]}>
                        {RISK_LABEL[system.riskLevel]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[system.status] ?? "secondary"}>
                        {STATUS_LABEL[system.status] ?? system.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(system.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <AiSystemDialog
                          system={system}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Bewerken"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DeleteSystemButton id={system.id} name={system.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
