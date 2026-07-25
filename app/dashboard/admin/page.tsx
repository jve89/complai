import Link from "next/link";
import { notFound } from "next/navigation";
import { BarChart3, BellRing, ChevronRight, LogIn, ShieldCheck } from "lucide-react";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { env, isSuperAdminEmail } from "@/lib/env";
import { cn, formatDate } from "@/lib/utils";
import { TIER_ORDER, tierRank } from "@/lib/plan";
import { DEMO_COMPANY_NAME } from "@/lib/demo";
import { revokeSuperAdmin, startImpersonation } from "@/app/dashboard/admin/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { PlanSelect } from "@/components/dashboard/admin/plan-select";
import { DeleteButton } from "@/components/dashboard/admin/delete-button";
import { ResetButton } from "@/components/dashboard/admin/reset-button";
import { AdminSearch } from "@/components/dashboard/admin/admin-search";
import { RoleSelect } from "@/components/dashboard/admin/role-select";
import { SuperAdminToggle } from "@/components/dashboard/admin/super-admin-toggle";
import { InfoHint } from "@/components/ui/info-hint";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  active: "Actief",
  trialing: "Proef",
  past_due: "Betaling mislukt",
  canceled: "Opgezegd",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { view?: string; q?: string; sort?: string; dir?: string };
}) {
  const me = await getCurrentUser().catch(() => null);
  if (!me?.superAdmin) notFound();

  const view = searchParams.view === "personen" ? "personen" : "organisaties";
  const q = searchParams.q?.trim() ?? "";
  const sort = searchParams.sort ?? "";
  const dir: "asc" | "desc" = searchParams.dir === "desc" ? "desc" : "asc";
  const like = { contains: q, mode: "insensitive" as const };

  const companyWhere: Prisma.CompanyWhereInput = q ? { name: like } : {};
  const peopleWhere: Prisma.UserWhereInput = q
    ? { OR: [{ name: like }, { email: like }, { company: { name: like } }] }
    : {};

  const [companies, staff, people] = await Promise.all([
    prisma.company.findMany({
      where: companyWhere,
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
          where: peopleWhere,
          include: { company: { select: { name: true } } },
          orderBy: [{ company: { name: "asc" } }, { role: "asc" }],
        })
      : Promise.resolve([]),
  ]);

  // In-memory sort (handles pakket-by-rank and personen-by-count, which SQL
  // can't order directly). Default order stays as the query returns it.
  const d = dir === "desc" ? -1 : 1;
  const companyCmp: Record<string, (a: (typeof companies)[number], b: (typeof companies)[number]) => number> = {
    organisatie: (a, b) => a.name.localeCompare(b.name),
    aangemaakt: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    personen: (a, b) => a._count.users - b._count.users,
    status: (a, b) => (a.planStatus ?? "").localeCompare(b.planStatus ?? ""),
    pakket: (a, b) => tierRank(a.plan) - tierRank(b.plan),
  };
  if (companyCmp[sort]) companies.sort((a, b) => companyCmp[sort](a, b) * d);

  const peopleCmp: Record<string, (a: (typeof people)[number], b: (typeof people)[number]) => number> = {
    naam: (a, b) => (a.name ?? "").localeCompare(b.name ?? ""),
    email: (a, b) => a.email.localeCompare(b.email),
    rol: (a, b) => a.role.localeCompare(b.role),
    organisatie: (a, b) => (a.company?.name ?? "").localeCompare(b.company?.name ?? ""),
  };
  if (peopleCmp[sort]) people.sort((a, b) => peopleCmp[sort](a, b) * d);

  // "Betalend" = an actual live subscription, not just a leftover Stripe
  // customer record (which an abandoned checkout also creates).
  const paying = companies.filter(
    (c) => c.stripeSubscriptionId && c.name !== DEMO_COMPANY_NAME
  ).length;

  const tabClass = (active: boolean) =>
    cn(
      "rounded-lg px-3 py-1.5 text-sm font-medium",
      active ? "bg-navy-900 text-white" : "text-muted-foreground hover:bg-secondary"
    );

  // Sortable column header (Link that toggles dir, preserving view + search).
  const sortHead = (col: string, label: string, right = false) => {
    const active = sort === col;
    const p = new URLSearchParams();
    if (view === "personen") p.set("view", "personen");
    if (q) p.set("q", q);
    p.set("sort", col);
    p.set("dir", active && dir === "asc" ? "desc" : "asc");
    return (
      <TableHead className={right ? "text-right" : undefined}>
        <Link
          href={`/dashboard/admin?${p.toString()}`}
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          {label}
          <span className="text-muted-foreground">
            {active ? (dir === "desc" ? "↓" : "↑") : ""}
          </span>
        </Link>
      </TableHead>
    );
  };

  return (
    <>
      <PageHeader
        title="ComplAI-beheer"
        description="Alle klantorganisaties en het ComplAI-team. Alleen zichtbaar voor super-admins."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {[
          {
            href: "/dashboard/admin/metrics",
            icon: BarChart3,
            title: "Statistieken",
            desc: "Funnel, activatie, retentie",
          },
          {
            href: "/dashboard/admin/updates",
            icon: BellRing,
            title: "Updates beheren",
            desc: "Changelog publiceren",
          },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="group">
            <Card className="transition-colors hover:border-primary hover:bg-secondary/40">
              <CardContent className="flex items-center gap-4 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <a.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{a.title}</p>
                  <p className="text-sm text-muted-foreground">{a.desc}</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

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

      {/* Klanten & team — collapsible workspace, à la the Overzicht dashboard.
          The stat cards above stay always-visible; these sections tuck away. */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <Accordion
          type="multiple"
          defaultValue={["klanten"]}
          className="divide-y-2 divide-slate-200"
        >
          {/* Main workspace — open by default (you open beheer to manage these). */}
          <AccordionItem value="klanten" className="border-0">
            <AccordionTrigger className="px-5 py-4 hover:no-underline">
              <span className="flex items-center gap-2 text-foreground">
                Klanten &amp; personen
                <Badge variant="secondary">{companies.length}</Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 text-foreground">
              {/* View switch + search */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex gap-1 rounded-lg border p-1">
                  <Link href="/dashboard/admin" className={tabClass(view === "organisaties")}>
                    Organisaties
                  </Link>
                  <Link
                    href="/dashboard/admin?view=personen"
                    className={tabClass(view === "personen")}
                  >
                    Alle personen
                  </Link>
                </div>
                <AdminSearch
                  key={view}
                  placeholder={view === "personen" ? "Zoek op naam, e-mail…" : "Zoek op organisatie…"}
                />
              </div>

      {view === "organisaties" ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {sortHead("organisatie", "Organisatie")}
                  {sortHead("aangemaakt", "Aangemaakt")}
                  {sortHead("personen", "Personen")}
                  {sortHead("status", "Status")}
                  {sortHead("pakket", "Pakket")}
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
                        {c.planStatus ? (
                          <Badge variant="secondary">
                            {STATUS_LABEL[c.planStatus] ?? c.planStatus}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">geen abonnement</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <PlanSelect
                            companyId={c.id}
                            companyName={c.name}
                            plan={TIER_ORDER[tierRank(c.plan)]}
                          />
                          {c.stripeSubscriptionId && !isSelf && (
                            <InfoHint label="Waarom wordt een handmatige wijziging overschreven?">
                              Deze organisatie heeft een lopend Stripe-abonnement. Een
                              handmatige pakketwijziging hier wordt door de volgende
                              webhook overschreven.
                            </InfoHint>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {/* Fixed-width slots so the action buttons line up in
                            the same columns across every row, even when some
                            actions are hidden (own org / demo). */}
                        <div className="ml-auto grid w-fit grid-cols-[160px_2.25rem_2.25rem] items-center gap-1">
                          <div>
                            {!isSelf && (
                              <form action={startImpersonation}>
                                <input type="hidden" name="companyId" value={c.id} />
                                <Button
                                  type="submit"
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                >
                                  <LogIn className="h-4 w-4" /> Open dashboard
                                </Button>
                              </form>
                            )}
                          </div>
                          <div className="flex justify-center">
                            {!isDemo && <ResetButton id={c.id} name={c.name} />}
                          </div>
                          <div className="flex justify-center">
                            {!isSelf && !isDemo && (
                              <DeleteButton id={c.id} name={c.name} kind="organisatie" />
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {companies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      Geen organisaties gevonden.
                    </TableCell>
                  </TableRow>
                )}
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
                  {sortHead("naam", "Naam")}
                  {sortHead("email", "E-mail")}
                  {sortHead("rol", "Rol")}
                  {sortHead("organisatie", "Organisatie")}
                  <TableHead>Super-admin</TableHead>
                  <TableHead className="text-right">Actie</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <RoleSelect userId={u.id} name={u.name ?? u.email} role={u.role} />
                    </TableCell>
                    <TableCell className="text-sm">{u.company?.name ?? "—"}</TableCell>
                    <TableCell>
                      <SuperAdminToggle
                        userId={u.id}
                        name={u.name ?? u.email}
                        isSuper={u.superAdmin || isSuperAdminEmail(u.email)}
                        fixed={isSuperAdminEmail(u.email)}
                        isSelf={u.id === me.id}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {u.id !== me.id && (
                        <DeleteButton id={u.id} name={u.name ?? u.email} kind="persoon" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {people.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      Geen personen gevonden.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* ComplAI-team — reference; collapsed by default. */}
          <AccordionItem value="team" className="border-0">
            <AccordionTrigger className="px-5 py-4 hover:no-underline">
              <span className="flex items-center gap-2 text-foreground">
                ComplAI-team
                <Badge variant="secondary">{staff.length}</Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 text-foreground">
              <p className="mb-3 text-sm text-muted-foreground">
                Super-admins beheren alle klanten — los van de rol binnen een
                klantorganisatie. Iemand promoveren? Doe dat via de{" "}
                <Link href="/dashboard/admin?view=personen" className="text-primary hover:underline">
                  Alle personen
                </Link>{" "}
                tab.
              </p>
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        &ldquo;Open dashboard&rdquo; opent de omgeving van die klant als ComplAI-beheerder:
        u ziet en wijzigt alles in hun omgeving (audit-gelogd). Uw eigen organisatie is
        vrijgesteld van Stripe-reconciliatie, dus een handmatig gekozen pakket blijft staan.
      </p>
    </>
  );
}
