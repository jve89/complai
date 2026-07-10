import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { CATEGORY_LABEL, type UpdateCategory } from "@/lib/regulatory/updates";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminUpdatesPage() {
  const me = await getCurrentUser().catch(() => null);
  if (!me?.superAdmin) notFound();

  const updates = await prisma.regulatoryUpdate.findMany({
    orderBy: [{ status: "asc" }, { date: "desc" }],
  });

  return (
    <>
      <PageHeader
        title="Updates beheren"
        description="De 'keep you current'-changelog. Concepten zijn onzichtbaar voor klanten; gepubliceerde items verschijnen in het dashboard én op de publieke /updates-pagina."
      >
        <Button asChild>
          <Link href="/dashboard/admin/updates/new">
            <Plus className="h-4 w-4" /> Nieuwe update
          </Link>
        </Button>
      </PageHeader>

      <Link
        href="/dashboard/admin"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Terug naar beheer
      </Link>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Categorie</TableHead>
              <TableHead>Titel</TableHead>
              <TableHead className="text-right">Actie</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  Nog geen updates. Maak de eerste aan.
                </TableCell>
              </TableRow>
            ) : (
              updates.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    {u.status === "published" ? (
                      <Badge variant="success">Gepubliceerd</Badge>
                    ) : (
                      <Badge variant="secondary">Concept</Badge>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {formatDate(new Date(u.date))}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {CATEGORY_LABEL[u.category as UpdateCategory] ?? u.category}
                  </TableCell>
                  <TableCell className="max-w-md text-sm font-medium">{u.title}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/dashboard/admin/updates/${u.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Bewerken
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
