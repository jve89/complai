/**
 * Data-integrity check for the e-learning content. A wrong answer index in a
 * compliance quiz teaches the wrong law, so this runs as a guard:
 *   npx tsx scripts/validate-training.ts
 */
import { MODULES, PATH_MODULES, askCount, correctKey } from "../lib/training/content";

let errors = 0;
const fail = (msg: string) => {
  errors++;
  console.error("  ✗ " + msg);
};

for (const m of MODULES) {
  const ctx = `[${m.id}]`;
  if (!m.quiz.length) fail(`${ctx} has no questions`);
  if (m.drawCount && m.drawCount > m.quiz.length)
    fail(`${ctx} drawCount ${m.drawCount} > bank ${m.quiz.length}`);
  if (askCount(m) < 3) fail(`${ctx} asks only ${askCount(m)} questions`);

  m.quiz.forEach((q, i) => {
    const where = `${ctx} q${i + 1}`;
    if (q.options.length < 2) fail(`${where}: needs ≥2 options`);
    if (new Set(q.options).size !== q.options.length) fail(`${where}: duplicate options`);
    const key = correctKey(q);
    if (key.length === 0) fail(`${where}: no correct answer defined`);
    for (const k of key)
      if (k < 0 || k >= q.options.length) fail(`${where}: answer index ${k} out of range`);
    if (q.answer !== undefined && q.answers)
      fail(`${where}: has both answer and answers — pick one`);
  });
}

// Every path references only real modules.
for (const [path, ids] of Object.entries(PATH_MODULES))
  for (const id of ids)
    if (!MODULES.find((m) => m.id === id)) fail(`path ${path} references missing module ${id}`);

if (errors) {
  console.error(`\n✗ ${errors} problem(s) found.`);
  process.exit(1);
}
console.log(`✓ ${MODULES.length} modules valid (${MODULES.reduce((n, m) => n + m.quiz.length, 0)} questions).`);
