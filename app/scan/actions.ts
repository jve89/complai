"use server";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { scoreScan } from "@/lib/scan/scoring";
import type { ScanAnswers } from "@/lib/scan/questions";

/**
 * Persists a completed risk scan and returns its id. Works anonymously
 * (company/user null) so pre-signup scans are kept; if the visitor is logged
 * in the result is linked to their company.
 */
export async function submitScan(
  answers: ScanAnswers
): Promise<{ id: string }> {
  const { score } = scoreScan(answers);

  const user = await getCurrentUser().catch(() => null);

  const result = await prisma.scanResult.create({
    data: {
      score,
      answers: answers as Prisma.InputJsonValue,
      companyId: user?.company?.id ?? null,
      userId: user?.id ?? null,
    },
  });

  return { id: result.id };
}
