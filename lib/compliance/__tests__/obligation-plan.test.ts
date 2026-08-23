// Tests for obligationPlan() — the "uw verplichtingen" backbone.
// Standalone:  npx tsx lib/compliance/__tests__/obligation-plan.test.ts

import { obligationPlan } from "@/lib/compliance/obligation-plan";
import { buildProfile } from "@/lib/compliance/profile";
import { evidenceFromAnswers } from "@/lib/compliance/evidence-from-answers";
import type { ScanAnswers } from "@/lib/compliance/questions";
import type { ComplianceProfile, ObligationItem } from "@/lib/compliance/types";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) console.log(`  [PASS] ${name}`);
  else {
    failures++;
    console.log(`  [FAIL] ${name}${detail ? " — " + detail : ""}`);
  }
}

function ob(code: string, over: Partial<ObligationItem> = {}): ObligationItem {
  return { code, article: "Art. ?", title: code, description: "", status: "open", required: true, ...over };
}
function plan(obligations: ObligationItem[], recommendedTier: ComplianceProfile["recommendedTier"] = "starter") {
  return obligationPlan({ obligations, recommendedTier });
}

console.log("obligationPlan — minTier mapping (derived from real gates):");
{
  const r = plan(
    [
      ob("ART_50_CHATBOT", { required: false }), // document → transparency → starter
      ob("ART_4_LITERACY"), // training → groei
      ob("ART_27_FRIA"), // document → fria → groei
      ob("ART_5_PROHIBITED"), // process → null
    ],
    "groei"
  );
  const byCode = Object.fromEntries(r.rows.map((x) => [x.code, x]));
  check("Art. 4 (training) → minTier groei", byCode.ART_4_LITERACY.minTier === "groei", String(byCode.ART_4_LITERACY.minTier));
  check("Art. 50 chatbot (document) → minTier starter", byCode.ART_50_CHATBOT.minTier === "starter", String(byCode.ART_50_CHATBOT.minTier));
  check("Art. 27 FRIA (document) → minTier groei", byCode.ART_27_FRIA.minTier === "groei", String(byCode.ART_27_FRIA.minTier));
  check("Art. 5 (process) → minTier null", byCode.ART_5_PROHIBITED.minTier === null, String(byCode.ART_5_PROHIBITED.minTier));
  check("minTierLabel resolves (groei → Compliance)", byCode.ART_4_LITERACY.minTierLabel === "Compliance", String(byCode.ART_4_LITERACY.minTierLabel));
  check("recommendedTierLabel passthrough (groei → Compliance)", r.recommendedTierLabel === "Compliance", r.recommendedTierLabel);
}

console.log("obligationPlan — required obligations sort first:");
{
  const r = plan([ob("ART_50_CHATBOT", { required: false }), ob("ART_4_LITERACY", { required: true })]);
  check("required before advisory", r.rows[0].code === "ART_4_LITERACY" && r.rows[1].code === "ART_50_CHATBOT");
}

console.log("obligationPlan — integration with a real scan:");
{
  const answers: ScanAnswers = {
    roles: ["deployer"],
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
  const profile = buildProfile(answers, evidenceFromAnswers(answers));
  const r = obligationPlan(profile);
  const art4 = r.rows.find((x) => x.code === "ART_4_LITERACY");
  check("a plain AI-using deployer carries the Art. 4 obligation", !!art4);
  check("Art. 4 is training, gated at Compliance (groei)", !!art4 && art4.evidenceKind === "training" && art4.minTier === "groei");
  check("recommendedTier resolves to a real pakket", ["Scan", "Basis", "Compliance", "Audit"].includes(r.recommendedTierLabel), r.recommendedTierLabel);
}

console.log("");
if (failures === 0) console.log("✓ All obligation-plan checks passed.");
else {
  console.log(`✗ ${failures} check(s) failed.`);
  process.exit(1);
}
