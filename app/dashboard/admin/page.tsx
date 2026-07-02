import Link from "next/link";
import { notFound } from "next/navigation";
import { LogIn, ShieldCheck } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { env, isSuperAdminEmail } from "@/lib/env";
import { cn, formatDate } from "@/lib/utils";
import { TIER_ORDER, TIER_LABEL, tierRank } from "@/lib/plan";
import type { TierId } from "@/lib/compliance/types";
import { DEMO_COMPANY_NAME } from "@/lib/demo";
import {
  grantSuperAdmin,
  revokeSuperAdmin,
  startImpersonation,
} from "@/app/dashboard/admin/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { PlanSelect } from "@/components/dashboard/admin/plan-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const ROLE_LABEL: Record<string, string> = {
  admin: "Beheerder",
  manager: "Manager",
  employee: "Medewerker",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const me = await getCurrentUser().catch(() => null);
  if (!me?.superAdmin) notFound();

  const view = searchParams.view === "personen" ? "personen" : "organisaties";

  const [companies, staff, people] = await Promise.all([
    prisma.company.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { users: true } } },
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { superAdmin: true },
          ...(env.superAdminEmails.length ? [{ email: { in: env.superAdminEmails } }] : []),
        ],
      },
      include: { company: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
    view === "personen"
      ? prisma.user.findMany({
          include: { company: { select: { name: true } } },
          orderBy: [{ company: { name: "asc" } }, { role: "asc" }],
        })
      : Promise.resolve([]),
  ]);

  const paying = companies.filter(
    (c) => tierRank(c.plan) > 0 && c.stripeCustomerId && c.name !== DEMO_COMPANY_NAME
  ).length;

  const tabClass = (active: boolean) =>
    cn(
      "rounded-lg px-3 py-1.5 text-sm font-medium",
      active ? "bg-navy-900 text-white" : "text-muted-foreground hover:bg-secondary"
    );

  return (
    <>
      <PageHeader
        title="ComplAI-beheer"
        description="Alle klantorganisaties en het ComplAI-team. Alleen zichtbaar voor super-admins."
      />

      <div className="mb-6 flex flex-wrap gap-4">
        {[
          { label: "Organisaties", value: companies.length },
          { label: "Betalend", value: paying },
          { label: "Super-admins", value: staff.length },
        ].map((s) => (
          <Card key={s.label} className="min-w-[150px]">
            <CardContent className="py-4">
              <p className="text-2xl font-bold tabular-nums">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Staff management */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">ComplAI-team (super-admins)</CardTitle>
          <CardDescription>
            Super-admins beheren alle klanten. Dit staat los van de rol binnen een
            klantorganisatie (beheerder/manager/medewerker).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="divide-y">
            {staff.map((u) => {
              const fixed = isSuperAdminEmail(u.email);
              return (
                <li key={u.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="text-sm">
                    <p className="font-medium">{u.name ?? u.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.email}
                      {u.company ? ` · ${u.company.name}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {fixed && <Badge variant="secondary">vast</Badge>}
                    {u.id === me.id && <Badge variant="secondary">u</Badge>}
                    {!fixed && u.id !== me.id && (
                      <form action={revokeSuperAdmin}>
                        <input type="hidden" name="userId" value={u.id} />
                        <Button type="submit" size="sm" variant="ghost">
                          Intrekken
                        </Button>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <form action={grantSuperAdmin} className="flex flex-wrap items-end gap-2 border-t pt-4">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="email">
                Maak iemand super-admin (op e-mailadres — moet al een account hebben)
              </label>
              <Input id="email" name="email" type="email" placeholder="collega@complai.nl" required />
            </div>
            <Button type="submit">Toevoegen</Button>
          </form>
        </CardContent>
      </Card>

      {/* View switch */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {view === "personen" ? "Alle personen" : "Klantorganisaties"}
        </h2>
        <div className="inline-flex gap-1 rounded-lg border p-1">
          <Link href="/dashboard/admin" className={tabClass(view === "organisaties")}>
            Organisaties
          </Link>
          <Link href="/dashboard/admin?view=personen" className={tabClass(view === "personen")}>
            Alle personen
          </Link>
        </div>
      </div>

      {view === "organisaties" ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organisatie</TableHead>
                  <TableHead>Aangemaakt</TableHead>
                  <TableHead>Personen</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pakket</TableHead>
                  <TableHead className="text-right">Actie</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((c) => {
                  const isDemo = c.name === DEMO_COMPANY_NAME;
                  const isSelf = c.id === me.company?.id;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        <span className="flex items-center gap-2">
                          {c.name}
                          {isSelf && (
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
                          <PlanSelect
                            companyId={c.id}
                            companyName={c.name}
                            plan={TIER_ORDER[tierRank(c.plan)]}
                          />
                          {c.stripeCustomerId && !isSelf && (
                            <span className="text-[11px] text-amber-600">
                              heeft Stripe-abonnement — handmatige wijziging wordt door
                              de volgende webhook overschreven
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {!isSelf && (
                          <form action={startImpersonation}>
                            <input type="hidden" name="companyId" value={c.id} />
                            <Button type="submit" size="sm" variant="outline">
                              <LogIn className="h-4 w-4" /> Open dashboard
                            </Button>
                          </form>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naam</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Organisatie</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        {u.name ?? "—"}
                        {u.superAdmin && (
                          <Badge variant="secondary" className="gap-1">
                            <ShieldCheck className="h-3 w-3" /> staff
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="text-sm">{ROLE_LABEL[u.role] ?? u.role}</TableCell>
                    <TableCell className="text-sm">{u.company?.name ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        &ldquo;Open dashboard&rdquo; opent de omgeving van die klant als ComplAI-beheerder:
        u ziet en wijzigt alles in hun omgeving (audit-gelogd). Uw eigen organisatie is
        vrijgesteld van Stripe-reconciliatie, dus een handmatig gekozen pakket blijft staan.
      </p>
    </>
  );
}
