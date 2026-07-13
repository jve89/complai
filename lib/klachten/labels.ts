// Complaint register — Dutch labels + the legal framing. Pure (no DB), shared by
// the page, the dialog and the evidence PDF.
//
// GUARDRAIL — do NOT present a complaint register as a universal legal duty.
//   • Art 85 (lines 6294–6300) is a RIGHT of any natural/legal person to lodge a
//     complaint with the market surveillance authority — NOT a deployer duty.
//     External channel. Applies from 2 Aug 2026 (enforcement framework, not
//     deferred).
//   • Art 27(1)(f) (lines 4002–4003) requires DESCRIBING an internal complaint
//     mechanism, but only inside a FRIA — and a FRIA is required only for a NARROW
//     set of deployers (public bodies, private providers of public services, and
//     deployers of Annex III 5(b) credit-scoring / 5(c) life-&-health insurance).
//     Applies from 2 Dec 2027. Most Dutch SMEs need NO FRIA.
// For everyone else a complaint register is good governance, not a legal
// obligation. Source: docs/regulatory/ai-act-full-text.md.

export const COMPLAINT_STATUSES = ["open", "in_progress", "resolved", "escalated"] as const;
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export const STATUS_LABEL: Record<ComplaintStatus, string> = {
  open: "Open",
  in_progress: "In behandeling",
  resolved: "Afgehandeld",
  escalated: "Doorverwezen (Art. 85)",
};

export const STATUS_BADGE: Record<ComplaintStatus, "warning" | "info" | "success" | "secondary"> = {
  open: "warning",
  in_progress: "info",
  resolved: "success",
  escalated: "secondary",
};

/** How the complaint came in. Free-form in the DB; these are the suggested
 *  options offered in the dialog. */
export const COMPLAINT_CHANNELS = ["email", "letter", "phone", "form", "in_person", "other"] as const;
export type ComplaintChannel = (typeof COMPLAINT_CHANNELS)[number];

export const CHANNEL_LABEL: Record<ComplaintChannel, string> = {
  email: "E-mail",
  letter: "Brief",
  phone: "Telefoon",
  form: "Webformulier",
  in_person: "Mondeling",
  other: "Anders",
};

/** Application dates (each carries the standard caveat). */
export const ART_85_APPLIES = "2 augustus 2026";
export const FRIA_APPLIES = "2 december 2027";

/** Art 85 — the external complaint right (any person → market surveillance authority). */
export const ART_85_NOTE =
  `Art. 85 geeft iedere natuurlijke of rechtspersoon met gegronde redenen het recht om vanaf ${ART_85_APPLIES} een klacht over een (vermeende) inbreuk op de AI-verordening in te dienen bij de markttoezichthouder. Dit externe recht staat los van uw eigen klachtafhandeling.`;

/** Art 27(1)(f) — the internal mechanism is only required inside a FRIA, and a
 *  FRIA is required only for a narrow set of deployers. The honesty note. */
export const SCOPE_NOTE =
  `Een intern klachtenmechanisme hoeft u alleen te beschrijven in een grondrechtentoets (FRIA, Art. 27 lid 1(f)). Een FRIA is alleen verplicht voor overheidsorganen, private aanbieders van publieke diensten en gebruiksverantwoordelijken van kredietscoring (Annex III 5b) of levens-/ziektekostenverzekering (Annex III 5c) — vanaf ${FRIA_APPLIES}. Voor de meeste organisaties is een klachtenregister goed bestuur, geen wettelijke plicht (onder voorbehoud — wetgeving kan nog wijzigen).`;
