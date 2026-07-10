/**
 * Seed the regulatory_updates table from SEED_UPDATES (idempotent: upsert by id,
 * never overwrites an existing row, so admin edits are preserved). Runs against
 * whatever DATABASE_URL points to.  Run: npx tsx scripts/seed-updates.ts
 */
import { PrismaClient } from "@prisma/client";

import { SEED_UPDATES } from "../lib/regulatory/updates";

const prisma = new PrismaClient();

async function main() {
  for (const u of SEED_UPDATES) {
    await prisma.regulatoryUpdate.upsert({
      where: { id: u.id },
      update: {}, // keep whatever is already there (don't clobber admin edits)
      create: {
        id: u.id,
        date: u.date,
        title: u.title,
        summary: u.summary,
        detail: u.detail ?? [],
        category: u.category,
        sourceLabel: u.source.label,
        sourceUrl: u.source.url,
        affectsEveryone: u.affects.everyone ?? false,
        affectsHighRisk: u.affects.highRisk ?? false,
        affectsProhibited: u.affects.prohibited ?? false,
        affectsLimited: u.affects.limited ?? false,
        affectsProvider: u.affects.provider ?? false,
        productImpact: u.productImpact ?? null,
        recert: u.recert ?? null,
        addedAt: u.addedAt ?? null,
        status: "published",
      },
    });
  }
  const count = await prisma.regulatoryUpdate.count();
  console.log(`✓ seeded — regulatory_updates now has ${count} row(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
