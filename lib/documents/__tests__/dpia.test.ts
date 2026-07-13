// DPIA-koppeling document builder. Pure, runs standalone:
//   npx tsx lib/documents/__tests__/dpia.test.ts
import type { AiSystem, Company } from "@prisma/client";
import { buildDocument, type DocumentContent } from "@/lib/documents/templates";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  const tag = cond ? "PASS" : "FAIL";
  if (!cond) failures++;
  console.log(`  [${tag}] ${name}${detail ? ` — ${detail}` : ""}`);
}

function allText(c: DocumentContent): string {
  const parts = [c.title, c.subtitle ?? "", c.intro ?? ""];
  for (const s of c.sections) {
    parts.push(s.heading);
    parts.push(...(s.paragraphs ?? []));
    parts.push(...(s.bullets ?? []));
    parts.push(...(s.fields ?? []).map((f) => f.label));
    if (s.table) {
      parts.push(...s.table.headers);
      for (const row of s.table.rows) parts.push(...row);
    }
  }
  return parts.join("\n");
}

const company = {
  name: "Acme B.V.",
  entityRoles: [],
  profileJson: null,
} as unknown as Company;

const highSystem = {
  name: "CV-screening tool",
  vendor: "HireSmart",
  role: "deployer",
  riskLevel: "high",
} as unknown as AiSystem;

console.log("DPIA-koppeling document:");

{
  const c = buildDocument("dpia", company, [highSystem]);
  const t = allText(c);
  check("title mentions DPIA-koppeling", c.title.includes("DPIA-koppeling"), c.title);
  // Grounding: the DPIA duty is AVG (GDPR), the linkage is AI-Act.
  check("DPIA cited as AVG Art. 35", t.includes("AVG") && t.includes("Art. 35"));
  check("cites AI-Act Art. 26 lid 9 (use Art 13 info)", t.includes("Art. 26 lid 9"));
  check("cites AI-Act Art. 27 lid 4 (FRIA complements)", t.includes("Art. 27 lid 4"));
  check("references the provider's Art. 13 information", t.includes("Art. 13"));
  // Honesty guardrails.
  check("carries 'geen volledige DPIA' caveat", t.includes("geen volledige DPIA"));
  check("carries 'geen juridisch advies' caveat", t.includes("geen juridisch advies"));
  check("states the AVG duty is current ('geldt nu al')", t.includes("geldt nu al"));
  check("carries the 2 Dec 2027 + voorbehoud caveat", t.includes("2 december 2027") && t.includes("onder voorbehoud"));
  // Reuse of the company's AI dossier.
  check("high-risk system woven into the mapping table", t.includes("CV-screening tool"));
  // The AVG Art 35(7) content is left as the deployer's own fill-in.
  const sec3 = c.sections.find((s) => s.heading.includes("35 lid 7"));
  check("Art 35(7) section has fill-in fields", (sec3?.fields?.length ?? 0) >= 4);
}

// Without a high-risk system it still renders (a DPIA can apply to any AI
// processing personal data) — no table, general guidance instead.
{
  const c = buildDocument("dpia", company, []);
  const sec2 = c.sections.find((s) => s.heading.startsWith("2."));
  check("no high-risk → no systems table", !sec2?.table);
  check("no high-risk → still cites AVG Art. 35", allText(c).includes("Art. 35"));
}

console.log("");
if (failures === 0) {
  console.log("✓ All DPIA-koppeling checks passed.");
} else {
  console.log(`✗ ${failures} check(s) failed.`);
  process.exit(1);
}
