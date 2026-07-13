// Art 73 reporting-deadline logic. Pure, runs standalone:
//   npx tsx lib/meldingen/__tests__/deadline.test.ts
import { reportDeadlineDays, reportDeadline } from "@/lib/meldingen/labels";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  const tag = cond ? "PASS" : "FAIL";
  if (!cond) failures++;
  console.log(`  [${tag}] ${name}${detail ? ` — ${detail}` : ""}`);
}

console.log("Art 73 reporting deadlines:");

// Default serious incident (health, no death, not widespread) → 15 days, Art 73(2)
{
  const r = reportDeadlineDays({ category: "health", involvesDeath: false, widespread: false });
  check("default serious incident → 15 days (Art 73(2))", r.days === 15 && r.basis === "Art. 73(2)", `${r.days}/${r.basis}`);
}
// Fundamental rights, no death → 15 days
{
  const r = reportDeadlineDays({ category: "fundamental_rights", involvesDeath: false, widespread: false });
  check("fundamental-rights, no death → 15 days", r.days === 15, `${r.days}`);
}
// Death of a person → 10 days, Art 73(4)
{
  const r = reportDeadlineDays({ category: "health", involvesDeath: true, widespread: false });
  check("death of a person → 10 days (Art 73(4))", r.days === 10 && r.basis === "Art. 73(4)", `${r.days}/${r.basis}`);
}
// Critical infrastructure (Art 3(49)(b)) → 2 days, Art 73(3)
{
  const r = reportDeadlineDays({ category: "critical_infra", involvesDeath: false, widespread: false });
  check("critical infrastructure → 2 days (Art 73(3))", r.days === 2 && r.basis === "Art. 73(3)", `${r.days}/${r.basis}`);
}
// Widespread infringement (any category) → 2 days, Art 73(3)
{
  const r = reportDeadlineDays({ category: "property_env", involvesDeath: false, widespread: true });
  check("widespread infringement → 2 days (Art 73(3))", r.days === 2 && r.basis === "Art. 73(3)", `${r.days}/${r.basis}`);
}
// Both death AND critical-infra/widespread → the earliest (2-day) cap binds
{
  const r = reportDeadlineDays({ category: "critical_infra", involvesDeath: true, widespread: true });
  check("death + critical/widespread → earliest 2-day cap wins", r.days === 2, `${r.days}`);
}
// reportDeadline = awareAt + cap
{
  const aware = new Date("2026-07-01T00:00:00Z");
  const d = reportDeadline(aware, { category: "health", involvesDeath: false, widespread: false });
  check("reportDeadline adds the cap to awareAt", d.toISOString().slice(0, 10) === "2026-07-16", d.toISOString());
}

console.log("");
if (failures === 0) {
  console.log("✓ All Art 73 deadline checks passed.");
} else {
  console.log(`✗ ${failures} check(s) failed.`);
  process.exit(1);
}
