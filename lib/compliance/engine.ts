// The classification engine: walks a completed scan and emits obligation codes,
// risk tiers, roles and flags — the regulation-grounded core. Pure & deterministic.
//
// Faithful to Reg. (EU) 2024/1689 with the fact-check corrections applied:
// Annex I Section B is not auto high-risk; predictive policing & real-time RBI
// have qualifiers; GPAI duties bind model providers not deployers; FRIA fires for
// any credit/insurance deployer; Art. 50(1)/(2) are provider duties; prohibited
// overrides high-risk; FOSS exemption voids for high-risk/Art.5/Art.50.

import { APPLICATION_DATES } from "@/lib/compliance/timeline";
import type { EntityRole, RiskTier } from "@/lib/compliance/types";
import type { ScanAnswers } from "@/lib/compliance/questions";

export interface ClassificationResult {
  inScope: boolean;
  exclusions: string[];
  entityRoles: EntityRole[];
  riskTiers: RiskTier[];
  systemFlags: {
    gpaiModelProvider: boolean;
    gpaiSystemic: boolean;
    profiling: boolean;
  };
  // `deadline` overrides the catalog default (used to stamp the later Annex I
  // application date on high-risk product systems).
  emitted: { code: string; required?: boolean; deadline?: string }[];
  caveats: string[];
}

const has = (arr: string[] | undefined, v: string) => Array.isArray(arr) && arr.includes(v);
const hasAnyReal = (arr: string[] | undefined) =>
  Array.isArray(arr) && arr.some((v) => v && v !== "none");

export function classify(answers: ScanAnswers): ClassificationResult {
  const roles = new Set<EntityRole>(answers.roles ?? []);
  const tiers = new Set<RiskTier>();
  const emitted: { code: string; required?: boolean; deadline?: string }[] = [];
  const caveats: string[] = [];
  const exclusions: string[] = [];
  const emit = (code: string, required?: boolean, deadline?: string) =>
    emitted.push({ code, required, deadline });

  const isProvider = () => roles.has("provider");
  const isDeployer = () => roles.has("deployer");

  // ── Section E — roles & Art. 25 ──────────────────────────────────────────
  if (isProvider() || isDeployer()) emit("ART_4_LITERACY");
  let pendingBecomeProvider = false;
  if (hasAnyReal(answers.modifications)) {
    if (isProvider()) emit("ART_25_HANDOVER");
    else pendingBecomeProvider = true;
  }

  // ── Section S (scope) — evaluated early for flags; END handled below ──────
  const gpaiModelProvider = has(answers.scopeCriteria, "place_gpai_model");
  if (gpaiModelProvider) roles.add("provider");
  if (has(answers.scopeCriteria, "place_system")) roles.add("provider");
  if (has(answers.scopeCriteria, "established_eu")) roles.add("deployer");
  if (has(answers.scopeCriteria, "importer_eu")) roles.add("importer");
  const inScope = hasAnyReal(answers.scopeCriteria);

  // ── Exclusions (Art. 2) ──────────────────────────────────────────────────
  let fullyExcluded = false;
  if (has(answers.exclusions, "military")) {
    exclusions.push("military");
    fullyExcluded = true;
  }
  if (has(answers.exclusions, "third_country_le")) {
    exclusions.push("third_country_le");
    fullyExcluded = true;
  }
  if (has(answers.exclusions, "research")) exclusions.push("research");
  if (has(answers.exclusions, "personal")) exclusions.push("personal");
  const foss = has(answers.exclusions, "foss");

  // ── Section R3 — prohibited practices (Art. 5), with qualifiers ──────────
  const q = answers.prohibitedQualifiers ?? {};
  const prohibitedHits = (answers.prohibited ?? []).filter((p) => {
    if (p === "none") return false;

    // Context-dependent practices: prohibited ONLY when an aggravating qualifier
    // is affirmatively confirmed; otherwise flag for legal review (not a hard
    // stop). This stops defensive ticks from producing false "Verboden" verdicts.
    if (p === "manipulation") {
      if (q.manipulationSeriousHarm) return true;
      caveats.push("Manipulatieve technieken zijn alleen verboden bij aantoonbaar ernstige schade. Laat dit toetsen.");
      return false;
    }
    if (p === "exploitation") {
      if (q.exploitationHarm) return true;
      caveats.push("Het uitbuiten van kwetsbaarheden is verboden wanneer dit tot schade leidt. Laat dit toetsen.");
      return false;
    }
    if (p === "social_scoring") {
      if (q.socialScoringUnrelatedContext) return true;
      caveats.push("Sociale scoring is verboden bij nadelige behandeling in een onverwante context. Laat dit toetsen.");
      return false;
    }
    if (p === "predictive_policing") {
      if (q.predictivePolicingSolelyProfiling) return true;
      caveats.push("Voorspellend politiewerk is alleen verboden als het uitsluitend op profilering berust; anders mogelijk hoog-risico (Annex III 6d). Laat dit toetsen.");
      return false;
    }
    if (p === "realtime_rbi") {
      // Prohibited only when affirmatively real-time/public/law-enforcement AND
      // not under a strict-necessity exception.
      if (q.rbiRealtimePublicLE && !q.rbiStrictNecessity) return true;
      caveats.push("Real-time biometrische identificatie is alleen onder strikte voorwaarden verboden; vaak valt het onder hoog-risico met autorisatie. Laat dit toetsen.");
      return false;
    }

    // Emotion recognition at work/education is prohibited unless a medical/safety
    // exception applies.
    if (p === "emotion_work_edu") {
      if (q.emotionMedicalSafetyException) {
        caveats.push("Emotieherkenning op werk/onderwijs kan zijn toegestaan onder een medische- of veiligheidsuitzondering. Laat dit toetsen.");
        return false;
      }
      return true;
    }

    // Specific prohibited acts (facial_scraping, biometric_categorisation):
    // the narrowed label is the prohibited act itself → flag if ticked.
    return true;
  });
  const isProhibited = prohibitedHits.length > 0;
  if (isProhibited) {
    tiers.add("prohibited");
    emit("ART_5_PROHIBITED");
  }

  // ── Annex III 1(a) carve-out — 1:1 biometric verification is NOT high-risk ──
  // "This shall not include AI systems intended to be used for biometric
  //  verification the sole purpose of which is to confirm that a specific natural
  //  person is the person he or she claims to be" (Annex III, point 1(a)). So a
  //  verification-only answer drops area "1" from the high-risk trigger.
  const biometricVerificationOnly =
    has(answers.annexIII_areas, "1") && answers.biometricUse === "verification";
  if (biometricVerificationOnly) {
    caveats.push(
      "Biometrische 1-op-1 verificatie (bevestigen dat iemand is wie hij zegt te zijn) valt niet onder hoog-risico (Annex III, punt 1(a)); herkenning op afstand (1-op-veel) wél."
    );
  }
  const annexIIIareas = (answers.annexIII_areas ?? []).filter(
    (a) => !(a === "1" && biometricVerificationOnly)
  );

  // ── Section HR — high-risk status (Art. 6/7, Annex I & III) ───────────────
  // Prohibited overrides high-risk for the same system: skip high-risk emission.
  let isHigh = false;
  let isHighNotify = false;
  if (!isProhibited) {
    // Annex I Section B — defers to sectoral law; high-risk only WITH 3rd-party conformity.
    if (hasAnyReal(answers.annexI_B)) {
      caveats.push(
        "Annex I (sectie B: transport/luchtvaart) valt grotendeels onder bestaande sectorale wetgeving. Controleer welke AI Act-bepalingen van toepassing zijn."
      );
      if (answers.thirdPartyConformity) isHigh = true;
    }
    // Annex I Section A — high-risk WITH third-party conformity assessment.
    if (hasAnyReal(answers.annexI_A) && answers.thirdPartyConformity) isHigh = true;

    // Annex III use-case areas (verification-only biometrics already carved out).
    if (hasAnyReal(annexIIIareas)) {
      const creditOrInsurance =
        has(answers.annexIII_subareas, "5b") || has(answers.annexIII_subareas, "5c");
      if (answers.profiling) {
        isHigh = true; // Art. 6(3) final subparagraph: profiling forces high-risk.
      } else if (creditOrInsurance) {
        isHigh = true; // credit/insurance systems virtually always profile.
      } else if (answers.art6_3_carveout) {
        isHighNotify = true; // Art. 6(3) derogation claimed → documentation/registration only.
        caveats.push(
          "U beroept zich op de Art. 6(3)-uitzondering (geen hoog risico). Dit vereist een gedocumenteerde, zelf beoordeelde inschatting — laat deze toetsen."
        );
      } else {
        isHigh = true; // Art. 6(2): Annex III area → high-risk.
      }
    }
  }

  if (pendingBecomeProvider && (isHigh || isHighNotify)) roles.add("provider");

  // FOSS exemption is void for high-risk / prohibited / transparency systems.
  if (foss) {
    if (isHigh || isProhibited || hasAnyReal(answers.transparency)) {
      caveats.push(
        "De open-source uitzondering vervalt voor hoog-risico, verboden of transparantieplichtige AI-systemen."
      );
    } else {
      exclusions.push("foss");
    }
  }

  // ── High-risk obligation sets ────────────────────────────────────────────
  // High-risk driven by an Annex I product (no Annex III use-case) applies from
  // 2 Aug 2028; a stand-alone Annex III use applies from 2 Dec 2027 (the catalog
  // default) — both deferred by the Digital Omnibus. See lib/compliance/timeline.ts.
  const hrDeadline =
    isHigh && !hasAnyReal(annexIIIareas)
      ? APPLICATION_DATES.highRiskAnnexI.date
      : undefined;
  if (isHigh) {
    tiers.add("high");
    if (isDeployer()) emit("ART_26_DEPLOYER", undefined, hrDeadline);
    if (isProvider()) {
      emit("ART_16_PROVIDER", undefined, hrDeadline);
      emit("ART_11_TECHDOC", undefined, hrDeadline);
      emit("ART_43_CONFORMITY", undefined, hrDeadline);
      emit("ART_47_DOC", undefined, hrDeadline);
      emit("ART_49_REGISTRATION", undefined, hrDeadline);
    }
  }
  if (isHighNotify) {
    tiers.add("high_notify");
    emit("ART_6_4_ASSESSMENT"); // documentation record; registration is the provider's duty
  }

  // ── FRIA (Art. 27) ───────────────────────────────────────────────────────
  if (isHigh && isDeployer()) {
    const onlyCriticalInfra =
      has(annexIIIareas, "2") &&
      annexIIIareas.filter((a) => a && a !== "none").length === 1;
    const creditOrInsurance =
      has(answers.annexIII_subareas, "5b") || has(answers.annexIII_subareas, "5c");
    if (!onlyCriticalInfra && (answers.publicBodyOrService || creditOrInsurance)) {
      emit("ART_27_FRIA");
    }
  }

  // ── Transparency (Art. 50), role-gated ───────────────────────────────────
  const t = answers.transparency ?? [];
  const tq = answers.transparencyQualifiers ?? {};
  if (has(t, "chatbot")) {
    // Art. 50(1): provider duty. Deployer: informational (duty sits upstream).
    if (isProvider()) emit("ART_50_CHATBOT", true);
    else {
      emit("ART_50_CHATBOT", false);
      caveats.push(
        "Bij een chatbot rust de transparantieplicht (Art. 50(1)) op de aanbieder. Controleer als gebruiksverantwoordelijke dat dit is geregeld."
      );
    }
  }
  if (has(t, "synthetic")) {
    if (isProvider()) emit("ART_50_SYNTHETIC", true);
    else {
      emit("ART_50_SYNTHETIC", false);
      caveats.push(
        "Het markeren van AI-content (Art. 50(2)) is een aanbiederplicht. Controleer dat de leverancier dit heeft geregeld."
      );
    }
  }
  if (has(t, "emotion_bio") && isDeployer()) emit("ART_50_EMOTION_BIO", true);
  if (has(t, "deepfake")) {
    emit("ART_50_DEEPFAKE", true);
    if (tq.deepfakeArtistic)
      caveats.push("Voor kunst/satire geldt een beperktere openbaarmakingsplicht voor deepfakes.");
  }
  if (has(t, "public_text")) {
    if (tq.publicTextEditorialReview)
      caveats.push(
        "AI-tekst onder menselijke redactionele verantwoordelijkheid is vrijgesteld van de transparantieplicht (Art. 50(4))."
      );
    else emit("ART_50_PUBLIC_TEXT", true);
  }
  if (hasAnyReal(t) && !isHigh && !isProhibited && !isHighNotify) tiers.add("limited");

  // ── GPAI (Chapter V) — model providers only ──────────────────────────────
  if (gpaiModelProvider) {
    emit("GPAI_PROVIDER");
    if (hasAnyReal(answers.gpaiSystemic)) {
      emit("GPAI_SYSTEMIC");
      emit("GPAI_NOTIFY_COMMISSION");
    }
  }

  // ── Authorised representative (Art. 22 vs 54) ────────────────────────────
  if (roles.has("authorised_representative")) {
    emit(gpaiModelProvider ? "ART_54_AUTHREP" : "ART_22_AUTHREP");
  }

  // ── Tier finalisation ────────────────────────────────────────────────────
  if (fullyExcluded) tiers.add("excluded");
  if (!inScope && !fullyExcluded) tiers.add("out_of_scope");
  if (tiers.size === 0) tiers.add("minimal");

  return {
    inScope,
    exclusions,
    entityRoles: Array.from(roles),
    riskTiers: Array.from(tiers),
    systemFlags: {
      gpaiModelProvider,
      gpaiSystemic: gpaiModelProvider && hasAnyReal(answers.gpaiSystemic),
      profiling: Boolean(answers.profiling),
    },
    emitted,
    caveats,
  };
}
