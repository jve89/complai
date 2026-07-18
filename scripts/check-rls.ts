// CI guard: every table declared in schema.prisma (via @@map) must enable ROW
// LEVEL SECURITY somewhere in prisma/migrations. This is the check that would
// have caught the init/baseline RLS drift (fixed in the
// 20260718120000_enable_rls_remaining_tables migration). RLS is the only thing
// keeping the public Supabase anon key out of these tables via PostgREST; the
// app itself uses the service role, which bypasses RLS.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const schema = readFileSync("prisma/schema.prisma", "utf8");
const tables = Array.from(schema.matchAll(/@@map\("([^"]+)"\)/g), (m) => m[1]);

const migDir = "prisma/migrations";
let sql = "";
for (const entry of readdirSync(migDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  try {
    sql += readFileSync(join(migDir, entry.name, "migration.sql"), "utf8") + "\n";
  } catch {
    /* directory without a migration.sql (e.g. migration_lock) */
  }
}

const missing = tables.filter(
  (t) => !new RegExp(`ALTER TABLE "${t}" ENABLE ROW LEVEL SECURITY`).test(sql)
);

if (missing.length) {
  console.error(
    "RLS check FAILED — these tables never enable ROW LEVEL SECURITY in prisma/migrations:\n" +
      missing.map((t) => "  - " + t).join("\n") +
      '\n\nAdd `ALTER TABLE "<table>" ENABLE ROW LEVEL SECURITY;` in a migration.'
  );
  process.exit(1);
}
console.log(`RLS check OK — all ${tables.length} tables enable RLS in migrations.`);
