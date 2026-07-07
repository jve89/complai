// Regression checks for the audit-report findings engine (rule-based, no LLM).
// Run: tsx lib/documents/__tests__/audit.test.ts
import { auditFinding, buildDocument } from "@/lib/documents/templates";

let failures = 0;
function check(label: string, cond: boolean, detail = "") {
  console.log(`  [${cond ? "PASS" : "FAIL"}] ${label}${detail ? ` — ${detail}` : ""}`);
  if (!cond) failures++;
}

const sys = (over: Partial<any>): any => ({
  id: "x",
  name: "Sys",
  vendor: "V",
  role: "deployer",
  riskLevel: "limited",
  description: null,
  status: "active",
  ...over,
});

console.log("auditFinding — per risk level:");
{
  const f = auditFinding(sys({ riskLevel: "unacceptable" }));
  check("unacceptable → rood + Art. 5", f.light === "rood" && f.legalBasis.includes("Art. 5"));
}
{
  const f = auditFinding(sys({ riskLevel: "high", role: "provider" }));
  check("high provider → oranje", f.light === "oranje");
  check(
    "high provider → remediation mentions conformity/registration",
    f.remediation.some((r) => r.includes("conformiteitsbeoordeling") || r.includes("EU-databank"))
  );
}
{
  const f = auditFinding(sys({ riskLevel: "high", role: "deployer" }));
  check(
    "high deployer → remediation is deployer-flavoured (Art. 26)",
    f.remediation.some((r) => r.includes("Art. 26"))
  );
}
{
  const f = auditFinding(sys({ riskLevel: "limited" }));
  check("limited → geel + Art. 50", f.light === "geel" && f.legalBasis.includes("Art. 50"));
}
{
  const f = auditFinding(sys({ riskLevel: "minimal" }));
  check("minimal → groen", f.light === "groen");
}

console.log("\nbuildDocument(audit_report) — structure:");
{
  const company: any = { name: "Testbedrijf B.V." };
  const systems = [
    sys({ name: "A", riskLevel: "high", role: "provider" }),
    sys({ name: "B", riskLevel: "limited" }),
    sys({ name: "C", riskLevel: "minimal" }),
  ];
  const doc = buildDocument("audit_report", company, systems);
  const headings = doc.sections.map((s) => s.heading);
  const findings = headings.filter((h) => h.startsWith("Bevinding"));
  check("title is the audit report", doc.title === "AI Act Readiness Audit");
  check("one finding per flagged (non-green) system → 2", findings.length === 2, `${findings.length}`);
  check("has a GROEN section", headings.some((h) => h.includes("in orde (GROEN)")));
  check("has the limitations/disclaimer section", headings.some((h) => h.includes("beperkingen")));
  const summary = doc.sections[0];
  check("summary table lists all 4 traffic lights", (summary.table?.rows.length ?? 0) === 4);
}

console.log(failures === 0 ? "\n✓ All audit-report checks passed." : `\n✗ ${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
