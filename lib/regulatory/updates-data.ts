import "server-only";
import { cache } from "react";

import type { RegulatoryUpdate as RegulatoryUpdateRow } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { CompanySignals } from "@/lib/compliance/signals";
import {
  evaluateUpdates,
  type EvaluatedUpdate,
  type RegulatoryUpdate,
  type UpdateCategory,
} from "@/lib/regulatory/updates";

/** DB row → the app's RegulatoryUpdate shape (nested source/affects, optional
 *  fields as undefined). Dates are already "YYYY-MM-DD" strings, so no
 *  conversion — the rest of the app sees exactly what the seed used to give. */
export function mapUpdateRow(row: RegulatoryUpdateRow): RegulatoryUpdate {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    summary: row.summary,
    detail: row.detail.length ? row.detail : undefined,
    category: row.category as UpdateCategory,
    source: { label: row.sourceLabel, url: row.sourceUrl },
    affects: {
      everyone: row.affectsEveryone || undefined,
      highRisk: row.affectsHighRisk || undefined,
      prohibited: row.affectsProhibited || undefined,
      limited: row.affectsLimited || undefined,
      provider: row.affectsProvider || undefined,
    },
    productImpact: row.productImpact ?? undefined,
    recert: row.recert ?? undefined,
    addedAt: row.addedAt ?? undefined,
  };
}

/** Published updates only (draft rows are hidden from customers + the public
 *  page). Newest first. Request-memoized (cache) so the dashboard layout AND
 *  page — which both evaluate updates in one render — hit the table once. */
export const getPublishedUpdates = cache(async (): Promise<RegulatoryUpdate[]> => {
  const rows = await prisma.regulatoryUpdate.findMany({
    where: { status: "published" },
    orderBy: { date: "desc" },
  });
  return rows.map(mapUpdateRow);
});

/** Published updates, evaluated for relevance to this company. */
export async function getEvaluatedUpdates(
  sig: CompanySignals
): Promise<EvaluatedUpdate[]> {
  return evaluateUpdates(await getPublishedUpdates(), sig);
}
