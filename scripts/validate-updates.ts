/**
 * Guardrail check for the regulatory-updates feed: every entry must cite a
 * PRIMARY source URL and be well-formed. A "we keep you current" feature is only
 * trustworthy if each claim is sourced. Run: npx tsx scripts/validate-updates.ts
 */
import { SEED_UPDATES as UPDATES, CATEGORY_LABEL } from "../lib/regulatory/updates";

let errors = 0;
const fail = (msg: string) => {
  errors++;
  console.error("  ✗ " + msg);
};

const ids = new Set<string>();
for (const u of UPDATES) {
  const c = `[${u.id}]`;
  if (ids.has(u.id)) fail(`${c} duplicate id`);
  ids.add(u.id);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(u.date) || isNaN(new Date(u.date + "T00:00:00Z").getTime()))
    fail(`${c} invalid date "${u.date}"`);
  if (u.addedAt !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(u.addedAt))
    fail(`${c} invalid addedAt "${u.addedAt}"`);
  if (!CATEGORY_LABEL[u.category]) fail(`${c} unknown category "${u.category}"`);
  if (!u.title || !u.summary) fail(`${c} missing title/summary`);
  if (!u.source?.label) fail(`${c} missing source label`);
  if (!/^https?:\/\//.test(u.source?.url ?? "")) fail(`${c} missing/invalid PRIMARY source URL`);
  const a = u.affects ?? {};
  if (!(a.everyone || a.highRisk || a.prohibited || a.limited || a.provider))
    fail(`${c} 'affects' matches nobody`);
}

if (errors) {
  console.error(`\n✗ ${errors} problem(s) found.`);
  process.exit(1);
}
console.log(`✓ ${UPDATES.length} regulatory updates valid (all primary-sourced).`);
