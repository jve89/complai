// Kwaliteitsmanagementsysteem (Art 17) document builder. Pure, runs standalone:
//   npx tsx lib/documents/__tests__/qms.test.ts
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
  name: "MakerAI B.V.",
  entityRoles: ["provider"],
  profileJson: null,
} as unknown as Company;

const deployer = {
  name: "Gebruiker B.V.",
  entityRoles: ["deployer"],
  profileJson: null,
} as unknown as Company;

const highSystem = {
  name: "Kredietscoring", vendor: "MakerAI", role: "provider", riskLevel: "high",
} as unknown as AiSystem;

console.log("Kwaliteitsmanagementsysteem (Art 17) document:");

{
  const c = buildDocument("qms", provider, [highSystem]);
  const t = allText(c);
  check("title cites Artikel 17", c.title.includes("Artikel 17"), c.title);
  // Provider gate + honesty framing.
  check("provider intro ('Als aanbieder')", (c.intro ?? "").includes("Als aanbieder"));
  check("role gate: deployer hoeft geen KMS", t.includes("hoeft geen KMS"));
  // Art 63 micro-simplification, correctly scoped + not a waiver.
  check("cites Artikel 63 lid 1 (micro-simplification)", t.includes("Artikel 63 lid 1"));
  check("micro only ('Micro-ondernemingen')", t.includes("Micro-ondernemingen"));
  check("63(2) preserves other duties", t.includes("Artikel 63 lid 2"));
  // The 13 Art 17(1)(a)-(m) elements are each present.
  for (const el of ["1(a)", "1(b)", "1(c)", "1(d)", "1(e)", "1(f)", "1(g)", "1(h)", "1(i)", "1(j)", "1(k)", "1(l)", "1(m)"]) {
    check(`element ${el} present`, t.includes(`Art. 17 lid ${el}`));
  }
  // Cross-referenced articles surfaced.
  check("links Art 9 / 72 / 73", t.includes("Artikel 9") && t.includes("Artikel 72") && t.includes("Artikel 73"));
  check("proportionality (17 lid 2)", t.includes("Artikel 17 lid 2"));
  check("financial carve-out (17 lid 4)", t.includes("Artikel 17 lid 4"));
  // Date + caveats.
  check("2 Dec 2027 + voorbehoud caveat", t.includes("2 december 2027") && t.includes("onder voorbehoud"));
  check("geen juridisch advies", t.includes("geen juridisch advies"));
  check("high-risk system woven in table", t.includes("Kredietscoring"));
}

// A pure deployer gets the "does not apply to you" branch.
{
  const c = buildDocument("qms", deployer, []);
  check("deployer intro warns it does not apply", (c.intro ?? "").includes("niet voor u"));
}

console.log("");
if (failures === 0) {
  console.log("✓ All QMS checks passed.");
} else {
  console.log(`✗ ${failures} check(s) failed.`);
  process.exit(1);
}
