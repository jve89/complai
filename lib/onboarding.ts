import type { Company } from "@prisma/client";

import { tierRank } from "@/lib/plan";

/**
 * The 3-step onboarding a customer completes in ANY order: create an account,
 * do the risicoscan, and choose a pakket. Single source of truth so every
 * surface (dashboard checklist, scan-results CTA) agrees on where someone is.
 *
 * Keyed off the company (not the scan being viewed): a logged-in user always
 * sees THEIR own progress, regardless of which scan result they're looking at.
 */
export interface OnboardingState {
  accountDone: boolean; // logged in (a company exists)
  scanDone: boolean; // the company has a scan profile
  packageDone: boolean; // a paid pakket is chosen (plan is not gratis)
  doneCount: number; // 0..3
}

export function onboardingState(company: Company | null): OnboardingState {
  const accountDone = Boolean(company);
  const scanDone = Boolean(company?.profileJson);
  const packageDone = company ? tierRank(company.plan) > 0 : false;
  const doneCount = [accountDone, scanDone, packageDone].filter(Boolean).length;
  return { accountDone, scanDone, packageDone, doneCount };
}
