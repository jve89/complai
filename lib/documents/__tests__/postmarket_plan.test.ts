// Post-market monitoringplan (Art 72) document builder. Pure, runs standalone:
//   npx tsx lib/documents/__tests__/postmarket_plan.test.ts
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

const provider = {
  name: "MakerAI B.V.", entityRoles: ["provider"], profileJson: null,
} as unknown as Company;
const deployer = {
  name: "Gebruiker B.V.", entityRoles: ["deployer"], profileJson: null,
} as unknown as Company;
const highSystem = {
  name: "Kredietscoring", vendor: "MakerAI", role: "provider", riskLevel: "high",
} as unknown as AiSystem;

console.log("Post-market monitoringplan (Art 72) document:");

{
  const c = buildDocument("postmarket_plan", provider, [highSystem]);
  const t = allText(c);
  check("title cites Artikel 72", c.title.includes("Artikel 72"), c.title);
  check("provider intro branch", (c.intro ?? "").includes("Als aanbieder"));
  // Non-conflation with the DEPLOYER's Art 26(5) monitoring duty.
  check("distinguishes Art 26 lid 5 (deployer)", t.includes("Artikel 26 lid 5"));
  // Annex IV point 9 / tech-doc placement + Art 11 SME simplification.
  check("plan is Annex IV point 9 of the tech doc", t.includes("Annex IV") && t.includes("punt 9"));
  check("Art 11 mkb-simplification surfaced", t.includes("Artikel 11 lid 1"));
  // Commission template pending (don't imply a fixed format exists).
  check("flags Commission template by 2 feb 2026", t.includes("2 februari 2026"));
  // The Art 72 plan content is scaffolded.
  check("scope + proportionality (72 lid 1)", t.includes("Art. 72 lid 1"));
  check("data collection (72 lid 2)", t.includes("Art. 72 lid 2"));
  check("links follow-up to Art 20 / 73", t.includes("Artikel 20") && t.includes("Artikel 73"));
  check("sectoral carve-out (72 lid 4)", t.includes("Art. 72 lid 4"));
  // Date + caveats.
  check("2 Dec 2027 + voorbehoud caveat", t.includes("2 december 2027") && t.includes("onder voorbehoud"));
  check("geen juridisch advies", t.includes("geen juridisch advies"));
  check("high-risk system woven in table", t.includes("Kredietscoring"));
}

// Pure deployer → the "does not apply, see Art 26(5)" branch.
{
  const c = buildDocument("postmarket_plan", deployer, []);
  check("deployer intro warns Art 72 does not apply", (c.intro ?? "").includes("niet voor u"));
  check("deployer intro points to Art 26 lid 5", (c.intro ?? "").includes("Artikel 26 lid 5"));
}

console.log("");
if (failures === 0) {
  console.log("✓ All post-market plan checks passed.");
} else {
  console.log(`✗ ${failures} check(s) failed.`);
  process.exit(1);
}
