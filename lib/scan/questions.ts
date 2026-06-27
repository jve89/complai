// The 10-question EU AI Act risk-scan. Answers are stored as a flat record
// keyed by question id and fed to lib/scan/scoring.ts.

export type QuestionType = "single" | "multi" | "boolean";

export interface Option {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  help?: string;
  options?: Option[];
}

export const SECTORS: Option[] = [
  { value: "zakelijke-dienstverlening", label: "Zakelijke dienstverlening" },
  { value: "ict", label: "ICT / software" },
  { value: "zorg", label: "Zorg & welzijn" },
  { value: "onderwijs", label: "Onderwijs" },
  { value: "financieel", label: "Financiële sector" },
  { value: "overheid", label: "Overheid" },
  { value: "retail", label: "Retail & e-commerce" },
  { value: "industrie", label: "Industrie & productie" },
  { value: "hr", label: "HR & recruitment" },
  { value: "anders", label: "Anders" },
];

export const AI_CATEGORIES: Option[] = [
  { value: "generatief", label: "Generatieve AI (ChatGPT, Copilot, beeldgeneratie)" },
  { value: "chatbot", label: "Chatbot of virtuele assistent" },
  { value: "werving", label: "AI bij werving & selectie (cv-screening)" },
  { value: "krediet", label: "Krediet- of risicobeoordeling" },
  { value: "biometrie", label: "Biometrische herkenning (gezicht, stem)" },
  { value: "voorspelmodel", label: "Voorspel- of analysemodellen" },
  { value: "geen", label: "Geen van bovenstaande" },
];

export const QUESTIONS: Question[] = [
  {
    id: "size",
    type: "single",
    title: "Hoe groot is uw organisatie?",
    options: [
      { value: "1-10", label: "1 – 10 medewerkers" },
      { value: "11-50", label: "11 – 50 medewerkers" },
      { value: "51-250", label: "51 – 250 medewerkers" },
      { value: "250+", label: "Meer dan 250 medewerkers" },
    ],
  },
  {
    id: "sector",
    type: "single",
    title: "In welke sector is uw organisatie actief?",
    options: SECTORS,
  },
  {
    id: "usesAi",
    type: "boolean",
    title: "Gebruikt uw organisatie AI-systemen of -tools?",
    help: "Denk ook aan tools die AI 'onder de motorkap' gebruiken, zoals slimme assistenten of analysetools.",
  },
  {
    id: "aiCategories",
    type: "multi",
    title: "Welke soorten AI zet uw organisatie in?",
    help: "Selecteer alles wat van toepassing is.",
    options: AI_CATEGORIES,
  },
  {
    id: "highRisk",
    type: "boolean",
    title:
      "Gebruikt u AI voor besluiten met grote impact op mensen (werving, krediet, onderwijs, biometrie)?",
    help: "Dit zijn mogelijk hoog-risico toepassingen onder Annex III van de AI Act.",
  },
  {
    id: "staffTrained",
    type: "boolean",
    title:
      "Zijn uw medewerkers getraind in verantwoord en veilig gebruik van AI?",
    help: "Artikel 4 verplicht organisaties om AI-geletterdheid te borgen.",
  },
  {
    id: "hasPolicy",
    type: "boolean",
    title: "Heeft uw organisatie een vastgesteld AI-beleid?",
  },
  {
    id: "hasRegister",
    type: "boolean",
    title: "Houdt u een register bij van alle gebruikte AI-systemen?",
  },
  {
    id: "informsUsers",
    type: "boolean",
    title:
      "Informeert u mensen wanneer zij met AI communiceren of AI-content zien?",
    help: "Artikel 50 stelt transparantie-eisen bij interactie met AI.",
  },
  {
    id: "hasOversight",
    type: "boolean",
    title: "Is er menselijk toezicht op belangrijke AI-beslissingen?",
  },
];

export type ScanAnswers = Record<string, string | string[] | boolean>;
