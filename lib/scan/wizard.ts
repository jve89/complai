// Wizard definition for the regulation-grounded scan. Steps map to the
// ScanAnswers shape; `visible` predicates implement the branching/skip logic.
// (Qualifier sub-questions for Art. 5 / Art. 50 are a Phase 2 refinement; the
// engine treats unqualified answers conservatively and adds caveats.)

import {
  ANNEX_I_A,
  ANNEX_III_AREAS,
  ANNEX_III_SUBAREAS,
  ENTITY_ROLES,
  EXCLUSIONS,
  GPAI_SYSTEMIC,
  PROHIBITED_PRACTICES,
  SCOPE_CRITERIA,
  TRANSPARENCY_TYPES,
  type Option,
  type ScanAnswers,
} from "@/lib/compliance/questions";

export const SIZES: Option[] = [
  { value: "1-10", label: "1 – 10 medewerkers" },
  { value: "11-50", label: "11 – 50 medewerkers" },
  { value: "51-250", label: "51 – 250 medewerkers" },
  { value: "250+", label: "Meer dan 250 medewerkers" },
];

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

export type StepType = "single" | "multi" | "boolean";

export interface WizardStep {
  field: keyof ScanAnswers;
  section: string;
  title: string;
  help?: string;
  type: StepType;
  options?: Option[];
  visible?: (a: ScanAnswers) => boolean;
  /** Multi-select that may be left empty (proceed without a choice). */
  optional?: boolean;
}

const hasReal = (arr?: string[]) =>
  Array.isArray(arr) && arr.some((v) => v && v !== "none");

export const STEPS: WizardStep[] = [
  { field: "size", section: "Uw organisatie", title: "Hoe groot is uw organisatie?", type: "single", options: SIZES },
  { field: "sector", section: "Uw organisatie", title: "In welke sector is uw organisatie actief?", type: "single", options: SECTORS },
  {
    field: "roles",
    section: "Uw rol",
    title: "Welke rol(len) heeft uw organisatie ten opzichte van AI?",
    help: "Selecteer alles wat van toepassing is.",
    type: "multi",
    options: ENTITY_ROLES.map((r) => ({ value: r.value, label: r.label, help: r.help })),
  },
  {
    field: "scopeCriteria",
    section: "Reikwijdte",
    title: "Hoe komt uw organisatie met AI in aanraking?",
    type: "multi",
    options: SCOPE_CRITERIA,
  },
  {
    field: "exclusions",
    section: "Reikwijdte",
    title: "Geldt een van deze uitzonderingen?",
    type: "multi",
    options: EXCLUSIONS,
  },
  {
    field: "annexI_A",
    section: "Producten",
    title: "Is uw AI ingebouwd in een gereguleerd product?",
    help: "Bijvoorbeeld machines, speelgoed, liften of medische hulpmiddelen.",
    type: "multi",
    options: ANNEX_I_A,
  },
  {
    field: "thirdPartyConformity",
    section: "Producten",
    title: "Vereist dat product een externe (derde-partij) conformiteitsbeoordeling?",
    type: "boolean",
    visible: (a) => hasReal(a.annexI_A),
  },
  {
    field: "annexIII_areas",
    section: "Risiconiveau",
    title: "Wordt uw AI in een van deze gebieden gebruikt?",
    help: "Dit zijn de hoog-risico gebieden uit Annex III van de AI Act.",
    type: "multi",
    options: ANNEX_III_AREAS,
  },
  {
    field: "annexIII_subareas",
    section: "Risiconiveau",
    title: "Welke specifieke toepassing is van toepassing?",
    help: "Relevant voor o.a. de grondrechtentoets (FRIA).",
    type: "multi",
    options: ANNEX_III_SUBAREAS,
    visible: (a) => hasReal(a.annexIII_areas),
    optional: true,
  },
  {
    field: "profiling",
    section: "Risiconiveau",
    title: "Maakt het systeem profielen van personen?",
    help: "Bijvoorbeeld scoren, rangschikken of voorspellen op basis van persoonskenmerken.",
    type: "boolean",
    visible: (a) => hasReal(a.annexIII_areas),
  },
  {
    field: "art6_3_carveout",
    section: "Risiconiveau",
    title: "Voert het systeem alleen een beperkte, ondersteunende taak uit zonder de uitkomst wezenlijk te beïnvloeden?",
    help: "Dit is de Art. 6(3)-uitzondering. Laat deze inschatting altijd juridisch toetsen.",
    type: "boolean",
    visible: (a) => hasReal(a.annexIII_areas) && a.profiling !== true,
  },
  {
    field: "prohibited",
    section: "Verboden praktijken",
    title: "Doet uw AI een van deze dingen?",
    help: "Deze praktijken zijn in beginsel verboden (Art. 5).",
    type: "multi",
    options: PROHIBITED_PRACTICES,
  },
  {
    field: "transparency",
    section: "Transparantie",
    title: "Heeft uw AI een van deze transparantie-kenmerken?",
    type: "multi",
    options: TRANSPARENCY_TYPES,
  },
  {
    field: "publicBodyOrService",
    section: "Transparantie",
    title: "Bent u een overheidsorganisatie of biedt u publieke diensten aan?",
    type: "boolean",
    visible: (a) => a.roles.includes("deployer") && hasReal(a.annexIII_areas),
  },
  {
    field: "gpaiSystemic",
    section: "GPAI",
    title: "Heeft uw AI-model zeer grote capaciteiten (systeemrisico)?",
    type: "multi",
    options: GPAI_SYSTEMIC,
    visible: (a) => a.scopeCriteria.includes("place_gpai_model"),
  },
];

export const EMPTY_ANSWERS: ScanAnswers = {
  roles: [],
  modifications: ["none"],
  annexI_B: ["none"],
  annexI_A: [],
  annexIII_areas: [],
  annexIII_subareas: [],
  scopeCriteria: [],
  gpaiSystemic: [],
  exclusions: [],
  prohibited: [],
  transparency: [],
};

export function visibleSteps(answers: ScanAnswers): WizardStep[] {
  return STEPS.filter((s) => !s.visible || s.visible(answers));
}
