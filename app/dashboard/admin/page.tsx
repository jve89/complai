import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/env";
import { formatDate } from "@/lib/utils";
import { TIER_LABEL, TIER_ORDER, tierRank } from "@/lib/plan";
import type { TierId } from "@/lib/compliance/types";
import { DEMO_COMPANY_NAME } from "@/lib/demo";
import { PageHeader } from "@/components/dashboard/page-header";
import { PlanSelect } from "@/components/dashboard/admin/plan-select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  active: "Actief",
  trialing: "Proef",
  past_due: "Betaling mislukt",
  canceled: "Opgezegd",
};

export default async function AdminPage() {
  const user = await getCurrentUser().catch(() => null);
  if (!isSuperAdmin(user?.email)) notFound();

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { users: true, aiSystems: true } },
    },
  });

  const paying = companies.filter(
    (c) => tierRank(c.plan) > 0 && c.name !== DEMO_COMPANY_NAME
  ).length;

  return (
    <>
      <PageHeader
        title="ComplAI-beheer"
        description="Alle klantorganisaties en hun pakket. Alleen zichtbaar voor ComplAI-beheerders."
      />

      <div className="mb-6 flex flex-wrap gap-4">
        {[
          { label: "Organisaties", value: companies.length },
          { label: "Betalend", value: paying },
        ].map((s) => (
          <Card key={s.label} className="min-w-[160px]">
            <CardContent className="py-4">
              <p className="text-2xl font-bold tabular-nums">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organisatie</TableHead>
                <TableHead>Aangemaakt</TableHead>
                <TableHead>Gebruikers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pakket</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((c) => {
                const isDemo = c.name === DEMO_COMPANY_NAME;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        {c.name}
                        {isSuperAdmin(user?.email) && c.id === user?.company?.id && (
                          <Badge variant="secondary" className="gap-1">
                            <ShieldCheck className="h-3 w-3" /> u
                          </Badge>
                        )}
                        {isDemo && <Badge variant="secondary">demo</Badge>}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(c.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm">{c._count.users}</TableCell>
                    <TableCell>
                      {c.stripeCustomerId ? (
                        <Badge variant="secondary">
                          {STATUS_LABEL[c.planStatus ?? ""] ?? "—"}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">geen abonnement</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <PlanSelect companyId={c.id} plan={TIER_ORDER[tierRank(c.plan)]} />
                        {c.stripeCustomerId && (
                          <span className="text-[11px] text-amber-600">
                            heeft Stripe-abonnement — handmatige wijziging wordt
                            door de volgende webhook overschreven
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        Pakket handmatig zetten geldt direct (ontgrendelt documenten), maar
        wijzigt geen betaling. Voor betalende klanten is Stripe leidend —{" "}
        {TIER_LABEL[TIER_ORDER[TIER_ORDER.length - 1] as TierId]} voor uzelf zetten
        werkt alleen blijvend op een organisatie zonder actief abonnement.
      </p>
    </>
  );
}
