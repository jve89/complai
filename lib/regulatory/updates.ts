// Curated changelog of EU AI Act developments — the data behind the
// "keep you current" feed. GUARDRAIL: every entry cites a PRIMARY source
// (Commission / Council / Parliament / OJ), and `productImpact` may only claim
// what ComplAI actually did. Add entries only against a primary source.

import type { CompanySignals } from "@/lib/compliance/signals";

export type UpdateCategory =
  | "deadline"
  | "prohibition"
  | "transparency"
  | "gpai"
  | "literacy"
  | "enforcement";

export interface RegulatoryUpdate {
  id: string;
  date: string; // ISO YYYY-MM-DD — when the change was decided/published
  title: string;
  summary: string; // 1–2 plain-language sentences (NL)
  detail?: string[]; // optional deeper paragraphs, shown on the full feed
  category: UpdateCategory;
  source: { label: string; url: string }; // PRIMARY source (required)
  /** Who this matters to. `everyone` always flags relevant; the others match the
   *  company's CompanySignals. */
  affects: {
    everyone?: boolean;
    highRisk?: boolean;
    prohibited?: boolean;
    limited?: boolean;
    provider?: boolean;
  };
  /** What ComplAI updated because of this change (the "we reacted" story). */
  productImpact?: string;
}

export interface EvaluatedUpdate extends RegulatoryUpdate {
  relevant: boolean;
  reason?: string;
}

export const CATEGORY_LABEL: Record<UpdateCategory, string> = {
  deadline: "Deadline",
  prohibition: "Verbod",
  transparency: "Transparantie",
  gpai: "GPAI",
  literacy: "AI-geletterdheid",
  enforcement: "Handhaving",
};

const REASON = {
  everyone: "Geldt voor elke organisatie die AI gebruikt.",
  prohibited: "Uw scan wees op een mogelijk verboden praktijk.",
  highRisk: "U heeft hoog-risico AI in beeld.",
  limited: "U gebruikt AI met transparantieplichten.",
  provider: "U treedt (mede) op als aanbieder.",
};

export const UPDATES: RegulatoryUpdate[] = [
  {
    id: "digital-omnibus-2026",
    date: "2026-06-29",
    title: "Digital Omnibus: hoog-risicodeadlines verschoven, twee nieuwe verboden",
    summary:
      "De EU heeft de Digital Omnibus aangenomen. De grote hoog-risicoverplichtingen (Annex III) schuiven van 2 augustus 2026 naar 2 december 2027; Annex I naar 2 augustus 2028. Er komen twee nieuwe verboden praktijken (Art. 5) vanaf 2 december 2026.",
    detail: [
      "De Raad van de EU gaf op 29 juni 2026 groen licht, na de instemming van het Europees Parlement (16 juni 2026). Publicatie in het Publicatieblad wordt in juli 2026 verwacht; de wijziging treedt drie dagen na publicatie in werking.",
      "Wat opschuift: de Annex III hoog-risicoverplichtingen van 2 augustus 2026 naar 2 december 2027, en de product-gebonden hoog-risicosystemen (Annex I) van 2 augustus 2027 naar 2 augustus 2028. De transparantieplicht (Art. 50) voor bestaande systemen geldt vanaf 2 december 2026.",
      "Wat erbij komt: twee nieuwe verboden praktijken vanaf 2 december 2026 — het genereren van niet-consensueel intiem beeldmateriaal en van materiaal van seksueel kindermisbruik. De data van 2 februari 2025 (verboden praktijken + AI-geletterdheid) en 2 augustus 2025 (GPAI) blijven ongewijzigd.",
    ],
    category: "deadline",
    source: {
      label: "Raad van de EU — persbericht, 29 juni 2026",
      url: "https://www.consilium.europa.eu/en/press/press-releases/2026/06/29/artificial-intelligence-council-gives-final-green-light-to-simplify-and-streamline-rules/",
    },
    affects: { everyone: true },
    productImpact: "E-learning, tijdlijn en scan-deadlines bijgewerkt naar de nieuwe data.",
  },
  {
    id: "gpai-governance-2025",
    date: "2025-08-02",
    title: "GPAI-modellen, bestuur en boetes van kracht",
    summary:
      "Sinds 2 augustus 2025 gelden de verplichtingen voor aanbieders van AI-modellen voor algemene doeleinden (GPAI), plus het bestuurlijke kader (toezichthouders) en de boetesystematiek.",
    category: "gpai",
    source: {
      label: "EU AI Act — Art. 113 (toepassingsdata)",
      url: "https://artificialintelligenceact.eu/implementation-timeline/",
    },
    affects: { provider: true },
  },
  {
    id: "prohibited-practices-2025",
    date: "2025-02-02",
    title: "Verboden praktijken (Art. 5) van kracht",
    summary:
      "Sinds 2 februari 2025 zijn de verboden AI-praktijken uit artikel 5 niet meer toegestaan — waaronder social scoring en emotieherkenning op de werkvloer. Op overtreding staat de zwaarste boete (tot € 35 miljoen of 7% van de wereldwijde jaaromzet).",
    category: "prohibition",
    source: {
      label: "EU AI Act — Art. 5",
      url: "https://artificialintelligenceact.eu/article/5/",
    },
    affects: { everyone: true },
  },
  {
    id: "ai-literacy-2025",
    date: "2025-02-02",
    title: "AI-geletterdheid (Art. 4) verplicht",
    summary:
      "Sinds 2 februari 2025 moeten organisaties zorgen voor voldoende AI-geletterdheid bij medewerkers die met AI werken. De e-learning van ComplAI dekt deze verplichting af, inclusief certificaten.",
    category: "literacy",
    source: {
      label: "EU AI Act — Art. 4",
      url: "https://artificialintelligenceact.eu/article/4/",
    },
    affects: { everyone: true },
    productImpact: "E-learning met certificaten beschikbaar in het platform.",
  },
];

function evaluate(u: RegulatoryUpdate, sig: CompanySignals): EvaluatedUpdate {
  const a = u.affects;
  let reason: string | undefined;
  if (a.everyone) reason = REASON.everyone;
  else if (a.prohibited && sig.hasProhibited) reason = REASON.prohibited;
  else if (a.highRisk && sig.hasHighRisk) reason = REASON.highRisk;
  else if (a.limited && sig.hasLimited) reason = REASON.limited;
  else if (a.provider && sig.isProvider) reason = REASON.provider;
  return { ...u, relevant: Boolean(reason), reason };
}

/** All updates, newest first, each evaluated for relevance to this company. */
export function evaluateUpdates(sig: CompanySignals): EvaluatedUpdate[] {
  return [...UPDATES]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((u) => evaluate(u, sig));
}

/** Whole days between an ISO date and `now` (for recency / "Nieuw"). */
export function daysSince(iso: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(iso + "T00:00:00Z").getTime()) / 86_400_000);
}
