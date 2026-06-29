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

export interface ScanAnswers {
  // Section 0 — company basics
  size?: string;
  sector?: string;
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
    predictivePolicingSolelyProfiling?: boolean; // false → not Art. 5 (may be Annex III 6d)
    rbiStrictNecessity?: boolean; // true → exception applies → not a flat prohibition
  };
  transparency: string[];
  transparencyQualifiers?: {
    deepfakeArtistic?: boolean; // limited disclosure carve-out
    publicTextEditorialReview?: boolean; // disapplied if human editorial responsibility
  };
  publicBodyOrService?: boolean; // for FRIA (Art. 27)
}
