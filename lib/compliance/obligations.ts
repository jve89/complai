// Catalogue mapping obligation CODES (emitted by the engine) to full obligation
// items: article, Dutch title/description, evidence kind, and applicability date.
// The engine decides WHICH codes apply; this file describes each one.

import { APPLICATION_DATES, type ApplicationDateKey } from "@/lib/compliance/timeline";
import type { EvidenceKind, ObligationItem } from "@/lib/compliance/types";

export interface CatalogEntry {
  article: string;
  title: string;
  description: string;
  evidenceKind?: EvidenceKind;
  /** Default for `required`; the engine can override (e.g. advisory items). */
  required: boolean;
  deadlineKey?: ApplicationDateKey;
  /** Document slug this obligation is satisfied by (if evidenceKind === "document"). */
  docSlug?: string;
  /** Training path slug (if evidenceKind === "training"). */
  trainingPath?: string;
}

export const OBLIGATION_CATALOG: Record<string, CatalogEntry> = {
  ART_4_LITERACY: {
    article: "Art. 4",
    title: "AI-geletterdheid borgen",
    description:
      "Zorg dat personeel dat met AI werkt voldoende kennis en vaardigheden heeft. Geldt voor aanbieders én gebruiksverantwoordelijken.",
    evidenceKind: "training",
    trainingPath: "employee",
    required: true,
    deadlineKey: "aiLiteracy",
  },
  ART_5_PROHIBITED: {
    article: "Art. 5",
    title: "Verboden AI-praktijk — direct stoppen",
    description:
      "Het systeem lijkt onder een verboden praktijk te vallen. Staak het gebruik en laat dit met spoed juridisch toetsen.",
    evidenceKind: "process",
    required: true,
    deadlineKey: "prohibitions",
  },
  ART_50_CHATBOT: {
    article: "Art. 50(1)",
    title: "Transparantie: interactie met AI",
    description:
      "Mensen moeten weten dat ze met een AI-systeem communiceren. Dit is primair een aanbiederplicht; als gebruiksverantwoordelijke: controleer dat de leverancier dit heeft geregeld.",
    evidenceKind: "document",
    docSlug: "transparency",
    required: true,
    deadlineKey: "transparency",
  },
  ART_50_SYNTHETIC: {
    article: "Art. 50(2)",
    title: "Transparantie: AI-gegenereerde content markeren",
    description:
      "Synthetische audio/beeld/video/tekst moet machineleesbaar gemarkeerd zijn als kunstmatig gegenereerd. Primair een aanbiederplicht.",
    evidenceKind: "document",
    docSlug: "transparency",
    required: true,
    deadlineKey: "transparency",
  },
  ART_50_EMOTION_BIO: {
    article: "Art. 50(3)",
    title: "Transparantie: emotieherkenning / biometrische categorisering",
    description:
      "Informeer betrokkenen wanneer zij worden blootgesteld aan emotieherkenning of biometrische categorisering.",
    evidenceKind: "document",
    docSlug: "transparency",
    required: true,
    deadlineKey: "transparency",
  },
  ART_50_DEEPFAKE: {
    article: "Art. 50(4)",
    title: "Transparantie: deepfakes labelen",
    description:
      "Maak bekend dat beeld/audio/video kunstmatig is gegenereerd of gemanipuleerd (met beperkte uitzondering voor kunst/satire).",
    evidenceKind: "document",
    docSlug: "transparency",
    required: true,
    deadlineKey: "transparency",
  },
  ART_50_PUBLIC_TEXT: {
    article: "Art. 50(4)",
    title: "Transparantie: AI-tekst over algemeen belang",
    description:
      "Maak bekend dat tekst AI-gegenereerd is — tenzij deze onder menselijke redactionele verantwoordelijkheid is gecontroleerd.",
    evidenceKind: "document",
    docSlug: "transparency",
    required: true,
    deadlineKey: "transparency",
  },
  ART_27_FRIA: {
    article: "Art. 27",
    title: "Grondrechtentoets (FRIA) uitvoeren",
    description:
      "Voer een Fundamental Rights Impact Assessment uit vóór ingebruikname van het hoog-risico systeem.",
    evidenceKind: "document",
    docSlug: "fria",
    required: true,
    deadlineKey: "highRiskAnnexIII",
  },
  ART_26_DEPLOYER: {
    article: "Art. 26",
    title: "Verplichtingen gebruiksverantwoordelijke (hoog risico)",
    description:
      "Borg menselijk toezicht, gebruik volgens instructies, bewaar logs (≥6 maanden) en informeer betrokken werknemers.",
    evidenceKind: "document",
    docSlug: "risk_assessment",
    required: true,
    deadlineKey: "highRiskAnnexIII",
  },
  ART_16_PROVIDER: {
    article: "Art. 16",
    title: "Verplichtingen aanbieder (hoog risico)",
    description:
      "Risicomanagementsysteem, datakwaliteit, technische documentatie, logging, menselijk toezicht, nauwkeurigheid en robuustheid.",
    evidenceKind: "document",
    docSlug: "risk_assessment",
    required: true,
    deadlineKey: "highRiskAnnexIII",
  },
  ART_11_TECHDOC: {
    article: "Art. 11 / Annex IV",
    title: "Technische documentatie opstellen",
    description:
      "Stel het technisch dossier (Annex IV) op en houd het actueel.",
    evidenceKind: "document",
    docSlug: "tech_doc",
    required: true,
    deadlineKey: "highRiskAnnexIII",
  },
  ART_43_CONFORMITY: {
    article: "Art. 43",
    title: "Conformiteitsbeoordeling",
    description:
      "Doorloop de toepasselijke conformiteitsbeoordelingsprocedure vóór marktintroductie.",
    evidenceKind: "process",
    required: true,
    deadlineKey: "highRiskAnnexIII",
  },
  ART_47_DOC: {
    article: "Art. 47",
    title: "EU-conformiteitsverklaring & CE-markering",
    description: "Stel de EU-conformiteitsverklaring op en breng de CE-markering aan.",
    evidenceKind: "document",
    docSlug: "doc_conformity",
    required: true,
    deadlineKey: "highRiskAnnexIII",
  },
  ART_49_REGISTRATION: {
    article: "Art. 49",
    title: "Registratie in de EU-databank",
    description:
      "Registreer het hoog-risico systeem in de EU-databank (aanbiederplicht).",
    evidenceKind: "process",
    required: true,
    deadlineKey: "highRiskAnnexIII",
  },
  ART_6_4_ASSESSMENT: {
    article: "Art. 6(4) / 49(2)",
    title: "Documenteer de niet-hoog-risico beoordeling",
    description:
      "U beroept zich op de uitzondering van Art. 6(3). Leg deze beoordeling vast; de aanbieder registreert het systeem (Art. 49(2)).",
    evidenceKind: "document",
    docSlug: "assessment_record",
    required: true,
    deadlineKey: "highRiskAnnexIII",
  },
  ART_25_HANDOVER: {
    article: "Art. 25",
    title: "Overdracht van aanbiedersverplichtingen",
    description:
      "Door uw wijziging/herlabeling neemt u aanbiedersverplichtingen over; leg de afspraken met de oorspronkelijke aanbieder vast.",
    evidenceKind: "document",
    docSlug: "risk_assessment",
    required: true,
  },
  ART_22_AUTHREP: {
    article: "Art. 22",
    title: "Gemachtigde voor hoog-risico aanbieder",
    description: "Leg het mandaat van de gemachtigde vast (hoog-risico systeem).",
    evidenceKind: "document",
    docSlug: "risk_assessment",
    required: true,
  },
  ART_54_AUTHREP: {
    article: "Art. 54",
    title: "Gemachtigde voor GPAI-modelaanbieder",
    description: "Leg het mandaat van de gemachtigde vast (GPAI-model).",
    evidenceKind: "document",
    docSlug: "risk_assessment",
    required: true,
  },
  GPAI_PROVIDER: {
    article: "Art. 53",
    title: "Verplichtingen GPAI-modelaanbieder",
    description:
      "Technische documentatie (Annex XI/XII), auteursrechtbeleid en een samenvatting van trainingsdata.",
    evidenceKind: "document",
    docSlug: "gpai_docs",
    required: true,
    deadlineKey: "gpai",
  },
  GPAI_SYSTEMIC: {
    article: "Art. 55",
    title: "GPAI met systeemrisico",
    description:
      "Modelevaluaties, beperking van systeemrisico's, incidentmelding en cyberbeveiliging.",
    evidenceKind: "process",
    required: true,
    deadlineKey: "gpai",
  },
  GPAI_NOTIFY_COMMISSION: {
    article: "Art. 52",
    title: "Melding aan de Commissie (systeemrisico)",
    description:
      "Meld binnen 2 weken bij de Europese Commissie zodra de drempel voor systeemrisico is bereikt.",
    evidenceKind: "process",
    required: true,
    deadlineKey: "gpai",
  },
};

/** Build a fresh ObligationItem from a code; status defaults to "open". */
export function makeObligation(
  code: string,
  overrides?: Partial<ObligationItem>
): ObligationItem | null {
  const entry = OBLIGATION_CATALOG[code];
  if (!entry) return null;
  return {
    code,
    article: entry.article,
    title: entry.title,
    description: entry.description,
    status: "open",
    required: entry.required,
    evidenceKind: entry.evidenceKind,
    deadline: entry.deadlineKey ? APPLICATION_DATES[entry.deadlineKey] : undefined,
    ...overrides,
  };
}
