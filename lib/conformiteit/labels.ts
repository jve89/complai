// Conformity-assessment tracker (Art 43 + Annex VI/VII) — Dutch labels, the fixed
// checklist steps, and the status logic. Pure (no DB), shared by the page, the
// dialog and the evidence PDF.
//
// GUARDRAIL — this is a PROVIDER duty (Art 43), done before a high-risk system is
// placed on the market. Most Dutch SMEs are deployers and never run a conformity
// assessment, so the module is provider-scoped and says so. Every step cites a
// specific article/Annex point. Route: Annex VI (internal control) for Annex III
// points 2–8; Annex VII (notified body) only for point 1 biometrics under Art 43(1).
// Verbatim basis: docs/regulatory/ai-act-full-text.md — Art 43 (4449–4517),
// Art 47 (4614–4639), Art 48 (4641–4660), Art 49 (4662–4696).

/** The fixed, ordered conformity checklist. Each step cites its article/Annex. */
export const CONFORMITY_STEPS = [
  { key: "techdoc", label: "Technische documentatie compleet (Art. 11 / Annex IV)" },
  { key: "qms", label: "Kwaliteitsmanagementsysteem operationeel (Art. 17)" },
  { key: "assessment", label: "Conformiteitsbeoordeling uitgevoerd (Art. 43)" },
  { key: "declaration", label: "EU-conformiteitsverklaring opgesteld (Art. 47)" },
  { key: "ce", label: "CE-markering aangebracht (Art. 48)" },
  { key: "registration", label: "Registratie in EU-databank (Art. 49)" },
] as const;

export type StepKey = (typeof CONFORMITY_STEPS)[number]["key"];
export const STEP_KEYS = CONFORMITY_STEPS.map((s) => s.key) as StepKey[];

export const STEP_STATUSES = ["todo", "in_progress", "done"] as const;
export type StepStatus = (typeof STEP_STATUSES)[number];

export const STATUS_LABEL: Record<StepStatus, string> = {
  todo: "Te doen",
  in_progress: "Mee bezig",
  done: "Afgerond",
};

export const STATUS_BADGE: Record<StepStatus, "secondary" | "info" | "success"> = {
  todo: "secondary",
  in_progress: "info",
  done: "success",
};

/** The two conformity-assessment routes (Art 43). */
export const CONFORMITY_ROUTES = ["internal", "notified_body"] as const;
export type ConformityRoute = (typeof CONFORMITY_ROUTES)[number];

export const ROUTE_LABEL: Record<ConformityRoute, string> = {
  internal: "Interne controle (Annex VI)",
  notified_body: "Aangemelde instantie (Annex VII)",
};

/** A steps map as stored in the DB (stepKey → status); missing = "todo". */
export type StepsMap = Partial<Record<StepKey, StepStatus>>;

export function stepStatus(steps: StepsMap | null | undefined, key: StepKey): StepStatus {
  const v = steps?.[key];
  return v && (STEP_STATUSES as readonly string[]).includes(v) ? v : "todo";
}

/** How many of the fixed steps are done, out of the total. */
export function conformityProgress(steps: StepsMap | null | undefined): {
  done: number;
  total: number;
} {
  const done = STEP_KEYS.filter((k) => stepStatus(steps, k) === "done").length;
  return { done, total: STEP_KEYS.length };
}

// ── Framing notes (honesty guardrails) ───────────────────────────────────────

export const APPLIES_FROM = "2 december 2027";

export const PROVIDER_NOTE =
  "De conformiteitsbeoordeling (Art. 43) is een verplichting voor de aanbieder (maker) van een hoog-risico systeem, vóór markttoelating. Bent u uitsluitend gebruiksverantwoordelijke, dan voert u deze beoordeling niet uit — dan geldt dit spoor niet voor u.";

export const ROUTE_NOTE =
  "Voor Annex III-systemen (punten 2–8) verloopt de beoordeling via interne controle (Annex VI), zónder aangemelde instantie. Alleen voor biometrie (Annex III punt 1) kan een aangemelde instantie (Annex VII) nodig of verplicht zijn (Art. 43 lid 1). Bij een substantiële wijziging beoordeelt u opnieuw (Art. 43 lid 4).";

export const REGISTRATION_NOTE =
  "Registratie in de EU-databank (Art. 49) geldt niet voor Annex III punt 2 (kritieke infrastructuur); de EU-databank is mogelijk nog niet volledig operationeel — controleer de actuele status voordat u dit als afgerond markeert.";

export const APPLIES_FROM_NOTE =
  `Deze aanbieder-verplichtingen voor Annex III hoog-risico systemen gelden vanaf ${APPLIES_FROM} (uitgestelde datum onder de Digital Omnibus — onder voorbehoud; wetgeving kan nog wijzigen).`;
