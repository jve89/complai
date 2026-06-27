import type { ScanAnswers } from "@/lib/scan/questions";

export type ArticleStatus = "compliant" | "in_progress" | "open";

export interface ArticleResult {
  article: string;
  title: string;
  status: ArticleStatus;
  summary: string;
}

export interface PriorityAction {
  article: string;
  title: string;
  description: string;
}

export interface ScanReport {
  score: number;
  level: "laag" | "gemiddeld" | "hoog";
  summary: string;
  articles: ArticleResult[];
  priorityActions: PriorityAction[];
}

/**
 * Heuristic scoring of an AI Act risk scan. Weights sum to 100 and reflect the
 * relative importance of each control. This is a pragmatic, documented default
 * that can be tuned later — it is intentionally transparent rather than a
 * black box.
 */
const WEIGHTS = {
  staffTrained: 20, // Art. 4 — AI-geletterdheid
  hasPolicy: 15,
  hasRegister: 15, // Art. 6 — basis voor classificatie
  informsUsers: 15, // Art. 50 — transparantie
  hasOversight: 10, // menselijk toezicht
  highRiskManaged: 15, // Art. 6 — hoog-risico geclassificeerd of n.v.t.
  noProhibited: 10, // Art. 5 — geen verboden praktijken
};

function bool(value: unknown): boolean {
  return value === true || value === "true" || value === "ja";
}

export function scoreScan(answers: ScanAnswers): ScanReport {
  const usesAi = bool(answers.usesAi);
  const categories = Array.isArray(answers.aiCategories)
    ? (answers.aiCategories as string[])
    : [];
  const usesBiometrics = categories.includes("biometrie");
  const usesGenerative =
    categories.includes("generatief") || categories.includes("chatbot");

  const highRisk = bool(answers.highRisk);
  const trained = bool(answers.staffTrained);
  const policy = bool(answers.hasPolicy);
  const register = bool(answers.hasRegister);
  const informs = bool(answers.informsUsers);
  const oversight = bool(answers.hasOversight);

  // ── Score ─────────────────────────────────────────────────────────────────
  let score = 0;
  if (trained) score += WEIGHTS.staffTrained;
  if (policy) score += WEIGHTS.hasPolicy;
  if (register) score += WEIGHTS.hasRegister;
  if (informs) score += WEIGHTS.informsUsers;
  if (oversight) score += WEIGHTS.hasOversight;
  if (!highRisk || register) score += WEIGHTS.highRiskManaged;
  if (!usesBiometrics) score += WEIGHTS.noProhibited;

  // An organisation that uses no AI has minimal obligations — give it a floor
  // (awareness is still recommended), regardless of missing controls.
  if (!usesAi) score = Math.max(score, 85);

  score = Math.min(100, Math.max(0, Math.round(score)));

  const level = score >= 75 ? "laag" : score >= 45 ? "gemiddeld" : "hoog";

  // ── Per-article status ──────────────────────────────────────────────────────
  const art4: ArticleResult = {
    article: "Art. 4",
    title: "AI-geletterdheid",
    status: !usesAi || trained ? "compliant" : policy ? "in_progress" : "open",
    summary: trained
      ? "Medewerkers zijn getraind in verantwoord AI-gebruik."
      : "Er is nog geen aantoonbare AI-geletterdheid binnen de organisatie.",
  };

  const art5: ArticleResult = {
    article: "Art. 5",
    title: "Verboden praktijken",
    status: usesBiometrics ? "in_progress" : "compliant",
    summary: usesBiometrics
      ? "Controleer of uw biometrische toepassing niet onder de verboden praktijken valt."
      : "Geen indicaties van verboden AI-praktijken.",
  };

  const art50: ArticleResult = {
    article: "Art. 50",
    title: "Transparantie",
    status: informs
      ? "compliant"
      : usesGenerative
        ? "open"
        : !usesAi
          ? "compliant"
          : "in_progress",
    summary: informs
      ? "Gebruikers worden geïnformeerd over AI-interacties."
      : "Voeg transparantiemeldingen toe bij interactie met AI of AI-content.",
  };

  const art6: ArticleResult = {
    article: "Art. 6",
    title: "Hoog-risico classificatie",
    status: !highRisk ? "compliant" : register ? "in_progress" : "open",
    summary: !highRisk
      ? "Geen hoog-risico toepassingen gemeld."
      : register
        ? "Classificeer en documenteer uw hoog-risico systemen formeel."
        : "Hoog-risico AI in gebruik zonder register — classificatie ontbreekt.",
  };

  const articles = [art4, art5, art50, art6];

  // ── Priority actions ────────────────────────────────────────────────────────
  const candidates: (PriorityAction & { severity: number })[] = [];

  if (highRisk && !register) {
    candidates.push({
      severity: 5,
      article: "Art. 6",
      title: "Stel een AI-register op en classificeer hoog-risico systemen",
      description:
        "U gebruikt AI met grote impact op mensen, maar houdt nog geen register bij. Breng alle systemen in kaart en bepaal het risiconiveau.",
    });
  }
  if (highRisk) {
    candidates.push({
      severity: 4,
      article: "Art. 27",
      title: "Voer een grondrechtentoets (FRIA) uit",
      description:
        "Voor hoog-risico AI is een Fundamental Rights Impact Assessment vereist. ComplAI genereert deze op basis van uw register.",
    });
  }
  if (usesBiometrics) {
    candidates.push({
      severity: 4,
      article: "Art. 5",
      title: "Toets uw biometrische toepassing aan de verboden praktijken",
      description:
        "Bepaalde vormen van biometrische herkenning zijn verboden. Controleer of uw toepassing is toegestaan.",
    });
  }
  if (!trained) {
    candidates.push({
      severity: 4,
      article: "Art. 4",
      title: "Start AI-geletterdheidstraining voor medewerkers",
      description:
        "Borg aantoonbaar dat medewerkers AI verantwoord gebruiken via de e-learning met certificaten.",
    });
  }
  if (!informs && usesGenerative) {
    candidates.push({
      severity: 3,
      article: "Art. 50",
      title: "Voeg transparantiemeldingen toe bij AI-interacties",
      description:
        "Informeer gebruikers wanneer zij met AI communiceren of AI-gegenereerde content zien.",
    });
  }
  if (!policy) {
    candidates.push({
      severity: 3,
      article: "Beleid",
      title: "Stel een AI-beleid op",
      description:
        "Leg vast hoe uw organisatie verantwoord met AI omgaat. ComplAI genereert een concept-beleid.",
    });
  }
  if (!register && !highRisk && usesAi) {
    candidates.push({
      severity: 2,
      article: "Art. 6",
      title: "Begin met een AI-register",
      description:
        "Een centraal overzicht van uw AI-systemen is de basis voor alle verdere verplichtingen.",
    });
  }
  if (!oversight && usesAi) {
    candidates.push({
      severity: 2,
      article: "Governance",
      title: "Borg menselijk toezicht op AI-beslissingen",
      description:
        "Zorg dat belangrijke AI-beslissingen door een mens kunnen worden gecontroleerd en gecorrigeerd.",
    });
  }

  const priorityActions: PriorityAction[] = candidates
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 3)
    .map((c) => ({
      article: c.article,
      title: c.title,
      description: c.description,
    }));

  const summary =
    level === "laag"
      ? "U heeft de belangrijkste AI Act-verplichtingen goed op orde. Houd uw compliance actueel."
      : level === "gemiddeld"
        ? "U heeft een goede basis, maar er zijn nog belangrijke stappen te zetten richting volledige compliance."
        : "Er zijn meerdere belangrijke verplichtingen die nog aandacht vragen. Begin met de prioriteiten hieronder.";

  return { score, level, summary, articles, priorityActions };
}
