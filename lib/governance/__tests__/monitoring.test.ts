// Art 26(5) post-market-monitoring kwartaalcheck. Pure, runs standalone:
//   npx tsx lib/governance/__tests__/monitoring.test.ts
import type { AiSystem } from "@prisma/client";
import { computeGovernance } from "@/lib/governance/score";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  const tag = cond ? "PASS" : "FAIL";
  if (!cond) failures++;
  console.log(`  [${tag}] ${name}${detail ? ` — ${detail}` : ""}`);
}

const NOW = new Date("2027-06-15T00:00:00Z");

/** Minimal computeGovernance input; only riskLevel + the incident/complaint
 *  status arrays matter for the monitoring check. */
function run(opts: {
  high: boolean;
  incidents?: { status: string }[];
  complaints?: { status: string }[];
}) {
  const aiSystems = (opts.high
    ? [{ riskLevel: "high" }]
    : [{ riskLevel: "limited" }]) as unknown as AiSystem[];
  const report = computeGovernance(
    {
      aiSystems,
      documents: [],
      employees: [],
      complianceItems: [],
      profile: null,
      incidents: opts.incidents ?? [],
      complaints: opts.complaints ?? [],
    },
    NOW
  );
  return report.checks.find((c) => c.id === "postmarket_monitoring");
}

console.log("Post-market monitoring (Art 26(5)) kwartaalcheck:");

// Gating: only appears for a high-risk deployer.
check("no high-risk system → check absent", run({ high: false }) === undefined);
{
  const c = run({ high: true });
  check("high-risk system → check present", !!c);
  check("label cites Art. 26(5)", !!c && c.label.includes("Art. 26(5)"));
}

// No incidents/complaints → done, full progress, "get ready" copy.
{
  const c = run({ high: true });
  check("no items → done", c?.done === true);
  check("no items → progress 1", c?.progress === 1);
  check("no items → 'Nog geen' copy", !!c?.detail.includes("Nog geen incidenten of klachten"));
}

// An open incident → not done, outstanding surfaced.
{
  const c = run({ high: true, incidents: [{ status: "open" }] });
  check("open incident → not done", c?.done === false);
  check("open incident → progress 0", c?.progress === 0);
  check("open incident → '1 openstaand' copy", !!c?.detail.includes("1 openstaand"));
}

// An in_progress complaint counts as outstanding.
{
  const c = run({ high: true, complaints: [{ status: "in_progress" }] });
  check("in_progress complaint → not done", c?.done === false);
}

// All handled (closed incident + resolved complaint) → done, progress 1.
{
  const c = run({
    high: true,
    incidents: [{ status: "closed" }],
    complaints: [{ status: "resolved" }],
  });
  check("all handled → done", c?.done === true);
  check("all handled → progress 1", c?.progress === 1);
  check("all handled → 'afgehandeld' copy", !!c?.detail.includes("afgehandeld"));
}

// Mixed: 1 of 2 outstanding → progress 0.5, not done.
{
  const c = run({
    high: true,
    incidents: [{ status: "open" }, { status: "closed" }],
  });
  check("1 of 2 outstanding → progress 0.5", c?.progress === 0.5, String(c?.progress));
  check("1 of 2 outstanding → not done", c?.done === false);
}

console.log("");
if (failures === 0) {
  console.log("✓ All post-market monitoring checks passed.");
} else {
  console.log(`✗ ${failures} check(s) failed.`);
  process.exit(1);
}
