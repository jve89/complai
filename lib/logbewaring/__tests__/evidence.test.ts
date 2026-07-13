// Log-retention status logic + evidence builder. Pure, runs standalone:
//   npx tsx lib/logbewaring/__tests__/evidence.test.ts
import { logStatus, MIN_RETENTION_MONTHS } from "@/lib/logbewaring/labels";
import {
  buildLogRetentionEvidence,
  type LogRetentionSystem,
} from "@/lib/logbewaring/templates";
import type { DocumentContent } from "@/lib/documents/templates";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  const tag = cond ? "PASS" : "FAIL";
  if (!cond) failures++;
  console.log(`  [${tag}] ${name}${detail ? ` — ${detail}` : ""}`);
}

/** Flatten every string in a DocumentContent (incl. table cells) for substring checks. */
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

function sys(over: Partial<LogRetentionSystem> = {}): LogRetentionSystem {
  return {
    name: "CV-selectie",
    vendor: "HireSmart",
    logLocation: null,
    logRetentionMonths: null,
    logRetentionOwner: null,
    logReviewedAt: null,
    ...over,
  };
}

console.log("Logbewaring — status logic:");
check("no location → missing", logStatus(sys()) === "missing");
check(
  "location + 3 months → under_min",
  logStatus(sys({ logLocation: "Azure", logRetentionMonths: 3 })) === "under_min"
);
check(
  "location + 12 months → ok",
  logStatus(sys({ logLocation: "Azure", logRetentionMonths: 12 })) === "ok"
);
check(
  "location + no months → ok (months is a warning, not a blocker)",
  logStatus(sys({ logLocation: "Azure", logRetentionMonths: null })) === "ok"
);
check(
  `boundary: exactly ${MIN_RETENTION_MONTHS} months → ok`,
  logStatus(sys({ logLocation: "Azure", logRetentionMonths: MIN_RETENTION_MONTHS })) === "ok"
);

console.log("\nLogbewaring — evidence document:");
{
  const documented = sys({
    logLocation: "Azure-tenant EU-West",
    logRetentionMonths: 12,
    logRetentionOwner: "IT-beheer",
    logReviewedAt: new Date("2027-12-01T00:00:00Z"),
  });
  const c = buildLogRetentionEvidence("Acme B.V.", [documented]);
  const t = allText(c);
  check("title", c.title === "Logbewaringsbeleid (Art. 26 lid 6)", c.title);
  check("cites Art. 26 lid 6", t.includes("Art. 26 lid 6"));
  check("states the ≥6-month rule", t.includes("zes maanden"));
  check("carries applies-from caveat", t.includes("2 december 2027"));
  check("carries the 'under their control' honesty note", t.includes("onder uw controle"));
  check("documented system woven into the table", t.includes("Azure-tenant EU-West") && t.includes("IT-beheer"));
  check("documented system has NO fill-in field", !(c.sections.find(s => s.heading.startsWith("2."))?.fields?.length));
}
{
  // Undocumented high-risk system → gets a ruled fill-in field.
  const c = buildLogRetentionEvidence("Acme B.V.", [sys({ name: "Kredietscoring" })]);
  const sec2 = c.sections.find((s) => s.heading.startsWith("2."));
  check("undocumented system gets a fill-in field", (sec2?.fields?.length ?? 0) === 1);
  check("fill-in field names the system", allText(c).includes("Kredietscoring — bewaarplaats"));
}
{
  // No high-risk systems → a fallback fill-in + the "geen systemen" note.
  const c = buildLogRetentionEvidence("Acme B.V.", []);
  const sec2 = c.sections.find((s) => s.heading.startsWith("2."));
  check("empty → fallback fill-in field", (sec2?.fields?.length ?? 0) === 1);
  check("empty → no table", !sec2?.table);
}

console.log("");
if (failures === 0) {
  console.log("✓ All logbewaring checks passed.");
} else {
  console.log(`✗ ${failures} check(s) failed.`);
  process.exit(1);
}
