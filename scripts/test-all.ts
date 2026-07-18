// Runs every lib/**/__tests__/*.test.ts in its own tsx process and fails if any
// fail. Each test file is a standalone script that process.exit(1)s on failure,
// so we isolate them per-process rather than importing them into one runner
// (an import-based runner would be killed by the first failing file's exit).
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

function findTests(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findTests(p));
    else if (entry.name.endsWith(".test.ts")) out.push(p);
  }
  return out;
}

const tsxBin = join(
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tsx.cmd" : "tsx"
);
const tests = findTests("lib").sort();
const failed: string[] = [];

for (const t of tests) {
  process.stdout.write(`\n▶ ${t}\n`);
  try {
    execFileSync(tsxBin, [t], { stdio: "inherit" });
  } catch {
    failed.push(t);
  }
}

console.log(`\n${tests.length - failed.length}/${tests.length} test files passed`);
if (failed.length) {
  console.error("Failed:\n" + failed.map((f) => "  - " + f).join("\n"));
  process.exit(1);
}
