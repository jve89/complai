// Regression matrix for the Scan v2 engine + scoring. Pure functions only (no DB),
// so it runs standalone:  npx tsx lib/compliance/__tests__/profile.test.ts
//
// Guards the four reported bugs:
//  1. score is never a flat 0 for an anonymous scan (readiness drives it);
//  2. ticking a prohibited box without an aggravating qualifier is NOT "Verboden";
//  3. an advisory-only chatbot deployer is recommended the FREE tier;
//  4. (progress bar is a pure UI function — covered by scanProgress monotonicity).

import { buildProfile } from "@/lib/compliance/profile";
import { classify } from "@/lib/compliance/engine";
import { evidenceFromAnswers } from "@/lib/compliance/evidence-from-answers";
import { docUnlocked } from "@/lib/plan";
import { scanProgress, visibleSteps } from "@/lib/scan/wizard";
import type { ScanAnswers } from "@/lib/compliance/questions";

function base(over: Partial<ScanAnswers> = {}): ScanAnswers {
  return {
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
    ...over,
  };
}

/** Build a profile the way the action does for an anonymous scan. */
function profileOf(answers: ScanAnswers) {
  return buildProfile(answers, evidenceFromAnswers(answers));
}

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  const tag = cond ? "PASS" : "FAIL";
  if (!cond) failures++;
  console.log(`  [${tag}] ${name}${detail ? ` — ${detail}` : ""}`);
}

// ── Row 1 — minimal deployer; readiness moves the score (Bug 1 + #3) ─────────
{
  const nee = profileOf(base({ roles: ["deployer"], scopeCriteria: ["established_eu"], readiness: { training: "nee" } }));
  const ja = profileOf(base({ roles: ["deployer"], scopeCriteria: ["established_eu"], readiness: { training: "ja" } }));
  console.log("Row 1 — minimal deployer (ChatGPT):");
  check("minimal headline", nee.headline === "minimal", nee.headline);
  check("score > 0 (never flat zero)", nee.score > 0, `score=${nee.score}`);
  check("training 'ja' beats 'nee'", ja.score > nee.score, `ja=${ja.score} > nee=${nee.score}`);
  check("recommended tier is free", nee.recommendedTier === "gratis", nee.recommendedTier);
}

// ── Row 2 — chatbot deployer → advisory only → FREE (Bug 3) ──────────────────
{
  const p = profileOf(base({ roles: ["deployer"], scopeCriteria: ["established_eu"], transparency: ["chatbot"] }));
  console.log("Row 2 — chatbot deployer:");
  check("limited_risk headline", p.headline === "limited_risk", p.headline);
  check("recommended tier is FREE (not starter)", p.recommendedTier === "gratis", p.recommendedTier);
}

// ── Row 3 — HR high-risk deployer → groei ────────────────────────────────────
{
  const p = profileOf(base({ roles: ["deployer"], scopeCriteria: ["established_eu"], annexIII_areas: ["4"], readiness: { riskAssessment: "ja" } }));
  console.log("Row 3 — HR screening (Annex III area 4) deployer:");
  check("high_risk headline", p.headline === "high_risk", p.headline);
  check("tier groei", p.recommendedTier === "groei", p.recommendedTier);
  check("score reflects risk_assessment done", p.score > 35, `score=${p.score}`);
}

// ── Row 3b — Annex III area + valid Art. 6(3) carve-out → high_notify, NOT high_risk ──
{
  const p = profileOf(base({ roles: ["deployer"], scopeCriteria: ["established_eu"], annexIII_areas: ["4"], art6_3_carveout: true }));
  console.log("Row 3b — Annex III area 4 with Art. 6(3) carve-out:");
  check("high_notify headline (not high_risk)", p.headline === "high_notify", p.headline);
  check("Art. 6(4) assessment is a required obligation", p.obligations.some((o) => o.code === "ART_6_4_ASSESSMENT"));
}

// ── Row 3c — biometrics, 1:1 VERIFICATION only → carve-out, NOT high-risk (Annex III 1(a)) ──
{
  const p = profileOf(base({ roles: ["deployer"], scopeCriteria: ["established_eu"], annexIII_areas: ["1"], biometricUse: "verification" }));
  console.log("Row 3c — biometric 1:1 verification (fingerprint login):");
  check("NOT high-risk (verification carve-out)", p.headline === "minimal", p.headline);
  check("Annex III 1(a) caveat present", p.caveats.some((c) => c.includes("1-op-1 verificatie")));
}

// ── Row 3d — biometrics, 1:many IDENTIFICATION → high-risk ───────────────────
{
  const p = profileOf(base({ roles: ["deployer"], scopeCriteria: ["established_eu"], annexIII_areas: ["1"], biometricUse: "identification" }));
  console.log("Row 3d — biometric 1:many identification:");
  check("high_risk headline", p.headline === "high_risk", p.headline);
}

// ── Row 4 — bank credit scoring deployer → high + FRIA ───────────────────────
{
  const p = profileOf(base({ roles: ["deployer"], size: "51-250", scopeCriteria: ["established_eu"], annexIII_areas: ["5"], annexIII_subareas: ["5b"] }));
  console.log("Row 4 — bank credit scoring (5b) deployer:");
  check("high_risk headline", p.headline === "high_risk", p.headline);
  check("FRIA is a required document", p.documents.required.some((d) => d.slug === "fria"));
  check("tier groei", p.recommendedTier === "groei", p.recommendedTier);
}

// ── Row 5 — provider of high-risk system → schaal ────────────────────────────
{
  const p = profileOf(base({ roles: ["provider"], scopeCriteria: ["place_system"], annexIII_areas: ["4"] }));
  console.log("Row 5 — provider of high-risk system:");
  check("high_risk headline", p.headline === "high_risk", p.headline);
  check("tier schaal", p.recommendedTier === "schaal", p.recommendedTier);
}

// ── Row 6 — prohibited WITH qualifier → prohibited, score capped ─────────────
{
  const p = profileOf(base({ roles: ["deployer"], scopeCriteria: ["established_eu"], prohibited: ["social_scoring"], prohibitedQualifiers: { socialScoringUnrelatedContext: true } }));
  console.log("Row 6 — social scoring WITH aggravating qualifier:");
  check("prohibited headline", p.headline === "prohibited", p.headline);
  check("score capped ≤ 20", p.score <= 20, `score=${p.score}`);
}

// ── Row 7 — prohibited WITHOUT qualifier → NOT prohibited (Bug 2) ────────────
{
  const p = profileOf(base({ roles: ["deployer"], scopeCriteria: ["established_eu"], prohibited: ["manipulation"] }));
  console.log("Row 7 — manipulation ticked WITHOUT qualifier:");
  check("NOT prohibited (de-escalated to caveat)", p.headline !== "prohibited", p.headline);
  check("a caveat was added", p.caveats.some((c) => c.includes("Manipulatieve")));
}

// ── Row 8 — real-time RBI WITHOUT qualifier → NOT prohibited (Bug 2 / #11) ────
{
  const p = profileOf(base({ roles: ["deployer"], scopeCriteria: ["established_eu"], prohibited: ["realtime_rbi"] }));
  console.log("Row 8 — real-time RBI ticked WITHOUT qualifier:");
  check("NOT prohibited (default is caveat, not a hard stop)", p.headline !== "prohibited", p.headline);
}

// ── Row 9 — out of scope → 100, free ─────────────────────────────────────────
{
  const p = profileOf(base({ roles: ["deployer"], scopeCriteria: ["none"] }));
  console.log("Row 9 — out of scope:");
  check("out_of_scope headline", p.headline === "out_of_scope", p.headline);
  check("score is 100", p.score === 100, `score=${p.score}`);
  check("tier gratis", p.recommendedTier === "gratis", p.recommendedTier);
}

// ── Row 10 — GPAI model provider → schaal ────────────────────────────────────
{
  const p = profileOf(base({ scopeCriteria: ["place_gpai_model"], gpaiSystemic: ["none"] }));
  console.log("Row 10 — GPAI model provider:");
  check("tier schaal", p.recommendedTier === "schaal", p.recommendedTier);
  check("GPAI provider obligation present", p.obligations.some((o) => o.code === "GPAI_PROVIDER"));
}

// ── Row 11 — chatbot PROVIDER → transparency required → Actief (starter) ─────
{
  const p = profileOf(base({ roles: ["provider"], scopeCriteria: ["place_system"], transparency: ["chatbot"] }));
  console.log("Row 11 — chatbot provider (transparency is a provider duty):");
  check("limited_risk headline", p.headline === "limited_risk", p.headline);
  check("transparency is a required document", p.documents.required.some((d) => d.slug === "transparency"));
  check("tier starter (Actief)", p.recommendedTier === "starter", p.recommendedTier);
}

// ── Invariant — the recommended pakket unlocks EVERY required document ────────
// This is the promise: advice never sends someone to a pakket that can't produce
// the documents that pakket is being recommended for.
{
  const scenarios: ScanAnswers[] = [
    base({ roles: ["deployer"], scopeCriteria: ["established_eu"], transparency: ["chatbot"] }),
    base({ roles: ["provider"], scopeCriteria: ["place_system"], transparency: ["chatbot", "synthetic"] }),
    base({ roles: ["deployer"], scopeCriteria: ["established_eu"], annexIII_areas: ["4"] }),
    base({ roles: ["deployer"], scopeCriteria: ["established_eu"], annexIII_areas: ["5"], annexIII_subareas: ["5b"], publicBodyOrService: true }),
    base({ roles: ["provider"], scopeCriteria: ["place_system"], annexIII_areas: ["4"] }),
    base({ roles: ["provider"], scopeCriteria: ["place_system"], annexI_A: ["machinery"], thirdPartyConformity: true }),
    base({ scopeCriteria: ["place_gpai_model"], gpaiSystemic: ["none"] }),
    base({ roles: ["deployer"], scopeCriteria: ["established_eu"], annexIII_areas: ["4"], art6_3_carveout: true }),
  ];
  console.log("Invariant — recommended pakket unlocks all required documents:");
  let ok = true;
  for (const a of scenarios) {
    const p = profileOf(a);
    for (const doc of p.documents.required) {
      if (!docUnlocked(p.recommendedTier, doc.slug)) {
        ok = false;
        console.log(`    MISS: '${doc.slug}' not unlocked by recommended '${p.recommendedTier}'`);
      }
    }
  }
  check("every required document is unlocked by the recommended pakket", ok);
}

// ── Progress bar monotonicity (Bug 4) ────────────────────────────────────────
{
  // Walk a high-risk path and confirm progress never decreases as steps advance.
  const answers = base({ roles: ["deployer"], scopeCriteria: ["established_eu"], annexIII_areas: ["4"], transparency: ["chatbot"], readiness: { training: "ja" } });
  const steps = visibleSteps(answers);
  let prev = -1;
  let monotonic = true;
  for (const s of steps) {
    const p = scanProgress(s);
    if (p < prev - 0.0001) monotonic = false;
    prev = p;
  }
  console.log("Progress bar:");
  check("scanProgress is monotonic across a branched flow", monotonic);
}

// ── Wave B — emotion at work/education (Art. 5(1)(f)) medical/safety exception ──
{
  const noQual = profileOf(
    base({ roles: ["deployer"], scopeCriteria: ["established_eu"], prohibited: ["emotion_work_edu"] })
  );
  const withQual = profileOf(
    base({
      roles: ["deployer"],
      scopeCriteria: ["established_eu"],
      prohibited: ["emotion_work_edu"],
      prohibitedQualifiers: { emotionMedicalSafetyException: true },
    })
  );
  console.log("Wave B — emotion recognition at work/education (Art. 5(1)(f)):");
  check("without the exception → prohibited headline", noQual.headline === "prohibited", noQual.headline);
  check(
    "without the exception → ART_5_PROHIBITED obligation",
    noQual.obligations.some((o) => o.code === "ART_5_PROHIBITED")
  );
  check("WITH medical/safety exception → NOT prohibited", withQual.headline !== "prohibited", withQual.headline);
  check(
    "WITH exception → no ART_5_PROHIBITED",
    !withQual.obligations.some((o) => o.code === "ART_5_PROHIBITED")
  );

  // The sub-question is only shown when emotion_work_edu is actually ticked.
  const shown = visibleSteps(base({ prohibited: ["emotion_work_edu"] })).some(
    (s) => s.qualifierKey === "emotionMedicalSafetyException"
  );
  const hidden = visibleSteps(base({ prohibited: ["none"] })).some(
    (s) => s.qualifierKey === "emotionMedicalSafetyException"
  );
  check("medical/safety sub-question shown when emotion_work_edu ticked", shown);
  check("medical/safety sub-question hidden otherwise", !hidden);
}

// ── Wave C — scope correctness (Art. 2 exclusions, Art. 4 ordering, Art. 25, §B) ──
{
  console.log("Wave C — scope correctness:");

  // #8 — Art. 4 for an entity that is provider ONLY via scope (place_system).
  const scopeProvider = classify(base({ roles: ["importer"], scopeCriteria: ["place_system"] }));
  check("#8 scope-derived provider still gets Art. 4", scopeProvider.emitted.some((e) => e.code === "ART_4_LITERACY"));
  check("#8 scope-derived provider role present", scopeProvider.entityRoles.includes("provider"));

  // #4 — research (Art. 2(6)) and personal (Art. 2(10)) route out of scope, no obligations.
  const research = classify(
    base({ roles: ["deployer"], scopeCriteria: ["established_eu"], annexIII_areas: ["4"], exclusions: ["research"] })
  );
  check("#4 research → excluded tier", research.riskTiers.includes("excluded"), research.riskTiers.join(","));
  check("#4 research → NO obligations (even with an Annex III area)", research.emitted.length === 0);
  // Art. 2(10) personal use is NARROWER — it lifts only deployer obligations, so
  // an Art. 5 prohibition still surfaces (adversarial-verify finding A).
  const personalProhibited = classify(
    base({ roles: ["deployer"], scopeCriteria: ["established_eu"], exclusions: ["personal"], prohibited: ["facial_scraping"] })
  );
  check("#4 personal does NOT suppress an Art. 5 prohibition", personalProhibited.emitted.some((e) => e.code === "ART_5_PROHIBITED"));
  check("#4 personal is not a full exclusion", !personalProhibited.riskTiers.includes("excluded"));

  // #5 — Annex I §B never flips to high-risk (Art. 2(2)); routes to sectoral law.
  const sectionB = classify(
    base({ roles: ["provider"], scopeCriteria: ["place_system"], annexI_B: ["aviation"], thirdPartyConformity: true })
  );
  check("#5 §B does NOT become high-risk", !sectionB.riskTiers.includes("high"));
  check("#5 §B emits no Chapter III provider set", !sectionB.emitted.some((e) => e.code === "ART_16_PROVIDER"));
  check("#5 §B adds the sectoral-law caveat", sectionB.caveats.some((c) => /sectorale wetgeving/i.test(c)));

  // #7 — Art. 25: a deployer who modifies a high-risk system becomes provider.
  const modifier = classify(
    base({ roles: ["deployer"], scopeCriteria: ["established_eu"], annexIII_areas: ["4"], modifications: ["substantial"] })
  );
  check("#7 modifying deployer promoted to provider", modifier.entityRoles.includes("provider"));
  check("#7 promoted modifier gets provider obligations", modifier.emitted.some((e) => e.code === "ART_16_PROVIDER"));
  const providerModifier = classify(
    base({ roles: ["provider"], scopeCriteria: ["place_system"], annexIII_areas: ["4"], modifications: ["substantial"] })
  );
  check("#7 provider who modifies emits Art. 25 handover", providerModifier.emitted.some((e) => e.code === "ART_25_HANDOVER"));
  // Finding C — a modifier claiming the Art. 6(3) derogation (high_notify, NOT
  // high-risk) must NOT be promoted to provider.
  const derogationModifier = classify(
    base({ roles: ["deployer"], scopeCriteria: ["established_eu"], annexIII_areas: ["4"], art6_3_carveout: true, modifications: ["substantial"] })
  );
  check("#7 high_notify (Art. 6(3)) modifier is NOT promoted to provider", !derogationModifier.entityRoles.includes("provider"));

  // #7 visibility — the modification step shows only under a high-risk signal.
  const modShown = visibleSteps(base({ annexIII_areas: ["4"] })).some((s) => s.field === "modifications");
  const modHidden = visibleSteps(base({ annexIII_areas: ["none"] })).some((s) => s.field === "modifications");
  check("#7 modification step shown under a high-risk signal", modShown);
  check("#7 modification step hidden otherwise", !modHidden);
}

console.log("");
if (failures === 0) {
  console.log("✓ All scan-v2 regression checks passed.");
} else {
  console.log(`✗ ${failures} check(s) failed.`);
  process.exit(1);
}
