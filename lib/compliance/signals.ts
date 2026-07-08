import type { ComplianceProfile } from "@/lib/compliance/types";

/** Coarse relevance signals about a company, derived from its scan profile and
 *  the risk levels of its registered AI systems. Shared by the e-learning module
 *  relevance markers and the regulatory-updates feed so both stay consistent. */
export interface CompanySignals {
  hasProhibited: boolean;
  hasHighRisk: boolean;
  hasLimited: boolean;
  isProvider: boolean;
}

export function companySignals(
  profile: ComplianceProfile | null,
  systemRiskLevels: string[] = []
): CompanySignals {
  const tiers = new Set<string>(profile?.riskTiers ?? []);
  const roles = new Set<string>(profile?.entityRoles ?? []);
  const risks = new Set<string>(systemRiskLevels);
  return {
    hasProhibited:
      profile?.headline === "prohibited" || tiers.has("prohibited") || risks.has("unacceptable"),
    hasHighRisk:
      profile?.headline === "high_risk" ||
      tiers.has("high") ||
      tiers.has("high_notify") ||
      risks.has("high"),
    hasLimited:
      profile?.headline === "limited_risk" || tiers.has("limited") || risks.has("limited"),
    isProvider: roles.has("provider"),
  };
}
