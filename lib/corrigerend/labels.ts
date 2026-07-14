// Corrective-action log (Art 20) — Dutch labels + status logic. Pure (no DB),
// shared by the page, the dialog and the evidence PDF.
//
// GUARDRAIL — Art 20 is a PROVIDER duty: take corrective action (bring into
// conformity / withdraw / disable / recall) when a high-risk system it placed on
// the market is not in conformity, and inform the supply chain; if the system
// presents an Art 79(1) risk, also inform the market surveillance authority +
// notified body (Art 20(2)). Most Dutch SMEs are deployers, so this is provider-
// scoped. Distinct from — but linkable to — a serious-incident report (Art 73).
// Verbatim basis: docs/regulatory/ai-act-full-text.md — Art 20 lines 3684–3694.

export const ACTION_TYPES = ["bring_into_conformity", "withdraw", "disable", "recall"] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

export const ACTION_LABEL: Record<ActionType, string> = {
  bring_into_conformity: "In conformiteit brengen",
  withdraw: "Uit de handel nemen",
  disable: "Buiten werking stellen",
  recall: "Terugroepen",
};

export const CORRECTIVE_STATUSES = ["open", "in_progress", "done"] as const;
export type CorrectiveStatus = (typeof CORRECTIVE_STATUSES)[number];

export const STATUS_LABEL: Record<CorrectiveStatus, string> = {
  open: "Open",
  in_progress: "In behandeling",
  done: "Afgehandeld",
};

export const STATUS_BADGE: Record<CorrectiveStatus, "warning" | "info" | "success"> = {
  open: "warning",
  in_progress: "info",
  done: "success",
};

// ── Framing notes (honesty guardrails) ───────────────────────────────────────

export const APPLIES_FROM = "2 december 2027";

export const PROVIDER_NOTE =
  "Corrigerende maatregelen (Art. 20) zijn een verplichting voor de aanbieder (maker): stelt u vast dat een door u op de markt gebracht hoog-risico systeem niet conform is, dan brengt u het onmiddellijk in conformiteit, of neemt u het uit de handel, stelt u het buiten werking of roept u het terug — en informeert u distributeurs en, waar van toepassing, gebruiksverantwoordelijken, gemachtigde en importeurs. Bent u uitsluitend gebruiksverantwoordelijke, dan geldt in plaats hiervan Art. 26 lid 5 (opschorten en informeren).";

export const RISK_NOTE =
  "Levert het systeem een risico op voor de gezondheid, veiligheid of grondrechten (Art. 79 lid 1), dan onderzoekt u onmiddellijk de oorzaak en informeert u óók de markttoezichthouder en, indien van toepassing, de aangemelde instantie (Art. 20 lid 2).";

export const INCIDENT_LINK_NOTE =
  "Let op: dit is de non-conformiteit-route (Art. 20). Een ernstig incident meldt u daarnaast via Meldingen (Art. 73); na zo'n melding volgt vaak een corrigerende maatregel (Art. 73 lid 6). Beide registers vullen elkaar aan.";

export const APPLIES_FROM_NOTE =
  `Deze aanbieder-verplichting voor Annex III hoog-risico systemen geldt vanaf ${APPLIES_FROM} (uitgestelde datum onder de Digital Omnibus — onder voorbehoud; wetgeving kan nog wijzigen).`;
