// Serious-incident register — Dutch labels + the Art 73 reporting-deadline logic.
// Pure (no DB), so it's shared by the page, the dialog and the PDF report.
// GUARDRAIL: every deadline traces to a verbatim Art 73 sub-paragraph. The
// numeric caps are ceilings; reporting must be "immediately … and in any event
// not later than" — never present the number without that framing.

/** Art 3(49) serious-incident categories (a–d). The category + the death /
 *  widespread flags drive the reporting deadline. */
export const INCIDENT_CATEGORIES = [
  "health",
  "critical_infra",
  "fundamental_rights",
  "property_env",
] as const;
export type IncidentCategory = (typeof INCIDENT_CATEGORIES)[number];

export const CATEGORY_LABEL: Record<IncidentCategory, string> = {
  health: "Overlijden of ernstige gezondheidsschade",
  critical_infra: "Ernstige, onomkeerbare verstoring van kritieke infrastructuur",
  fundamental_rights: "Inbreuk op grondrechten-verplichtingen (Unierecht)",
  property_env: "Ernstige schade aan eigendom of milieu",
};

/** Which Art 3(49) sub-point each category is. */
export const CATEGORY_ARTICLE: Record<IncidentCategory, string> = {
  health: "Art. 3(49)(a)",
  critical_infra: "Art. 3(49)(b)",
  fundamental_rights: "Art. 3(49)(c)",
  property_env: "Art. 3(49)(d)",
};

export const INCIDENT_STATUSES = ["open", "reported", "closed"] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const STATUS_LABEL: Record<IncidentStatus, string> = {
  open: "Te melden",
  reported: "Gemeld",
  closed: "Afgehandeld",
};

export const STATUS_BADGE: Record<IncidentStatus, "danger" | "info" | "success"> = {
  open: "danger",
  reported: "info",
  closed: "success",
};

/** Minimal shape needed to compute the reporting deadline. */
export interface DeadlineFacts {
  category: string;
  involvesDeath: boolean;
  widespread: boolean;
}

/** The Art 73 reporting cap in days, counted from the date the provider/deployer
 *  BECOMES AWARE of the serious incident (awareAt). The 2-day cap is checked first
 *  because it is the most urgent — where several triggers apply, the earliest cap
 *  binds. Each is "immediately … and in any event not later than N days". */
export function reportDeadlineDays(i: DeadlineFacts): { days: number; basis: string } {
  if (i.widespread || i.category === "critical_infra")
    return { days: 2, basis: "Art. 73(3)" }; // widespread infringement OR Art 3(49)(b)
  if (i.involvesDeath) return { days: 10, basis: "Art. 73(4)" }; // death of a person
  return { days: 15, basis: "Art. 73(2)" }; // default serious incident
}

/** Absolute reporting deadline = awareAt + the Art 73 cap. */
export function reportDeadline(awareAt: Date, i: DeadlineFacts): Date {
  const d = new Date(awareAt);
  d.setDate(d.getDate() + reportDeadlineDays(i).days);
  return d;
}

/** Whole days from `now` until the deadline (negative once overdue). */
export function daysUntil(deadline: Date, now: Date = new Date()): number {
  return Math.ceil((deadline.getTime() - now.getTime()) / 86_400_000);
}

/** The mandatory "immediately" framing that must accompany every numeric cap. */
export const IMMEDIATE_NOTE =
  "Meld onmiddellijk zodra u een oorzakelijk verband (of de redelijke waarschijnlijkheid daarvan) vaststelt — de termijn hieronder is de uiterste grens, geen streefdatum (Art. 73(2)).";

/** Post-report duties once a serious incident is reported (Art 73(6)). */
export const POST_REPORT_DUTIES = [
  "Onderzoek onverwijld het incident en het betrokken AI-systeem (Art. 73(6)).",
  "Voer een risicobeoordeling van het incident uit en tref corrigerende maatregelen (Art. 73(6)).",
  "Werk samen met de toezichthouder; wijzig het systeem niet op een manier die het oorzaakonderzoek kan beïnvloeden vóórdat u de toezichthouder informeert (Art. 73(6)).",
];
