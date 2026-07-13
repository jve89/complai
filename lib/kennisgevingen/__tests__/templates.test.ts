// Notice/explanation template builders. Pure, runs standalone:
//   npx tsx lib/kennisgevingen/__tests__/templates.test.ts
import { buildNoticeContent, type NoticeInput } from "@/lib/kennisgevingen/templates";
import type { DocumentContent } from "@/lib/documents/templates";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  const tag = cond ? "PASS" : "FAIL";
  if (!cond) failures++;
  console.log(`  [${tag}] ${name}${detail ? ` — ${detail}` : ""}`);
}

/** Flatten every string in a DocumentContent for substring assertions. */
function allText(c: DocumentContent): string {
  const parts = [c.title, c.subtitle ?? "", c.intro ?? ""];
  for (const s of c.sections) {
    parts.push(s.heading);
    parts.push(...(s.paragraphs ?? []));
    parts.push(...(s.bullets ?? []));
    parts.push(...(s.fields ?? []).map((f) => f.label));
  }
  return parts.join("\n");
}

function base(over: Partial<NoticeInput> = {}): NoticeInput {
  return {
    type: "worker",
    recipient: "Ondernemingsraad",
    detail: null,
    issuedAt: null,
    status: "draft",
    ...over,
  };
}

console.log("Kennisgeving templates:");

// Each type cites its own article, and only its own.
{
  const c = buildNoticeContent(base({ type: "worker" }), "Acme B.V.", null);
  const t = allText(c);
  check("worker → title", c.title === "Kennisgeving: inzet van AI op de werkvloer", c.title);
  check("worker → cites Art. 26 lid 7", t.includes("Art. 26 lid 7"));
  check("worker → does NOT cite Art. 86", !t.includes("Art. 86"));
}
{
  const c = buildNoticeContent(base({ type: "affected" }), "Acme B.V.", null);
  const t = allText(c);
  check("affected → cites Art. 26 lid 11", t.includes("Art. 26 lid 11"));
  check("affected → references Art. 86 (right to explanation)", t.includes("Art. 86"));
}
{
  const c = buildNoticeContent(base({ type: "explanation" }), "Acme B.V.", null);
  const t = allText(c);
  check("explanation → title", c.title === "Uitleg bij een besluit met AI-ondersteuning", c.title);
  check("explanation → cites Art. 86", t.includes("Art. 86"));
  check("explanation → carries the scope caveat (art. 22 AVG)", t.includes("art. 22 AVG"));
}

// Every notice carries the applies-from caveat (honesty guardrail).
{
  for (const type of ["worker", "affected", "explanation"] as const) {
    const c = buildNoticeContent(base({ type }), "Acme B.V.", null);
    check(`${type} → carries applies-from caveat`, allText(c).includes("2 december 2027"));
  }
}

// A linked system is woven into section 1; issued date appears in the intro.
{
  const c = buildNoticeContent(
    base({ type: "worker", status: "issued", issuedAt: new Date("2027-12-15T00:00:00Z") }),
    "Acme B.V.",
    { name: "CV-selectie", vendor: "HireSmart" }
  );
  check("system name woven in", allText(c).includes("CV-selectie"));
  check("issued date in intro", (c.intro ?? "").includes("Verstrekt op"));
}

// Explanation `detail` is printed into the hoofdelementen section.
{
  const c = buildNoticeContent(
    base({ type: "explanation", detail: "Score 0,42 onder de drempel." }),
    "Acme B.V.",
    null
  );
  check("explanation detail printed", allText(c).includes("Score 0,42 onder de drempel."));
}

// Worker/affected `detail` is an internal note — NOT printed.
{
  const c = buildNoticeContent(
    base({ type: "worker", detail: "INTERNE NOTITIE" }),
    "Acme B.V.",
    null
  );
  check("worker detail NOT printed", !allText(c).includes("INTERNE NOTITIE"));
}

console.log("");
if (failures === 0) {
  console.log("✓ All kennisgeving template checks passed.");
} else {
  console.log(`✗ ${failures} check(s) failed.`);
  process.exit(1);
}
