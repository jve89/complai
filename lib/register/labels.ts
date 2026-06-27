import type { RiskLevel, AiRole } from "@prisma/client";

export const RISK_LEVELS: RiskLevel[] = [
  "minimal",
  "limited",
  "high",
  "unacceptable",
];

export const RISK_LABEL: Record<RiskLevel, string> = {
  minimal: "Minimaal risico",
  limited: "Beperkt risico",
  high: "Hoog risico",
  unacceptable: "Onaanvaardbaar",
};

export const RISK_BADGE: Record<
  RiskLevel,
  "success" | "info" | "warning" | "danger"
> = {
  minimal: "success",
  limited: "info",
  high: "warning",
  unacceptable: "danger",
};

export const ROLES: AiRole[] = ["provider", "deployer"];

export const ROLE_LABEL: Record<AiRole, string> = {
  provider: "Aanbieder",
  deployer: "Gebruiksverantwoordelijke",
};

export const STATUSES = ["active", "review", "retired"] as const;
export type SystemStatus = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<string, string> = {
  active: "Actief",
  review: "In beoordeling",
  retired: "Uitgefaseerd",
};

export const STATUS_BADGE: Record<string, "success" | "warning" | "secondary"> =
  {
    active: "success",
    review: "warning",
    retired: "secondary",
  };
