// Notification & explanation register — Dutch labels + the legal framing for the
// three high-risk DEPLOYER information duties. Pure (no DB), so it's shared by the
// page, the dialog and the PDF builder.
//
// GUARDRAIL: every notice type cites a specific article. These are Annex III
// high-risk DEPLOYER duties; they apply from 2 Dec 2027 (Digital Omnibus deferral
// — re-verify against the published OJ). Never present them as duties that bite
// today, and never imply they apply to organisations without a high-risk system.
// Verbatim basis: docs/regulatory/ai-act-full-text.md — Art 26(7) lines 3924–3927,
// Art 26(11) lines 3972–3975, Art 86 lines 6302–6315.

export const NOTICE_TYPES = ["worker", "affected", "explanation"] as const;
export type NoticeType = (typeof NOTICE_TYPES)[number];

/** Full label (used in the dialog + PDF title). */
export const NOTICE_TYPE_LABEL: Record<NoticeType, string> = {
  worker: "Kennisgeving aan werknemers (Art. 26 lid 7)",
  affected: "Kennisgeving aan betrokken personen (Art. 26 lid 11)",
  explanation: "Uitleg bij een AI-ondersteund besluit (Art. 86)",
};

/** Short label (used in the register table). */
export const NOTICE_TYPE_SHORT: Record<NoticeType, string> = {
  worker: "Werknemers",
  affected: "Betrokken personen",
  explanation: "Uitleg bij besluit",
};

/** The article each type is grounded in. */
export const NOTICE_TYPE_ARTICLE: Record<NoticeType, string> = {
  worker: "Art. 26 lid 7",
  affected: "Art. 26 lid 11",
  explanation: "Art. 86",
};

/** One-line, plain-Dutch statement of who must do what. */
export const NOTICE_TYPE_DESC: Record<NoticeType, string> = {
  worker:
    "Informeer de ondernemingsraad/personeelsvertegenwoordiging én de betrokken werknemers vóórdat u een hoog-risico AI-systeem op de werkvloer in gebruik neemt.",
  affected:
    "Informeer natuurlijke personen dat een hoog-risico Annex III-systeem beslissingen over hen neemt of daarbij helpt.",
  explanation:
    "Geef een betrokkene, op verzoek, een heldere en betekenisvolle uitleg over de rol van het AI-systeem en de hoofdelementen van het besluit.",
};

export const NOTICE_STATUSES = ["draft", "issued"] as const;
export type NoticeStatus = (typeof NOTICE_STATUSES)[number];

export const STATUS_LABEL: Record<NoticeStatus, string> = {
  draft: "Concept",
  issued: "Verstrekt",
};

export const STATUS_BADGE: Record<NoticeStatus, "secondary" | "success"> = {
  draft: "secondary",
  issued: "success",
};

/** How the notice was/will be provided. Free-form in the DB; these are the
 *  suggested options offered in the dialog. */
export const NOTICE_METHODS = ["email", "letter", "intranet", "meeting", "other"] as const;
export type NoticeMethod = (typeof NOTICE_METHODS)[number];

export const METHOD_LABEL: Record<NoticeMethod, string> = {
  email: "E-mail",
  letter: "Brief",
  intranet: "Intranet / prikbord",
  meeting: "Mondeling / gesprek",
  other: "Anders",
};

/** Application date + honesty caveat. These Annex III high-risk deployer duties
 *  were deferred to 2 Dec 2027 by the Digital Omnibus; that date is not yet
 *  confirmed in the published OJ, so it carries the standard caveat. */
export const APPLIES_FROM = "2 december 2027";

export const APPLIES_FROM_NOTE =
  `Deze verplichtingen gelden voor gebruiksverantwoordelijken (deployers) van hoog-risico Annex III-systemen en zijn van toepassing vanaf ${APPLIES_FROM} (uitgestelde datum onder de Digital Omnibus — onder voorbehoud, wetgeving kan nog wijzigen). Heeft u geen hoog-risico systeem, dan gelden ze (nog) niet. Leg nu alvast vast wie u informeert, zodat u voorbereid bent.`;

/** Right-to-explanation scope note (Art 86(1) threshold + Art 86(3) carve-out),
 *  faithful to the verbatim text — surfaced so we never over-state the right. */
export const EXPLANATION_SCOPE_NOTE =
  "Art. 86 geldt bij een besluit dat de gebruiksverantwoordelijke neemt op basis van de output van een hoog-risico Annex III-systeem (m.u.v. Annex III punt 2) en dat rechtsgevolgen heeft of iemand op vergelijkbare wijze aanzienlijk raakt. Het recht geldt alleen voor zover het niet al elders in het Unierecht is geregeld (bv. art. 22 AVG).";
