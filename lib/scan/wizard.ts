// Wizard definition for the regulation-grounded scan. Steps map to the
// ScanAnswers shape; `visible` predicates implement the branching/skip logic.
// (Qualifier sub-questions for Art. 5 / Art. 50 are a Phase 2 refinement; the
// engine treats unqualified answers conservatively and adds caveats.)

import {
  ANNEX_I_A,
  ANNEX_III_AREAS,
  ANNEX_III_SUBAREAS,
  BIOMETRIC_USE,
  ENTITY_ROLES,
  EXCLUSIONS,
  GPAI_SYSTEMIC,
  MODIFICATIONS,
  PROHIBITED_PRACTICES,
  READINESS_QUESTIONS,
  SCOPE_CRITERIA,
  TOOL_GROUPS,
  TRANSPARENCY_TYPES,
  USE_CASES,
  mapTools,
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

export type StepType = "single" | "multi" | "boolean" | "tri" | "text" | "review";

export interface WizardStep {
  field: keyof ScanAnswers;
  /** For `tri` readiness steps: which nested `answers.readiness` key to read/write. */
  readinessKey?: keyof NonNullable<ScanAnswers["readiness"]>;
  /** For a `boolean` qualifier step: which nested `answers.prohibitedQualifiers` key to read/write. */
  qualifierKey?: keyof NonNullable<ScanAnswers["prohibitedQualifiers"]>;
  section: string;
  title: string;
  help?: string;
  type: StepType;
  options?: Option[];
  /** Grouped options for a `multi` step (rendered under group headers). */
  groups?: { label: string; options: Option[] }[];
  visible?: (a: ScanAnswers) => boolean;
  /** Multi-select that may be left empty, or a `text` step that may be skipped. */
  optional?: boolean;
  /** Suggested pre-fills merged into still-empty downstream fields on advance. */
  onAdvance?: (a: ScanAnswers) => Partial<ScanAnswers>;
  /** Placeholder for `text` steps. */
  placeholder?: string;
}

const hasReal = (arr?: string[]) =>
  Array.isArray(arr) && arr.some((v) => v && v !== "none");

const CLASSIFICATION_STEPS: WizardStep[] = [
  {
    field: "companyName",
    section: "Uw organisatie",
    title: "Wat is de naam van uw organisatie?",
    help: "Optioneel — hiermee personaliseren we uw rapport. U kunt dit overslaan.",
    type: "text",
    placeholder: "Bijv. Janssen Advies B.V.",
    optional: true,
  },
  { field: "size", section: "Uw organisatie", title: "Hoe groot is uw organisatie?", type: "single", options: SIZES },
  { field: "sector", section: "Uw organisatie", title: "In welke sector is uw organisatie actief?", type: "single", options: SECTORS },
  {
    field: "tools",
    section: "AI-gebruik",
    title: "Welke AI-tools gebruikt u?",
    help: "Kies alles wat u herkent. Niet zeker? Kies gerust 'Weet ik niet zeker' — u hoeft geen expert te zijn.",
    type: "multi",
    groups: TOOL_GROUPS,
  },
  {
    field: "useCases",
    section: "AI-gebruik",
    title: "Waarvoor gebruikt u AI?",
    help: "Op basis hiervan vullen we de volgende vragen alvast voor u in. U controleert ze daarna zelf.",
    type: "multi",
    options: USE_CASES,
    onAdvance: mapTools,
  },
  {
    field: "roles",
    section: "Uw rol",
    title: "Welke rol(len) heeft uw organisatie ten opzichte van AI?",
    help: "We hebben dit op basis van uw tools alvast ingevuld — controleer of het klopt.",
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
    field: "biometricUse",
    section: "Risiconiveau",
    title: "Waarvoor gebruikt u biometrie?",
    help: "1-op-1 verificatie (bevestigen dat iemand is wie hij zegt te zijn) valt buiten hoog-risico (Annex III, punt 1(a)); herkenning uit een groep, categorisering of emotieherkenning valt er wél onder.",
    type: "single",
    options: BIOMETRIC_USE,
    visible: (a) => a.annexIII_areas.includes("1"),
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
  // Art. 25 — only relevant for a potentially high-risk system: modifying or
  // rebranding one makes you its provider. Gated on a high-risk signal so the
  // 90% low-risk case never sees it.
  {
    field: "modifications",
    section: "Risiconiveau",
    title: "Past u dit AI-systeem wezenlijk aan of brengt u het onder uw eigen naam op de markt?",
    help: "Onder Art. 25 wordt u dan zélf 'aanbieder' van het hoog-risico systeem, met de bijbehorende plichten.",
    type: "multi",
    options: MODIFICATIONS,
    visible: (a) => hasReal(a.annexI_A) || hasReal(a.annexIII_areas),
  },
  {
    field: "prohibited",
    section: "Verboden praktijken",
    title: "Doet uw AI een van deze dingen?",
    help: "Deze praktijken zijn in beginsel verboden (Art. 5).",
    type: "multi",
    options: PROHIBITED_PRACTICES,
  },
  // Art. 5(1)(f) carries a medical/safety exception. Only asked when the user
  // ticked emotion-at-work/education, so a legitimate medical/safety use can
  // de-escalate instead of hitting the hard "Verboden" verdict (audit #1).
  {
    field: "prohibitedQualifiers",
    qualifierKey: "emotionMedicalSafetyException",
    section: "Verboden praktijken",
    title: "Gebeurt die emotieherkenning uitsluitend om medische of veiligheidsredenen?",
    help: "Alleen dán geldt de wettelijke uitzondering op het verbod (Art. 5(1)(f)) — bijvoorbeeld vermoeidheidsdetectie voor de veiligheid van een bestuurder. Het meten van betrokkenheid, prestaties of stemming valt hier niet onder. Laat dit altijd juridisch toetsen.",
    type: "boolean",
    visible: (a) => (a.prohibited ?? []).includes("emotion_work_edu"),
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

// ── Sectie 6 — readiness (drives the gereedheidsscore) ──────────────────────
// Each readiness question is only shown when the obligation it measures actually
// applies, so a low-risk org answers a handful and a high-risk one answers more.
const readinessVisible: Record<string, (a: ScanAnswers) => boolean> = {
  always: () => true,
  register: () => true,
  highRisk: (a) => hasReal(a.annexIII_areas),
  transparency: (a) => hasReal(a.transparency),
  provider: (a) => a.roles.includes("provider"),
  fria: (a) =>
    hasReal(a.annexIII_areas) &&
    (a.annexIII_areas.includes("5") ||
      a.publicBodyOrService === true ||
      (a.annexIII_subareas ?? []).some((s) => s === "5b" || s === "5c")),
};

const READINESS_STEPS: WizardStep[] = READINESS_QUESTIONS.map((q, i) => ({
  field: "readiness" as keyof ScanAnswers,
  readinessKey: q.key,
  section: "Gereedheid",
  title: q.label,
  help:
    i === 0
      ? `${q.help} Antwoord eerlijk — dit zijn uw eigen, onbevestigde opgaven en ze bepalen uw gereedheidsscore.`
      : q.help,
  type: "tri" as StepType,
  visible: readinessVisible[q.when],
}));

// ── Sectie 7 — editable review (always last) ────────────────────────────────
const REVIEW_STEP: WizardStep = {
  field: "companyName", // placeholder; the review render ignores it
  section: "Controle",
  title: "Controleer uw antwoorden",
  help: "Klopt alles? Pas gerust iets aan. Daarna stellen we direct uw rapport samen.",
  type: "review",
};

export const STEPS: WizardStep[] = [
  ...CLASSIFICATION_STEPS,
  ...READINESS_STEPS,
  REVIEW_STEP,
];

export const TRI_OPTIONS: Option[] = [
  { value: "ja", label: "Ja" },
  { value: "deels", label: "Deels / mee bezig" },
  { value: "nee", label: "Nee, nog niet" },
];

// Stable, ordered list of the sections in the flow — derived once from STEPS so
// it never drifts. Progress is keyed off this, not the (branch-dependent) step
// count, which is what made the bar jump (9 → 12).
export const SECTION_ORDER: string[] = STEPS.reduce<string[]>((acc, s) => {
  if (!acc.includes(s.section)) acc.push(s.section);
  return acc;
}, []);

/** Progress 0–100 as a PURE function of the current step's static position
 * (section index + position within its section). Because it ignores how many
 * steps the current answers happen to reveal, it can only ever move forward. */
export function scanProgress(step: WizardStep): number {
  const sectionIdx = Math.max(0, SECTION_ORDER.indexOf(step.section));
  const sectionSteps = STEPS.filter((s) => s.section === step.section);
  const within = Math.max(
    0,
    sectionSteps.findIndex(
      (s) =>
        s.field === step.field &&
        s.readinessKey === step.readinessKey &&
        s.qualifierKey === step.qualifierKey
    )
  );
  const intra = (within + 1) / (sectionSteps.length + 1);
  return ((sectionIdx + intra) / SECTION_ORDER.length) * 100;
}

/** Human-readable value of a step's current answer, for the review screen. */
export function formatAnswer(step: WizardStep, answers: ScanAnswers): string {
  const a = answers as unknown as Record<string, unknown>;
  if (step.type === "text") {
    const v = a[step.field];
    return typeof v === "string" && v.trim() ? v : "—";
  }
  if (step.type === "boolean") {
    const v = step.qualifierKey
      ? (answers.prohibitedQualifiers ?? {})[step.qualifierKey]
      : a[step.field];
    return v === true ? "Ja" : v === false ? "Nee" : "—";
  }
  if (step.type === "tri" && step.readinessKey) {
    const v = (answers.readiness ?? {})[step.readinessKey];
    return TRI_OPTIONS.find((t) => t.value === v)?.label ?? "—";
  }
  const opts = step.groups ? step.groups.flatMap((g) => g.options) : step.options ?? [];
  if (step.type === "single") {
    return opts.find((x) => x.value === a[step.field])?.label ?? "—";
  }
  // multi
  const arr = a[step.field];
  if (!Array.isArray(arr) || arr.length === 0) return "—";
  return arr.map((v) => opts.find((x) => x.value === v)?.label ?? String(v)).join(", ");
}

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
