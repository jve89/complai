// Drift guard: the product has TWO classifiers that encode the same AI-Act
// carve-outs in different representations — the structured scan engine
// (engine/profile, Annex III area codes) and the free-text register classifier
// (register/classify, regex). Both are enforced here against the SINGLE canonical
// source, lib/compliance/carveouts.ts, so a re-verified legal rule fixed in one
// can't silently drift from the other. Purely additive — no classification logic
// changed. Runs standalone:
//   npx tsx lib/compliance/__tests__/classifier-parity.test.ts
import { buildProfile } from "@/lib/compliance/profile";
import { classifyAiSystem } from "@/lib/register/classify";
import { CARVEOUTS, type CarveoutOutcome } from "@/lib/compliance/carveouts";
import type { ScanAnswers } from "@/lib/compliance/questions";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  const tag = cond ? "PASS" : "FAIL";
  if (!cond) failures++;
  console.log(`  [${tag}] ${name}${detail ? ` — ${detail}` : ""}`);
}

/** Minimal valid ScanAnswers with the required arrays defaulted to empty. */
function answers(over: Partial<ScanAnswers>): ScanAnswers {
  return {
    roles: ["deployer"],
    modifications: [],
    annexI_B: [],
    annexI_A: [],
    annexIII_areas: [],
    annexIII_subareas: [],
    scopeCriteria: ["established_eu"],
    gpaiSystemic: [],
    exclusions: [],
    prohibited: [],
    transparency: [],
    ...over,
  };
}

function engineOutcome(over: Partial<ScanAnswers>): CarveoutOutcome {
  const h = buildProfile(answers(over)).headline;
  if (h === "prohibited") return "prohibited";
  if (h === "high_risk") return "high";
  return "not_high";
}
function registerOutcome(text: string): CarveoutOutcome {
  const level = classifyAiSystem({ description: text }).level;
  if (level === "unacceptable") return "prohibited";
  if (level === "high") return "high";
  return "not_high";
}

console.log("Classifier parity vs lib/compliance/carveouts.ts:");
for (const c of CARVEOUTS) {
  const e = engineOutcome(c.structured);
  const r = registerOutcome(c.sample);
  check(`${c.label} (${c.article}) — engine → ${c.outcome}`, e === c.outcome, e);
  check(`${c.label} (${c.article}) — register → ${c.outcome}`, r === c.outcome, r);
  check(`${c.label} — engine and register agree`, e === r, `engine=${e} register=${r}`);
}

if (failures > 0) {
  console.error(`\n${failures} parity check(s) failed.`);
  process.exit(1);
}
console.log(`\n✓ Both classifiers match all ${CARVEOUTS.length} canonical carve-outs.`);
