// Grounded questionnaire — option catalogues + the answer shape the engine
// consumes. Mirrors the official EU AI Act compliance-checker decision tree
// (Entity → High-risk → Scope → Particular-system rules). Dutch labels ship in
// the UI; the wizard that collects these answers is built in Phase 2.

import type { EntityRole } from "@/lib/compliance/types";

export interface Option {
  value: string;
  label: string;
  /** Optional helper text shown under the option. */
  help?: string;
}

// ── Section E — entity role (Art. 3, 25) ────────────────────────────────────
export const ENTITY_ROLES: { value: EntityRole; label: string; help: string }[] = [
  { value: "provider", label: "Aanbieder", help: "Wij ontwikkelen AI of brengen het onder onze naam op de markt." },
  { value: "deployer", label: "Gebruiksverantwoordelijke", help: "Wij gebruiken AI onder eigen verantwoordelijkheid." },
  { value: "importer", label: "Importeur", help: "Wij brengen AI van buiten de EU op de EU-markt." },
  { value: "distributor", label: "Distributeur", help: "Wij verhandelen AI van anderen." },
  { value: "product_manufacturer", label: "Productfabrikant", help: "Wij bouwen AI in onze producten in." },
  { value: "authorised_representative", label: "Gemachtigde", help: "Wij vertegenwoordigen een niet-EU aanbieder." },
];

export const MODIFICATIONS: Option[] = [
  { value: "rebrand", label: "Wij brengen het onder onze eigen naam/merk uit" },
  { value: "purpose", label: "Wij wijzigen het beoogde doel" },
  { value: "substantial", label: "Wij brengen een substantiële wijziging aan" },
  { value: "none", label: "Geen van bovenstaande" },
];

// ── Section 1 — AI-gebruik (friendly opener; pre-fills via mapTools) ─────────
// Named tools so users recognise their own situation instead of legal terms.
export const TOOL_GROUPS: { label: string; options: Option[] }[] = [
  {
    label: "Chatbots & assistenten",
    options: [
      { value: "chatgpt", label: "ChatGPT (OpenAI)" },
      { value: "copilot", label: "Microsoft Copilot" },
      { value: "gemini", label: "Google Gemini" },
      { value: "claude", label: "Claude (Anthropic)" },
      { value: "grok", label: "Grok (xAI)" },
      { value: "mistral", label: "Mistral / Le Chat" },
      { value: "meta", label: "Meta AI" },
      { value: "deepseek", label: "DeepSeek" },
      { value: "perplexity", label: "Perplexity" },
    ],
  },
  {
    label: "Beeld, audio & video",
    options: [
      { value: "midjourney", label: "Midjourney" },
      { value: "dalle", label: "DALL·E / Sora" },
      { value: "stable_diffusion", label: "Stable Diffusion" },
      { value: "elevenlabs", label: "ElevenLabs (stem)" },
      { value: "synthesia", label: "Synthesia / HeyGen (video)" },
    ],
  },
  {
    label: "AI in zakelijke software",
    options: [
      { value: "m365_copilot", label: "Microsoft 365 Copilot" },
      { value: "workspace_gemini", label: "Google Workspace (Gemini)" },
      { value: "hubspot_ai", label: "HubSpot AI" },
      { value: "salesforce_einstein", label: "Salesforce Einstein" },
      { value: "notion_ai", label: "Notion AI" },
      { value: "canva_ai", label: "Canva AI" },
    ],
  },
  {
    label: "Ontwikkeling",
    options: [
      { value: "github_copilot", label: "GitHub Copilot" },
      { value: "cursor", label: "Cursor" },
    ],
  },
  {
    label: "Eigen of branche-specifieke AI",
    options: [
      { value: "eigen_ontwikkeld", label: "Wij ontwikkelen zelf AI of modellen", help: "Bv. een eigen model of een AI-functie in uw product." },
      { value: "branche_tool", label: "Branche-specifieke AI-tool" },
    ],
  },
  {
    label: "Anders",
    options: [
      { value: "geen", label: "Wij gebruiken (nog) geen AI" },
      { value: "weet_niet", label: "Weet ik niet zeker" },
      { value: "anders", label: "Anders / staat er niet bij" },
    ],
  },
];

// Plain-verb use-cases → silent role/transparency/Annex III hints (confirmed later).
export const USE_CASES: Option[] = [
  { value: "klantcontact", label: "Klantcontact of chatbot" },
  { value: "content", label: "Teksten of e-mails opstellen" },
  { value: "samenvatten", label: "Documenten samenvatten of doorzoeken" },
  { value: "beeld_audio", label: "Beeld, audio of video genereren" },
  { value: "code", label: "Software ontwikkelen (code)" },
  { value: "data_analyse", label: "Data-analyse of voorspellingen" },
  { value: "werving", label: "Sollicitanten beoordelen of rangschikken", help: "Bv. cv-screening of geautomatiseerde voorselectie." },
  { value: "personeel", label: "Beslissingen over medewerkers", help: "Bv. beoordeling, promotie of roostering." },
  { value: "krediet", label: "Krediet- of verzekeringsaanvragen beoordelen" },
  { value: "biometrie", label: "Gezichts-, stem- of emotieherkenning" },
  { value: "geen", label: "Algemeen gebruik / geen van deze" },
];

const NON_TOOL = ["geen", "weet_niet", "anders"];

/** Named tools → an AI-register entry (name + vendor). Used to pre-load the
 * register from the scan. Generic picks (eigen_ontwikkeld, branche_tool) and the
 * non-tools are intentionally absent. */
export const TOOL_META: Record<string, { name: string; vendor: string }> = {
  chatgpt: { name: "ChatGPT", vendor: "OpenAI" },
  copilot: { name: "Microsoft Copilot", vendor: "Microsoft" },
  gemini: { name: "Google Gemini", vendor: "Google" },
  claude: { name: "Claude", vendor: "Anthropic" },
  grok: { name: "Grok", vendor: "xAI" },
  mistral: { name: "Mistral / Le Chat", vendor: "Mistral AI" },
  meta: { name: "Meta AI", vendor: "Meta" },
  deepseek: { name: "DeepSeek", vendor: "DeepSeek" },
  perplexity: { name: "Perplexity", vendor: "Perplexity AI" },
  midjourney: { name: "Midjourney", vendor: "Midjourney" },
  dalle: { name: "DALL·E / Sora", vendor: "OpenAI" },
  stable_diffusion: { name: "Stable Diffusion", vendor: "Stability AI" },
  elevenlabs: { name: "ElevenLabs", vendor: "ElevenLabs" },
  synthesia: { name: "Synthesia / HeyGen", vendor: "Synthesia" },
  m365_copilot: { name: "Microsoft 365 Copilot", vendor: "Microsoft" },
  workspace_gemini: { name: "Google Workspace (Gemini)", vendor: "Google" },
  hubspot_ai: { name: "HubSpot AI", vendor: "HubSpot" },
  salesforce_einstein: { name: "Salesforce Einstein", vendor: "Salesforce" },
  notion_ai: { name: "Notion AI", vendor: "Notion" },
  canva_ai: { name: "Canva AI", vendor: "Canva" },
  github_copilot: { name: "GitHub Copilot", vendor: "GitHub / Microsoft" },
  cursor: { name: "Cursor", vendor: "Anysphere" },
};

// ── Section HR — high-risk status (Art. 6/7, Annex I & III) ──────────────────
// Annex I Section B (transport/aviation): governed largely by sectoral law; only
// high-risk WITH third-party conformity assessment.
export const ANNEX_I_B: Option[] = [
  { value: "aviation_security", label: "Luchtvaartbeveiliging" },
  { value: "two_three_wheel", label: "Twee-/driewielers & quads" },
  { value: "agri_forestry", label: "Landbouw-/bosbouwvoertuigen" },
  { value: "marine", label: "Uitrusting voor zeeschepen" },
  { value: "rail", label: "Spoorwegsysteem" },
  { value: "motor_vehicles", label: "Motorvoertuigen" },
  { value: "civil_aviation", label: "Burgerluchtvaart" },
  { value: "none", label: "Geen van bovenstaande" },
];

export const ANNEX_I_A: Option[] = [
  { value: "machinery", label: "Machines" },
  { value: "toys", label: "Speelgoed" },
  { value: "recreational_craft", label: "Pleziervaartuigen" },
  { value: "lifts", label: "Liften" },
  { value: "atex", label: "ATEX (explosiegevaarlijke omgevingen)" },
  { value: "radio", label: "Radioapparatuur" },
  { value: "pressure", label: "Drukapparatuur" },
  { value: "cableways", label: "Kabelbanen" },
  { value: "ppe", label: "Persoonlijke beschermingsmiddelen" },
  { value: "gas", label: "Gastoestellen" },
  { value: "medical_devices", label: "Medische hulpmiddelen" },
  { value: "ivd", label: "Medische hulpmiddelen voor in-vitrodiagnostiek" },
  { value: "none", label: "Geen van bovenstaande" },
];

// Annex III high-risk use-case areas (Art. 6(2)).
export const ANNEX_III_AREAS: Option[] = [
  { value: "1", label: "Biometrie", help: "Identificatie, categorisering, emotieherkenning (buiten verboden gevallen)." },
  { value: "2", label: "Kritieke infrastructuur" },
  { value: "3", label: "Onderwijs en beroepsopleiding" },
  { value: "4", label: "Werk, personeelsbeheer en toegang tot zelfstandige arbeid" },
  { value: "5", label: "Essentiële private en publieke diensten (incl. krediet, verzekering)" },
  { value: "6", label: "Rechtshandhaving" },
  { value: "7", label: "Migratie, asiel en grenstoezicht" },
  { value: "8", label: "Rechtsbedeling en democratische processen" },
  { value: "none", label: "Geen van bovenstaande" },
];

// Sub-areas that matter for FRIA (Art. 27) — credit & insurance fire FRIA for any deployer.
export const ANNEX_III_SUBAREAS: Option[] = [
  { value: "5b", label: "Kredietwaardigheidsbeoordeling / credit scoring (5b)" },
  { value: "5c", label: "Risicobeoordeling & prijsstelling levens-/zorgverzekering (5c)" },
  { value: "6d", label: "Risico dat iemand (opnieuw) een strafbaar feit pleegt (6d)" },
];

// ── Section S — scope / territorial test (Art. 2) ───────────────────────────
export const SCOPE_CRITERIA: Option[] = [
  { value: "place_system", label: "Wij brengen AI-systemen op de EU-markt" },
  { value: "place_gpai_model", label: "Wij brengen een AI-model voor algemene doeleinden (GPAI) op de EU-markt" },
  { value: "established_eu", label: "Wij zijn in de EU gevestigd en gebruiken AI" },
  { value: "importer_eu", label: "Wij importeren niet-EU AI in de EU" },
  { value: "output_used_eu", label: "De output van ons AI-systeem wordt in de EU gebruikt" },
  { value: "none", label: "Geen van bovenstaande" },
];

export const EXCLUSIONS: Option[] = [
  { value: "military", label: "Uitsluitend militair/defensie/nationale veiligheid" },
  { value: "third_country_le", label: "Rechtshandhaving/justitie van een derde land" },
  { value: "research", label: "Uitsluitend onderzoek & ontwikkeling" },
  { value: "foss", label: "Vrije en open-source componenten" },
  { value: "personal", label: "Puur persoonlijk, niet-professioneel gebruik" },
  { value: "none", label: "Geen van bovenstaande" },
];

// ── Section R — particular-system rules ─────────────────────────────────────
export const GPAI_SYSTEMIC: Option[] = [
  { value: "flop_threshold", label: "Cumulatieve trainingsrekenkracht > 10^25 FLOP" },
  { value: "commission_designated", label: "Door de Commissie aangewezen als systeemrisico" },
  { value: "none", label: "Geen van bovenstaande" },
];

// Art. 5 prohibited practices (each needs a context qualifier in the wizard).
export const PROHIBITED_PRACTICES: Option[] = [
  { value: "manipulation", label: "Subliminale/manipulatieve of misleidende technieken die ernstige schade veroorzaken" },
  { value: "exploitation", label: "Uitbuiten van kwetsbaarheden (leeftijd, handicap, sociaaleconomische situatie)" },
  { value: "social_scoring", label: "Sociale scoring met nadelige/onevenredige behandeling" },
  { value: "predictive_policing", label: "Voorspellen of een persoon een strafbaar feit pleegt — uitsluitend op basis van profilering" },
  { value: "facial_scraping", label: "Ongerichte scraping van gezichtsbeelden voor gezichtsherkenningsdatabanken" },
  { value: "emotion_work_edu", label: "Emotieherkenning op de werkvloer of in het onderwijs" },
  { value: "biometric_categorisation", label: "Biometrische categorisering op gevoelige kenmerken" },
  { value: "realtime_rbi", label: "Real-time biometrische identificatie op afstand in openbare ruimte voor rechtshandhaving" },
  { value: "none", label: "Geen van bovenstaande" },
];

// Art. 50 transparency triggers (role-gated in the engine).
export const TRANSPARENCY_TYPES: Option[] = [
  { value: "chatbot", label: "AI dat direct met mensen communiceert (chatbot/assistent)", help: "Aanbieder-plicht (Art. 50(1))." },
  { value: "synthetic", label: "AI dat synthetische audio/beeld/video/tekst genereert", help: "Aanbieder-plicht (Art. 50(2))." },
  { value: "emotion_bio", label: "Emotieherkenning of biometrische categorisering", help: "Gebruiksverantwoordelijke-plicht (Art. 50(3))." },
  { value: "deepfake", label: "Deepfakes (gemanipuleerde beelden/audio/video)", help: "Gebruiksverantwoordelijke-plicht (Art. 50(4))." },
  { value: "public_text", label: "AI-tekst die het publiek informeert over zaken van algemeen belang", help: "Gebruiksverantwoordelijke-plicht (Art. 50(4))." },
  { value: "none", label: "Geen van bovenstaande" },
];

/** Readiness questions (Sectie 6) — the real input to the gereedheidsscore.
 * `obligation` ties a readiness item to the obligation codes it satisfies, so we
 * only ask what actually applies. `tri` answers map to evidence upstream. */
export type Tri = "ja" | "deels" | "nee";

export const READINESS_QUESTIONS: {
  key: keyof NonNullable<ScanAnswers["readiness"]>;
  label: string;
  help: string;
  /** Show only when at least one of these obligation/evidence keys is relevant. */
  when: "always" | "highRisk" | "transparency" | "register" | "fria" | "provider";
}[] = [
  { key: "training", label: "Hebben uw medewerkers AI-geletterdheidstraining gehad?", help: "Art. 4 — verplicht voor iedereen die met AI werkt sinds 2 feb 2025.", when: "always" },
  { key: "policy", label: "Heeft u een AI-beleid of gedragsregels voor AI-gebruik?", help: "Interne afspraken over verantwoord en veilig AI-gebruik.", when: "always" },
  { key: "register", label: "Houdt u een register bij van de AI-systemen die u gebruikt?", help: "Een overzicht van welke AI u inzet, waarvoor en met welk risico.", when: "register" },
  { key: "oversight", label: "Is er menselijk toezicht op beslissingen van uw AI?", help: "Art. 14/26 — een mens kan ingrijpen of beslissingen herzien.", when: "highRisk" },
  { key: "transparency", label: "Maakt u aan gebruikers kenbaar dat zij met AI te maken hebben?", help: "Art. 50 — bv. melden dat een chatbot AI is of content AI-gegenereerd.", when: "transparency" },
  { key: "logging", label: "Legt uw AI-systeem gebeurtenissen vast (logging)?", help: "Art. 12/26 — registratie van gebruik voor traceerbaarheid.", when: "highRisk" },
  { key: "riskAssessment", label: "Heeft u een risicobeoordeling van uw AI-gebruik gedaan?", help: "Een inschatting van de risico's voor mensen en grondrechten.", when: "highRisk" },
  { key: "fria", label: "Heeft u een grondrechteneffectbeoordeling (FRIA) uitgevoerd?", help: "Art. 27 — verplicht voor o.a. krediet, verzekering en publieke diensten.", when: "fria" },
  { key: "techDoc", label: "Heeft u technische documentatie van uw AI-systeem?", help: "Art. 11 — beschrijving van werking, data en prestaties (aanbieders).", when: "provider" },
];

export interface ScanAnswers {
  // Section 0 — company basics
  companyName?: string;
  size?: string;
  sector?: string;
  // Section 1 — tools & use (friendly pre-fill; never auto-classified)
  tools?: string[];
  useCases?: string[];
  decisionsAboutPeople?: Tri;
  // Section E — entity role
  roles: EntityRole[];
  modifications: string[];
  // Section HR — high-risk status
  annexI_B: string[];
  annexI_A: string[];
  thirdPartyConformity?: boolean;
  annexIII_areas: string[];
  annexIII_subareas: string[];
  art6_3_carveout?: boolean; // claims the narrow-task derogation
  profiling?: boolean; // profiles natural persons → forces high-risk (Art. 6(3) final subpara)
  // Section S — scope
  scopeCriteria: string[];
  // Section R — particular-system rules
  gpaiSystemic: string[];
  exclusions: string[];
  prohibited: string[];
  prohibitedQualifiers?: {
    manipulationSeriousHarm?: boolean; // true → prohibited; default → caveat
    exploitationHarm?: boolean;
    socialScoringUnrelatedContext?: boolean;
    predictivePolicingSolelyProfiling?: boolean; // false → not Art. 5 (may be Annex III 6d)
    emotionMedicalSafetyException?: boolean; // true → exception → not prohibited
    rbiRealtimePublicLE?: boolean; // true (+ no strict necessity) → prohibited
    rbiStrictNecessity?: boolean; // true → exception applies → not a flat prohibition
  };
  transparency: string[];
  transparencyQualifiers?: {
    deepfakeArtistic?: boolean; // limited disclosure carve-out
    publicTextEditorialReview?: boolean; // disapplied if human editorial responsibility
  };
  publicBodyOrService?: boolean; // for FRIA (Art. 27)
  // Section 6 — readiness (drives the gereedheidsscore). Self-reported, unverified.
  readiness?: {
    training?: Tri;
    policy?: Tri;
    register?: Tri;
    oversight?: Tri;
    transparency?: Tri;
    logging?: Tri;
    riskAssessment?: Tri;
    fria?: Tri;
    techDoc?: Tri;
  };
  // Section 7 — contact (optional; lead capture only)
  email?: string;
}

/**
 * Derives suggested defaults for the hard classification questions from the
 * friendly tool/use-case answers, so most users only have to *confirm* the legal
 * steps instead of figuring them out. These are PRE-FILLS, never final: the role,
 * transparency and Annex III steps still render and can be changed — which is what
 * keeps the tool-picker from silently over-classifying anyone.
 */
export function mapTools(answers: ScanAnswers): Partial<ScanAnswers> {
  const tools = answers.tools ?? [];
  const uses = answers.useCases ?? [];
  const usesNamedTool = tools.some((t) => t && !NON_TOOL.includes(t));
  const buildsOwn = tools.includes("eigen_ontwikkeld");
  const out: Partial<ScanAnswers> = {};

  const roles: EntityRole[] = [];
  if (usesNamedTool) roles.push("deployer");
  if (buildsOwn) roles.push("provider");
  if (roles.length) out.roles = roles;

  if (usesNamedTool || buildsOwn) out.scopeCriteria = ["established_eu"];

  // Transparency: only the genuinely media-/chat-shaped uses (conservative).
  const transparency: string[] = [];
  if (uses.includes("klantcontact")) transparency.push("chatbot");
  if (uses.includes("beeld_audio")) transparency.push("synthetic");
  if (transparency.length) out.transparency = transparency;

  // Candidate Annex III areas — only from use-cases that are decision-about-people
  // shaped; the area step shows them pre-checked for explicit confirmation.
  const areas: string[] = [];
  const subareas: string[] = [];
  if (uses.includes("werving") || uses.includes("personeel")) areas.push("4");
  if (uses.includes("krediet")) {
    areas.push("5");
    subareas.push("5b");
  }
  if (uses.includes("biometrie")) areas.push("1");
  if (areas.length) out.annexIII_areas = areas;
  if (subareas.length) out.annexIII_subareas = subareas;

  return out;
}
