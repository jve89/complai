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

// Canonical carve-out outcomes (biometric 1:1 verification, credit/insurance
// 5(b)/5(c), emotion-at-work, …) are recorded once in lib/compliance/carveouts.ts;
// the parity test enforces this engine and the register classifier agree with them.
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

  // ── Section S (scope) — derive scope-based roles FIRST, so the Art. 4 and
  //    Art. 25 role checks below see provider/deployer status that comes ONLY
  //    from scope (e.g. 'place_system' → provider, 'established_eu' → deployer).
  //    Previously Art. 4 was emitted before this and silently dropped for such
  //    entities (audit #8). ──────────────────────────────────────────────────
  const gpaiModelProvider = has(answers.scopeCriteria, "place_gpai_model");
  if (gpaiModelProvider) roles.add("provider");
  if (has(answers.scopeCriteria, "place_system")) roles.add("provider");
  if (has(answers.scopeCriteria, "established_eu")) roles.add("deployer");
  if (has(answers.scopeCriteria, "importer_eu")) roles.add("importer");
  const inScope = hasAnyReal(answers.scopeCriteria);
  const foss = has(answers.exclusions, "foss");

  // ── Exclusions (Art. 2) — a full exclusion means the Regulation does not
  //    apply at all, so we short-circuit with NO obligations. Previously
  //    research/personal were pushed but had no effect (audit #4). ────────────
  if (has(answers.exclusions, "military")) exclusions.push("military");
  if (has(answers.exclusions, "third_country_le")) exclusions.push("third_country_le");
  if (has(answers.exclusions, "research")) {
    exclusions.push("research");
    caveats.push(
      "De uitzondering voor wetenschappelijk onderzoek & ontwikkeling (Art. 2(6)) geldt alleen als het systeem UITSLUITEND daarvoor wordt ontwikkeld of gebruikt. Zodra het in de praktijk (ook in real-world tests) wordt ingezet, gelden de regels wél."
    );
  }
  // Full exclusions (Art. 2(3) military, 2(4) third-country LE, 2(6) sole-purpose
  // R&D) — the Regulation does not apply at all, so short-circuit with NO obligations.
  const fullyExcluded =
    has(answers.exclusions, "military") ||
    has(answers.exclusions, "third_country_le") ||
    has(answers.exclusions, "research");
  if (fullyExcluded) {
    return {
      inScope,
      exclusions,
      entityRoles: Array.from(roles),
      riskTiers: ["excluded"],
      systemFlags: { gpaiModelProvider, gpaiSystemic: false, profiling: Boolean(answers.profiling) },
      emitted: [],
      caveats,
    };
  }

  // Art. 2(10) is NARROWER: personal, non-professional use by a natural person
  // lifts only the DEPLOYER obligations — the Art. 5 prohibitions and any
  // provider/GPAI duties still apply. So it is a caveat, NOT a full exclusion
  // (would otherwise suppress the €35M Art. 5 tier — adversarial-verify finding A).
  if (has(answers.exclusions, "personal")) {
    exclusions.push("personal");
    caveats.push(
      "Art. 2(10): voor een natuurlijk persoon die AI puur persoonlijk en niet-professioneel gebruikt, gelden de gebruiksverantwoordelijke-plichten niet — maar de verboden praktijken (Art. 5) blijven gelden. Zodra het gebruik professioneel of zakelijk wordt, gelden alle regels."
    );
  }

  // ── Section E — roles & Art. 25 (after scope-role derivation, audit #8) ────
  if (isProvider() || isDeployer()) emit("ART_4_LITERACY");
  let pendingBecomeProvider = false;
  if (hasAnyReal(answers.modifications)) {
    if (isProvider()) emit("ART_25_HANDOVER");
    else pendingBecomeProvider = true;
  }

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
    // Annex I Section B — Art. 2(2): only Art. 6(1), 102–109 and 112 apply, NOT
    // the full Chapter III provider set. So route to sectoral law via a caveat
    // and do NOT flip isHigh (audit #5; scope rule #4 — no §B sector logic here).
    if (hasAnyReal(answers.annexI_B)) {
      caveats.push(
        "Annex I (sectie B: transport/luchtvaart) valt grotendeels onder bestaande sectorale wetgeving. Controleer welke AI Act-bepalingen van toepassing zijn."
      );
    }
    // Annex I Section A — high-risk WITH third-party conformity assessment. When
    // the user can't tell ('unsure'), do NOT resolve high or not-high — surface a
    // verification caveat instead (audit #2; guardrail: don't resolve ambiguity up).
    if (hasAnyReal(answers.annexI_A)) {
      if (answers.thirdPartyConformity === "yes") isHigh = true;
      else if (answers.thirdPartyConformity === "unsure") {
        caveats.push(
          "Uw AI zit in een gereguleerd product (bijlage I). Of het hoog-risico is, hangt ervan af of dat product vóór de CE-markering door een aangemelde instantie (derde partij) wordt gekeurd — dat kon u niet aangeven. Zoek dit uit: is dat zo, dan gelden de hoog-risico plichten (Art. 6(1))."
        );
      }
    }

    // Annex III use-case areas (verification-only biometrics already carved out).
    if (hasAnyReal(annexIIIareas)) {
      const creditOrInsurance =
        has(answers.annexIII_subareas, "5b") || has(answers.annexIII_subareas, "5c");
      if (answers.profiling) {
        isHigh = true; // Art. 6(3) final subparagraph: profiling forces high-risk.
      } else if (creditOrInsurance) {
        isHigh = true; // credit scoring / life-health insurance pricing profiles natural persons.
        if (answers.art6_3_carveout) {
          // The derogation was claimed but cannot apply here — surface WHY instead
          // of silently disregarding the answer (traceability).
          caveats.push(
            "De Art. 6(3)-uitzondering die u aangaf geldt hier niet: kredietscoring en risico-/premiebepaling bij levens- of zorgverzekeringen beoordelen natuurlijke personen (profilering), en dan blijft het systeem altijd hoog-risico (Art. 6(3), laatste alinea)."
          );
        }
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

  // Art. 25 promotes a modifier to provider of a HIGH-RISK system only. Not the
  // high_notify (Art. 6(3) derogation) case — there the system is NOT high-risk,
  // so there is nothing to become provider OF (adversarial-verify finding C).
  if (pendingBecomeProvider && isHigh) roles.add("provider");

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
  // (Full Art. 2 exclusions already returned early above with the "excluded" tier.)
  if (!inScope) tiers.add("out_of_scope");
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
