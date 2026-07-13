// Complaint-register evidence builder. Pure, runs standalone:
//   npx tsx lib/klachten/__tests__/register.test.ts
import {
  buildComplaintsRegister,
  type ComplaintRow,
} from "@/lib/klachten/templates";
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

function row(over: Partial<ComplaintRow> = {}): ComplaintRow {
  return {
    subject: "Bezwaar tegen afwijzing",
    aiSystem: { name: "CV-screening tool" },
    status: "open",
    receivedAt: new Date("2027-01-15T00:00:00Z"),
    resolvedAt: null,
    ...over,
  };
}

console.log("Klachten — evidence register:");

// Article grounding + honesty framing (must be present in every register).
{
  const c = buildComplaintsRegister("Acme B.V.", []);
  const t = allText(c);
  check("title", c.title === "Klachtenprocedure & -register", c.title);
  check("cites Art. 85", t.includes("Art. 85"));
  check("cites Art. 27 lid 1(f)", t.includes("Art. 27 lid 1(f)"));
  check("has an external-route section (markttoezichthouder)", t.includes("markttoezichthouder"));
  check("Art 85 date present (2 augustus 2026)", t.includes("2 augustus 2026"));
  check(
    "carries the FRIA narrow-scope note (kredietscoring)",
    t.includes("kredietscoring")
  );
  check("carries the 'onder voorbehoud' caveat", t.includes("onder voorbehoud"));
}

// Empty register → a fallback fill-in field, no table.
{
  const c = buildComplaintsRegister("Acme B.V.", []);
  const sec2 = c.sections.find((s) => s.heading.startsWith("2."));
  check("empty → fallback fill-in field", (sec2?.fields?.length ?? 0) === 1);
  check("empty → no table", !sec2?.table);
}

// With complaints → the row is tabulated (subject + system + status label).
{
  const c = buildComplaintsRegister("Acme B.V.", [
    row({ subject: "Onterechte score", status: "escalated" }),
  ]);
  const sec2 = c.sections.find((s) => s.heading.startsWith("2."));
  const t = allText(c);
  check("complaint tabulated", Boolean(sec2?.table) && t.includes("Onterechte score"));
  check("linked system in table", t.includes("CV-screening tool"));
  check("status label rendered (Doorverwezen)", t.includes("Doorverwezen (Art. 85)"));
  check("with complaints → no fallback fill-in", !(sec2?.fields?.length));
}

console.log("");
if (failures === 0) {
  console.log("✓ All klachten checks passed.");
} else {
  console.log(`✗ ${failures} check(s) failed.`);
  process.exit(1);
}
