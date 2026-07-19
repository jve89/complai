// Materialises a ComplianceProfile's obligations into the `compliance_items`
// table, so the dashboard and governance (which already read that table) reflect
// the scan. The profile is the single source of truth — we replace all items.

import type { ComplianceStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { ComplianceProfile, ObligationStatus } from "@/lib/compliance/types";

/** Accepts the base client or a transaction client, so callers can make the
 * replace atomic within a larger $transaction (see applyScanToCompany). */
type Db = Prisma.TransactionClient | typeof prisma;

function toComplianceStatus(status: ObligationStatus): ComplianceStatus {
  switch (status) {
    case "done":
    case "not_applicable":
      return "compliant";
    case "in_progress":
      return "in_progress";
    default:
      return "open";
  }
}

export async function materializeComplianceItems(
  companyId: string,
  profile: ComplianceProfile,
  db: Db = prisma
): Promise<void> {
  await db.complianceItem.deleteMany({ where: { companyId } });
  if (profile.obligations.length === 0) return;

  await db.complianceItem.createMany({
    data: profile.obligations.map((o) => ({
      companyId,
      code: o.code,
      article: o.article,
      title: o.title,
      status: toComplianceStatus(o.status),
      required: o.required,
      deadline: o.deadline ? new Date(o.deadline) : null,
    })),
  });
}
