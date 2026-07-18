// Validation for the untrusted anonymous-scan input. Runs standalone:
//   npx tsx lib/scan/__tests__/answers-schema.test.ts
// The critical guarantee: a valid wizard submission must ALWAYS parse (an
// over-strict schema would silently break the signup funnel), while garbage and
// abuse are rejected.
import { parseScanAnswers } from "@/lib/scan/answers-schema";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  const tag = cond ? "PASS" : "FAIL";
  if (!cond) failures++;
  console.log(`  [${tag}] ${name}${detail ? ` — ${detail}` : ""}`);
}

console.log("Scan-answers validation:");

// A full, representative valid wizard submission MUST parse.
{
  const valid = {
    companyName: "Acme B.V.",
    size: "11-50",
    sector: "zakelijke-dienstverlening",
    tools: ["chatgpt", "cv-screening"],
    useCases: ["werving"],
    decisionsAboutPeople: "ja",
    roles: ["deployer"],
    modifications: [],
    annexI_B: [],
    annexI_A: [],
    thirdPartyConformity: "no",
    annexIII_areas: ["4"],
    annexIII_subareas: [],
    art6_3_carveout: false,
    profiling: true,
    scopeCriteria: ["established_eu"],
    gpaiSystemic: [],
    exclusions: [],
    prohibited: [],
    prohibitedQualifiers: { emotionMedicalSafetyException: true },
    transparency: ["chatbot"],
    publicBodyOrService: false,
    readiness: { training: "nee", policy: "deels" },
    email: "user@example.com",
  };
  const p = parseScanAnswers(valid);
  check("a full valid wizard submission parses", p !== null);
  check("roles preserved", p?.roles.join() === "deployer", p?.roles.join());
  check("readiness preserved", p?.readiness?.training === "nee");
}

// The minimal wizard output (mostly empty arrays) must parse too.
check(
  "a minimal submission parses (defaults fill required arrays)",
  parseScanAnswers({ roles: [], scopeCriteria: [], annexIII_areas: [] }) !== null
);

// Unknown code strings are tolerated (lenient — the engine ignores them).
{
  const p = parseScanAnswers({ roles: ["deployer", "totally-made-up-role"], scopeCriteria: [] });
  check("unknown code strings are kept, not rejected", p !== null && p!.roles.length === 2);
}

// Garbage / abuse is rejected.
check("non-object input rejected", parseScanAnswers("not an object") === null);
check("null rejected", parseScanAnswers(null) === null);
check("array input rejected", parseScanAnswers([1, 2, 3]) === null);
check("wrong-typed field rejected (roles as string)", parseScanAnswers({ roles: "deployer" }) === null);
check(
  "oversized code array rejected",
  parseScanAnswers({ roles: [], scopeCriteria: Array(500).fill("x") }) === null
);
check("over-long code string rejected", parseScanAnswers({ roles: ["x".repeat(500)] }) === null);
{
  const p = parseScanAnswers({ roles: [], evil: "x" });
  check("unknown keys are stripped", p !== null && !("evil" in p));
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\n✓ All scan-answers validation checks passed.");
