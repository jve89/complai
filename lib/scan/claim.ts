import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { materializeComplianceItems } from "@/lib/compliance/materialize";
import type { ComplianceProfile } from "@/lib/compliance/types";
import type { ScanAnswers } from "@/lib/compliance/questions";

/**
 * The bridge from a logged-out scan to the dashboard: attaches a scan to a
 * company by copying its computed profile onto the company, materialising the
 * obligations into compliance_items, and linking the scan record. So when a
 * visitor scans anonymously and then signs up (or logs in), their dashboard
 * opens already populated from that scan instead of empty.
 *
 * No-op (returns false) if the scan is missing, has no profile, or has already
 * been claimed by a different company.
 */
export async function applyScanToCompany(
  scanId: string,
  companyId: string,
  userId?: string
): Promise<boolean> {
  const scan = await prisma.scanResult.findUnique({ where: { id: scanId } });
  if (!scan || !scan.profile) return false;
  if (scan.companyId && scan.companyId !== companyId) return false;

  const profile = scan.profile as unknown as ComplianceProfile;
  const answers = scan.answers as unknown as ScanAnswers | null;

  await prisma.company.update({
    where: { id: companyId },
    data: {
      size: answers?.size ?? undefined,
      sector: answers?.sector ?? undefined,
      plan: profile.recommendedTier,
      entityRoles: profile.entityRoles,
      riskTiers: profile.riskTiers,
      profileJson: profile as unknown as Prisma.InputJsonValue,
    },
  });

  await prisma.scanResult.update({
    where: { id: scanId },
    data: { companyId, userId: userId ?? undefined },
  });

  await materializeComplianceItems(companyId, profile);
  return true;
}
