// Log-retention record (Art 26(6)) — Dutch labels + the ≥ 6-month status logic.
// Pure (no DB), shared by the page, the dialog and the evidence PDF.
//
// GUARDRAIL — this evidences the DEPLOYER's Art 26(6) retention POLICY. It does
// NOT store or generate logs (that is the system's Art 12 capability, built by
// the PROVIDER) and does NOT discharge the provider's Art 12/19 duties. The duty
// only bites "to the extent such logs are under the deployer's control" — for
// hosted/SaaS systems the logs often sit with the provider, so the deployer's
// obligation may be partial or nil. Verbatim basis: Art 26(6),
// docs/regulatory/ai-act-full-text.md lines 3915–3918.

/** Art 26(6) floor: logs kept "for a period appropriate to the intended purpose
 *  … of at least six months". */
export const MIN_RETENTION_MONTHS = 6;

/** The three states a high-risk system's log-retention record can be in. */
export const LOG_STATUSES = ["missing", "under_min", "ok"] as const;
export type LogStatus = (typeof LOG_STATUSES)[number];

export const LOG_STATUS_LABEL: Record<LogStatus, string> = {
  missing: "Niet vastgelegd",
  under_min: "Onder 6 maanden",
  ok: "Vastgelegd",
};

export const LOG_STATUS_BADGE: Record<LogStatus, "danger" | "warning" | "success"> = {
  missing: "danger",
  under_min: "warning",
  ok: "success",
};

/** Minimal shape needed to derive the status. */
export interface LogRetentionFacts {
  logLocation: string | null;
  logRetentionMonths: number | null;
}

export function isDocumented(s: LogRetentionFacts): boolean {
  return Boolean(s.logLocation && s.logLocation.trim());
}

/** Derive the record status. A record needs at least a documented location; the
 *  ≥ 6-month floor is a warning, not a blocker (Union/national law can displace
 *  it, and "under their control" can make the floor moot). */
export function logStatus(s: LogRetentionFacts): LogStatus {
  if (!isDocumented(s)) return "missing";
  if (s.logRetentionMonths != null && s.logRetentionMonths < MIN_RETENTION_MONTHS)
    return "under_min";
  return "ok";
}

/** Application date + honesty caveat. Art 26(6) is an Annex III high-risk
 *  deployer duty, deferred to 2 Dec 2027 by the Digital Omnibus. */
export const APPLIES_FROM = "2 december 2027";

export const APPLIES_FROM_NOTE =
  `Art. 26 lid 6 verplicht gebruiksverantwoordelijken van hoog-risico AI-systemen om de automatisch gegenereerde logs te bewaren — voor een passende periode van ten minste zes maanden — voor zover die logs onder hun controle staan. Deze verplichting geldt vanaf ${APPLIES_FROM} (uitgestelde datum onder de Digital Omnibus — onder voorbehoud, wetgeving kan nog wijzigen).`;

/** The "under their control" honesty note — surfaced so we never assert a blanket
 *  duty. For hosted/SaaS systems the logs may sit with the leverancier. */
export const UNDER_CONTROL_NOTE =
  "Let op: de plicht geldt alleen “voor zover de logs onder uw controle staan”. Bij gehoste of SaaS-systemen bewaart de leverancier (aanbieder) de logs vaak zelf (Art. 12/19) — leg dan vast wat u wél beheert en verwijs voor de rest naar de leverancier.";

/** Financial-institution carve-out (Art 26(6), 2nd sub-paragraph). */
export const FINANCIAL_NOTE =
  "Financiële instellingen bewaren deze logs als onderdeel van de documentatie die zij op grond van het Unierecht voor financiële diensten al aanhouden (Art. 26 lid 6).";
