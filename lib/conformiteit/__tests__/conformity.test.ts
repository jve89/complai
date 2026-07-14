// Conformity-assessment tracker — step logic + evidence builder. Pure, standalone:
//   npx tsx lib/conformiteit/__tests__/conformity.test.ts
import {
  conformityProgress,
  stepStatus,
  STEP_KEYS,
  type StepsMap,
} from "@/lib/conformiteit/labels";
import { buildConformityEvidence, type ConformitySystemRow } from "@/lib/conformiteit/templates";
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

console.log("Conformity — step logic:");
check("6 fixed steps", STEP_KEYS.length === 6, String(STEP_KEYS.length));
check("missing step → todo", stepStatus({}, "techdoc") === "todo");
check("invalid value → todo", stepStatus({ techdoc: "bogus" } as unknown as StepsMap, "techdoc") === "todo");
check("read a set status", stepStatus({ qms: "done" }, "qms") === "done");
{
  const p = conformityProgress({ techdoc: "done", qms: "done", assessment: "in_progress" });
  check("progress counts only done", p.done === 2 && p.total === 6, `${p.done}/${p.total}`);
}
{
  const all: StepsMap = {};
  for (const k of STEP_KEYS) all[k] = "done";
  const p = conformityProgress(all);
  check("all done → 6/6", p.done === 6 && p.total === 6);
}

console.log("\nConformity — evidence document:");
{
  const rows: ConformitySystemRow[] = [
    { name: "Kredietscoring", vendor: "MakerAI", route: "notified_body", steps: { techdoc: "done", qms: "done" } },
  ];
  const c = buildConformityEvidence("MakerAI B.V.", rows);
  const t = allText(c);
  check("title cites Art. 43", c.title.includes("Art. 43"), c.title);
  check("cites Art 43/47/48/49", ["Art. 43", "Art. 47", "Art. 48", "Art. 49"].every((a) => t.includes(a)));
  check("route label rendered (Annex VII)", t.includes("Aangemelde instantie (Annex VII)"));
  check("provider-scope note present", t.includes("aanbieder"));
  check("EU-database exception note (Annex III punt 2)", t.includes("Annex III punt 2"));
  check("2 Dec 2027 + voorbehoud caveat", t.includes("2 december 2027") && t.includes("onder voorbehoud"));
  check("geen juridisch advies", t.includes("geen juridisch advies"));
  check("system woven in overview", t.includes("Kredietscoring"));
  check("per-system step section present", t.includes("Stappen — Kredietscoring"));
  check("progress 2/6 in overview", t.includes("2/6 stappen afgerond"));
}
// Empty state.
{
  const c = buildConformityEvidence("Acme B.V.", []);
  const sec1 = c.sections.find((s) => s.heading.startsWith("1."));
  check("empty → no overview table", !sec1?.table);
  check("empty → fallback fill-in", (sec1?.fields?.length ?? 0) === 1);
}

console.log("");
if (failures === 0) {
  console.log("✓ All conformity checks passed.");
} else {
  console.log(`✗ ${failures} check(s) failed.`);
  process.exit(1);
}
