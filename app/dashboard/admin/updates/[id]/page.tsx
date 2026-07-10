import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { UpdateCategory } from "@/lib/regulatory/updates";
import { PageHeader } from "@/components/dashboard/page-header";
import { UpdateForm, type UpdateFormValues } from "@/components/dashboard/admin/update-form";

export const dynamic = "force-dynamic";

const EMPTY: UpdateFormValues = {
  date: "",
  title: "",
  summary: "",
  detail: "",
  category: "deadline",
  sourceLabel: "",
  sourceUrl: "",
  affectsEveryone: false,
  affectsHighRisk: false,
  affectsProhibited: false,
  affectsLimited: false,
  affectsProvider: false,
  productImpact: "",
  recert: "",
  status: "draft",
};

export default async function EditUpdatePage({ params }: { params: { id: string } }) {
  const me = await getCurrentUser().catch(() => null);
  if (!me?.superAdmin) notFound();

  const isNew = params.id === "new";
  let initial = EMPTY;

  if (!isNew) {
    const row = await prisma.regulatoryUpdate.findUnique({ where: { id: params.id } });
    if (!row) notFound();
    initial = {
      id: row.id,
      date: row.date,
      title: row.title,
      summary: row.summary,
      detail: row.detail.join("\n"),
      category: row.category as UpdateCategory,
      sourceLabel: row.sourceLabel,
      sourceUrl: row.sourceUrl,
      affectsEveryone: row.affectsEveryone,
      affectsHighRisk: row.affectsHighRisk,
      affectsProhibited: row.affectsProhibited,
      affectsLimited: row.affectsLimited,
      affectsProvider: row.affectsProvider,
      productImpact: row.productImpact ?? "",
      recert: row.recert ?? "",
      status: row.status === "published" ? "published" : "draft",
    };
  }

  return (
    <>
      <PageHeader
        title={isNew ? "Nieuwe update" : "Update bewerken"}
        description="Publiceren maakt de update zichtbaar voor klanten (dashboard) én publiek (/updates). Een primaire bron-URL is verplicht."
      />
      <Link
        href="/dashboard/admin/updates"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Terug naar de lijst
      </Link>
      <UpdateForm initial={initial} />
    </>
  );
}
