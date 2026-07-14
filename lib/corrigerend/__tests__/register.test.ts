// Corrective-action register evidence builder. Pure, runs standalone:
//   npx tsx lib/corrigerend/__tests__/register.test.ts
import { buildCorrectiveRegister, type CorrectiveRow } from "@/lib/corrigerend/templates";
import type { DocumentContent } from "@/lib/documents/templates";

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

function row(over: Partial<CorrectiveRow> = {}): CorrectiveRow {
  return {
    title: "Model wijkt af van tech-doc",
    aiSystem: { name: "Kredietscoring" },
    actionType: "recall",
    presentsRisk: true,
    identifiedAt: new Date("2027-12-20T00:00:00Z"),
    resolvedAt: null,
    status: "open",
    ...over,
  };
}

console.log("Corrigerende maatregelen — evidence register:");
{
  const c = buildCorrectiveRegister("MakerAI B.V.", []);
  const t = allText(c);
  check("title cites Art. 20", c.title.includes("Art. 20"), c.title);
  check("cites Art. 20 lid 2 (authority)", t.includes("Art. 20 lid 2"));
  check("cites Art. 79 lid 1 risk threshold", t.includes("Art. 79 lid 1"));
  check("provider-scope note ('aanbieder')", t.includes("aanbieder"));
  check("2 Dec 2027 + voorbehoud caveat", t.includes("2 december 2027") && t.includes("onder voorbehoud"));
  check("geen juridisch advies", t.includes("geen juridisch advies"));
  const sec1 = c.sections.find((s) => s.heading.startsWith("1."));
  check("empty → no table", !sec1?.table);
  check("empty → fallback fill-in", (sec1?.fields?.length ?? 0) === 1);
}
{
  const c = buildCorrectiveRegister("MakerAI B.V.", [row({ actionType: "recall" })]);
  const t = allText(c);
  const sec1 = c.sections.find((s) => s.heading.startsWith("1."));
  check("with rows → table", Boolean(sec1?.table));
  check("action label rendered (Terugroepen)", t.includes("Terugroepen"));
  check("system woven in", t.includes("Kredietscoring"));
  check("Art 79(1) risk flagged in table", t.includes("Ja"));
  check("non-conformity title in table", t.includes("Model wijkt af van tech-doc"));
}

console.log("");
if (failures === 0) {
  console.log("✓ All corrigerend checks passed.");
} else {
  console.log(`✗ ${failures} check(s) failed.`);
  process.exit(1);
}
