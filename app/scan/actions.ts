"use server";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, canAdminister } from "@/lib/auth";
import { buildProfile } from "@/lib/compliance/profile";
import { buildEvidence } from "@/lib/compliance/evidence";
import {
  evidenceFromAnswers,
  mergeEvidence,
} from "@/lib/compliance/evidence-from-answers";
import { materializeComplianceItems } from "@/lib/compliance/materialize";
import { syncAiSystemsFromTools } from "@/lib/scan/claim";
import { sendScanResult } from "@/lib/email/send";
import { currentBaseUrl } from "@/lib/request-url";
import { rateLimitByIp } from "@/lib/rate-limit";
import { headlineLabel } from "@/lib/compliance/labels";
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
  // Generous throttle so no real user is affected, but anonymous DB spam can't
  // run away. The wizard catches this and shows a retry message.
  const rl = await rateLimitByIp("scan", 20, 3600);
  if (!rl.ok) throw new Error(rl.error);

  const user = await getCurrentUser().catch(() => null);
  // The risicoscan rewrites company-wide readiness + obligations, so only a
  // beheerder's scan writes to the company. Managers/medewerkers can still run
  // the scan and get their own report, but it won't alter shared company state.
  const companyId = canAdminister(user) ? user?.company?.id ?? null : null;

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

  // Signed-in scanners get the report link by email (anonymous scans have no
  // address; those users get the link via the welcome email at signup instead).
  if (user?.email) {
    await sendScanResult({
      to: user.email,
      score: profile.score,
      headlineLabel: headlineLabel(profile.headline),
      baseUrl: currentBaseUrl(),
      resultPath: `/scan/results/${result.id}`,
    });
  }

  return { id: result.id };
}
