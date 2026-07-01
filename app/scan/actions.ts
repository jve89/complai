"use server";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buildProfile } from "@/lib/compliance/profile";
import { buildEvidence } from "@/lib/compliance/evidence";
import {
  evidenceFromAnswers,
  mergeEvidence,
} from "@/lib/compliance/evidence-from-answers";
import { materializeComplianceItems } from "@/lib/compliance/materialize";
import { syncAiSystemsFromTools } from "@/lib/scan/claim";
import type { ScanAnswers } from "@/lib/compliance/questions";

/**
 * Persists a completed scan: computes the compliance profile, stores it on the
 * scan result, and — if the visitor is logged in — writes the profile onto the
 * company and materialises one compliance item per obligation (so the dashboard
 * and governance reflect the scan).
 */
export async function submitScan(
  answers: ScanAnswers
): Promise<{ id: string }> {
  const user = await getCurrentUser().catch(() => null);
  const companyId = user?.company?.id ?? null;

  // The readiness answers are always the floor of evidence (works with no
  // account); for logged-in companies we merge in real DB evidence (DB wins).
  const answerEvidence = evidenceFromAnswers(answers);
  const evidence = companyId
    ? mergeEvidence(answerEvidence, await buildEvidence(companyId))
    : answerEvidence;
  const profile = buildProfile(answers, evidence);

  const result = await prisma.scanResult.create({
    data: {
      score: profile.score,
      answers: answers as unknown as Prisma.InputJsonValue,
      profile: profile as unknown as Prisma.InputJsonValue,
      companyId,
      userId: user?.id ?? null,
    },
  });

  if (companyId) {
    await prisma.company.update({
      where: { id: companyId },
      data: {
        size: answers.size ?? undefined,
        sector: answers.sector ?? undefined,
        // `plan` is the PURCHASED plan (what documents they can generate), not
        // the recommendation — the scan only records the recommendation, in
        // profileJson.recommendedTier. Leave the active plan untouched.
        entityRoles: profile.entityRoles,
        riskTiers: profile.riskTiers,
        profileJson: profile as unknown as Prisma.InputJsonValue,
      },
    });
    await materializeComplianceItems(companyId, profile);
    await syncAiSystemsFromTools(companyId, answers);
  }

  return { id: result.id };
}
