// Invariant matrix for the Phase B relevance layer (lib/compliance/relevance.ts).
// Pure — no DB. Runs standalone:  npx tsx lib/compliance/__tests__/relevance.test.ts
//
// Guards the Phase B design contract:
//  1. the recommended pakket unlocks every relevant-AND-legally-required surface;
//  2. relevance is LIVE (the AI-register flips it without a re-scan);
//  3. relevance ⟂ tier (surfaceRelevance never reads the plan);
//  4. nothing is ever hidden (surfaceState only ∈ {shown,locked,irrelevant});
//  5. the Art. 6(3) carve-out (high_notify) is never treated as high-risk.

import { buildProfile } from "@/lib/compliance/profile";
import { evidenceFromAnswers } from "@/lib/compliance/evidence-from-answers";
import { surfaceRelevance, surfaceState, type SurfaceKey } from "@/lib/compliance/relevance";
import { tierRank } from "@/lib/plan";
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
const profileOf = (a: ScanAnswers) => buildProfile(a, evidenceFromAnswers(a));

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  const tag = cond ? "PASS" : "FAIL";
  if (!cond) failures++;
  console.log(`  [${tag}] ${name}${detail ? ` — ${detail}` : ""}`);
}

// The six RISK-TRIGGERED legal-duty modules. `register` is excluded: it is a
// foundational product feature (paid from starter), not a conditional legal duty,
// so "applies" for it does not imply "legally required at that tier".
const DUTY_MODULES: SurfaceKey[] = [
  "meldingen",
  "kennisgevingen",
  "logbewaring",
  "klachten",
  "conformiteit",
  "corrigerend",
];

// ── Invariant 1 — recommended pakket unlocks every relevant duty module ──────
{
  console.log("Invariant 1 — recommended pakket unlocks relevant duty modules:");
  const matrix: { name: string; answers: ScanAnswers }[] = [
    { name: "minimal deployer", answers: base({ roles: ["deployer"], scopeCriteria: ["established_eu"] }) },
    { name: "limited chatbot deployer", answers: base({ roles: ["deployer"], scopeCriteria: ["established_eu"], transparency: ["chatbot"] }) },
    { name: "high-risk deployer (HR area 4)", answers: base({ roles: ["deployer"], scopeCriteria: ["established_eu"], annexIII_areas: ["4"] }) },
    { name: "credit deployer (5b, public body)", answers: base({ roles: ["deployer"], scopeCriteria: ["established_eu"], annexIII_areas: ["5"], annexIII_subareas: ["5b"], publicBodyOrService: true }) },
    { name: "high-risk provider (HR area 4)", answers: base({ roles: ["provider"], scopeCriteria: ["place_system"], annexIII_areas: ["4"] }) },
    { name: "high_notify (Art 6(3))", answers: base({ roles: ["deployer"], scopeCriteria: ["established_eu"], annexIII_areas: ["4"], art6_3_carveout: true }) },
    { name: "Annex I product provider", answers: base({ roles: ["provider"], scopeCriteria: ["place_system"], annexI_A: ["machinery"], thirdPartyConformity: "yes" }) },
  ];
  let allOk = true;
  for (const { name, answers } of matrix) {
    const p = profileOf(answers);
    const rel = surfaceRelevance(p, []);
    for (const k of DUTY_MODULES) {
      if (rel[k].applies && tierRank(p.recommendedTier) < tierRank(rel[k].requiredTier)) {
        allOk = false;
        console.log(`      ✗ ${name}: ${k} applies (needs ${rel[k].requiredTier}) but recommendedTier=${p.recommendedTier}`);
      }
    }
  }
  check("recommendedTier ≥ requiredTier for every relevant duty module", allOk);
}

// NB invariant 1 is intentionally SCAN-scoped (empty register): recommendedTier is
// frozen from the scan's required docs, so a register row that later adds
// provider/high-risk status the scan didn't capture can make a duty relevant beyond
// the recommendation. That live-vs-frozen divergence is handled by the PR8 re-scan
// nudge, not by relevance.ts — so it is deliberately not asserted here.

// ── Per-system pairing — role and risk must co-occur on the SAME register row ──
{
  console.log("Per-system pairing — no cross-product over-call:");
  const mixA = surfaceRelevance(null, [
    { role: "provider", riskLevel: "minimal" },
    { role: "deployer", riskLevel: "high" },
  ]);
  check("provides-minimal + deploys-high → NOT a provider duty", !mixA.conformiteit.applies && !mixA.corrigerend.applies);
  check("provides-minimal + deploys-high → IS a deployer duty", mixA.kennisgevingen.applies && mixA.logbewaring.applies && mixA.klachten.applies);
  const mixB = surfaceRelevance(null, [
    { role: "deployer", riskLevel: "minimal" },
    { role: "provider", riskLevel: "high" },
  ]);
  check("deploys-minimal + provides-high → IS a provider duty", mixB.conformiteit.applies && mixB.corrigerend.applies);
  check("deploys-minimal + provides-high → NOT a deployer duty", !mixB.kennisgevingen.applies && !mixB.logbewaring.applies && !mixB.klachten.applies);
  check("either high-risk party → meldingen relevant", mixA.meldingen.applies && mixB.meldingen.applies);
}

// ── Invariant 5 — high_notify (Art 6(3)) is NOT high-risk ────────────────────
{
  console.log("Invariant 5 — Art. 6(3) carve-out preserved:");
  const p = profileOf(base({ roles: ["deployer"], scopeCriteria: ["established_eu"], annexIII_areas: ["4"], art6_3_carveout: true }));
  const rel = surfaceRelevance(p, []);
  const noneApply = DUTY_MODULES.every((k) => !rel[k].applies);
  check("high_notify → no high-risk duty module is relevant", noneApply, p.riskTiers.join(","));
}

// ── Correct positive/negative role split ─────────────────────────────────────
{
  console.log("Role split — deployer vs provider duties:");
  const dep = surfaceRelevance(profileOf(base({ roles: ["deployer"], scopeCriteria: ["established_eu"], annexIII_areas: ["4"] })), []);
  check("HR deployer → deployer modules relevant", dep.meldingen.applies && dep.kennisgevingen.applies && dep.logbewaring.applies && dep.klachten.applies);
  check("HR deployer → provider modules NOT relevant", !dep.conformiteit.applies && !dep.corrigerend.applies);
  const prov = surfaceRelevance(profileOf(base({ roles: ["provider"], scopeCriteria: ["place_system"], annexIII_areas: ["4"] })), []);
  check("HR provider → provider modules relevant", prov.conformiteit.applies && prov.corrigerend.applies);
}

// ── Invariant 2 — relevance is LIVE from the register (no re-scan) ────────────
{
  console.log("Invariant 2 — live register flips relevance without a re-scan:");
  // A deployer-only scan profile; conformiteit is not relevant from the scan.
  const p = profileOf(base({ roles: ["deployer"], scopeCriteria: ["established_eu"], annexIII_areas: ["4"] }));
  const before = surfaceRelevance(p, [])["conformiteit"].applies;
  const after = surfaceRelevance(p, [{ role: "provider", riskLevel: "high" }])["conformiteit"].applies;
  check("register provider+high flips conformiteit relevant", before === false && after === true);
}

// ── Invariant 3 — relevance ⟂ tier (surfaceRelevance never sees the plan) ─────
{
  console.log("Invariant 3 — relevance is independent of the pakket:");
  const p = profileOf(base({ roles: ["deployer"], scopeCriteria: ["established_eu"], annexIII_areas: ["4"] }));
  const rel = surfaceRelevance(p, []);
  const gratis = surfaceState(rel.kennisgevingen, "gratis");
  const groei = surfaceState(rel.kennisgevingen, "groei");
  check("relevant + low tier → locked", gratis === "locked");
  check("relevant + covered tier → shown", groei === "shown");
  check("not relevant → irrelevant regardless of plan", surfaceState(rel.conformiteit, "schaal") === "irrelevant");
}

// ── Invariant 4 — never hidden: surfaceState only yields the 3 states ─────────
{
  console.log("Invariant 4 — surfaceState never drops a surface:");
  const valid = new Set(["shown", "locked", "irrelevant"]);
  const p = profileOf(base({ roles: ["deployer"], scopeCriteria: ["established_eu"] }));
  const rel = surfaceRelevance(p, []);
  const allValid = (Object.keys(rel) as SurfaceKey[]).every((k) =>
    ["gratis", "starter", "groei", "schaal", null].every((plan) => valid.has(surfaceState(rel[k], plan as string | null)))
  );
  check("every surface × every plan → shown|locked|irrelevant", allValid);
}

// ── register foundational behaviour ──────────────────────────────────────────
{
  console.log("Register — foundational:");
  check("no scan yet → register relevant", surfaceRelevance(null, [])["register"].applies === true);
  const excluded = profileOf(base({ roles: ["deployer"], scopeCriteria: ["established_eu"], exclusions: ["research"] }));
  check("out-of-scope (excluded) → register de-emphasized", surfaceRelevance(excluded, [])["register"].applies === false);
}

console.log("");
if (failures === 0) {
  console.log("✓ All relevance-layer invariants passed.");
} else {
  console.log(`✗ ${failures} check(s) failed.`);
  process.exit(1);
}
