// Regression matrix for the Scan v2 engine + scoring. Pure functions only (no DB),
// so it runs standalone:  npx tsx lib/compliance/__tests__/profile.test.ts
//
// Guards the four reported bugs:
//  1. score is never a flat 0 for an anonymous scan (readiness drives it);
//  2. ticking a prohibited box without an aggravating qualifier is NOT "Verboden";
//  3. an advisory-only chatbot deployer is recommended the FREE tier;
//  4. (progress bar is a pure UI function — covered by scanProgress monotonicity).

import { buildProfile } from "@/lib/compliance/profile";
import { evidenceFromAnswers } from "@/lib/compliance/evidence-from-answers";
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

console.log("");
if (failures === 0) {
  console.log("✓ All scan-v2 regression checks passed.");
} else {
  console.log(`✗ ${failures} check(s) failed.`);
  process.exit(1);
}
