// Drift guard: the product has TWO classifiers that encode the same AI-Act
// carve-outs in different representations — the structured scan engine
// (engine/profile, Annex III area codes) and the free-text register classifier
// (register/classify, regex). This test asserts they reach the SAME risk
// conclusion on the canonical carve-outs, so a re-verified legal rule fixed in
// one can't silently drift in the other (architecture-review domain-core finding).
// Purely additive — it changes no classification logic. Runs standalone:
//   npx tsx lib/compliance/__tests__/classifier-parity.test.ts
import { buildProfile } from "@/lib/compliance/profile";
import { classifyAiSystem } from "@/lib/register/classify";
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

type Bucket = "prohibited" | "high" | "not-high";

function engineBucket(a: ScanAnswers): Bucket {
  const h = buildProfile(a).headline;
  if (h === "prohibited") return "prohibited";
  if (h === "high_risk") return "high";
  return "not-high";
}
function registerBucket(text: string): Bucket {
  const level = classifyAiSystem({ description: text }).level;
  if (level === "unacceptable") return "prohibited";
  if (level === "high") return "high";
  return "not-high";
}

const SCENARIOS: {
  name: string;
  structured: Partial<ScanAnswers>;
  text: string;
  expect: Bucket;
}[] = [
  {
    name: "biometric 1:1 verification (login) → not high (Annex III 1(a) carve-out)",
    structured: { annexIII_areas: ["1"], biometricUse: "verification" },
    text: "vingerafdruk-login voor toegangscontrole",
    expect: "not-high",
  },
  {
    name: "biometric 1:many identification → high",
    structured: { annexIII_areas: ["1"], biometricUse: "identification" },
    text: "gezichtsherkenning op afstand in de winkel",
    expect: "high",
  },
  {
    name: "credit scoring → high (Annex III 5(b))",
    structured: { annexIII_areas: ["5"], annexIII_subareas: ["5b"] },
    text: "kredietwaardigheidsbeoordeling van klanten",
    expect: "high",
  },
  {
    name: "HR / recruitment → high (Annex III 4)",
    structured: { annexIII_areas: ["4"] },
    text: "CV-screening en werving van kandidaten",
    expect: "high",
  },
  {
    name: "emotion recognition at work → prohibited (Art. 5(1)(f))",
    structured: { prohibited: ["emotion_work_edu"] },
    text: "emotieherkenning bij werknemers op de werkvloer",
    expect: "prohibited",
  },
];

console.log("Classifier parity (structured engine vs free-text register):");
for (const s of SCENARIOS) {
  const e = engineBucket(answers(s.structured));
  const r = registerBucket(s.text);
  check(`${s.name} — engine`, e === s.expect, e);
  check(`${s.name} — register`, r === s.expect, r);
  check(`${s.name} — the two classifiers agree`, e === r, `engine=${e} register=${r}`);
}

if (failures > 0) {
  console.error(`\n${failures} parity check(s) failed.`);
  process.exit(1);
}
console.log("\n✓ Classifier parity holds on all canonical carve-outs.");
