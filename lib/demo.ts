// The public demo reuses the real dashboard, pointed at a fictional company that
// lives in the DB with representative data. getActiveCompany() returns this
// company for /demo/* requests (flagged by middleware), so every dashboard page
// renders exactly as it does for a real customer — just with demo data.

import type { Company, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { buildProfile } from "@/lib/compliance/profile";
import { evidenceFromAnswers } from "@/lib/compliance/evidence-from-answers";
import { materializeComplianceItems } from "@/lib/compliance/materialize";
import { buildDocument, type DocumentType } from "@/lib/documents/templates";
import type { ScanAnswers } from "@/lib/compliance/questions";

export const DEMO_COMPANY_NAME = "Demo Recruitment B.V.";

// A comprehensive case: an HR-tech company that BUILDS and DEPLOYS a high-risk AI
// recruitment tool (Annex III), offers a GPAI model, and runs a chatbot — so the
// demo exercises virtually the whole product (every document type, every module).
const DEMO_ANSWERS = {
  roles: ["provider", "deployer"],
  modifications: ["none"],
  annexI_B: ["none"],
  annexI_A: [],
  annexIII_areas: ["4"],
  annexIII_subareas: [],
  scopeCriteria: ["place_system", "established_eu", "place_gpai_model"],
  gpaiSystemic: ["none"],
  exclusions: [],
  prohibited: [],
  transparency: ["chatbot", "synthetic"],
  publicBodyOrService: true,
  size: "51-250",
  sector: "hr",
  companyName: DEMO_COMPANY_NAME,
  readiness: {
    training: "ja",
    policy: "deels",
    register: "ja",
    oversight: "deels",
    riskAssessment: "nee",
    transparency: "deels",
    logging: "deels",
    fria: "nee",
    techDoc: "deels",
  },
} as ScanAnswers;

/** Find-or-create the fictional demo company with its data. Idempotent. */
export async function getDemoCompany(): Promise<Company> {
  const existing = await prisma.company.findFirst({
    where: { name: DEMO_COMPANY_NAME },
  });
  if (existing) {
    // Self-heal: an older demo company (deployer-only, before the comprehensive
    // profile) is rebuilt so the demo always reflects the current showcase.
    if (existing.entityRoles.includes("provider")) {
      await ensureDemoData(existing);
      return existing;
    }
    // Users don't cascade on company delete (companyId is nullable) — remove them
    // first so their emails free up for the rebuilt demo.
    await prisma.user.deleteMany({ where: { companyId: existing.id } });
    await prisma.company.delete({ where: { id: existing.id } });
  }

  const profile = buildProfile(DEMO_ANSWERS, evidenceFromAnswers(DEMO_ANSWERS));

  const company = await prisma.company.create({
    data: {
      name: DEMO_COMPANY_NAME,
      size: "51-250",
      sector: "hr",
      // Top plan so the demo showcases the full document package (Audit-klaar).
      plan: "schaal",
      entityRoles: profile.entityRoles,
      riskTiers: profile.riskTiers,
      profileJson: profile as unknown as Prisma.InputJsonValue,
    },
  });

  await prisma.aiSystem.createMany({
    data: [
      {
        companyId: company.id,
        name: "TalentScan AI",
        vendor: "Recruitee",
        role: "deployer",
        riskLevel: "high",
        status: "review",
        description: "Geautomatiseerde voorselectie en rangschikking van sollicitanten (Annex III, gebied 4).",
      },
      {
        companyId: company.id,
        name: "ChatGPT",
        vendor: "OpenAI",
        role: "deployer",
        riskLevel: "limited",
        description: "Ondersteuning bij vacatureteksten en e-mails.",
      },
      {
        companyId: company.id,
        name: "Microsoft 365 Copilot",
        vendor: "Microsoft",
        role: "deployer",
        riskLevel: "limited",
        description: "AI-functies in Word, Outlook en Teams.",
      },
    ],
  });

  await prisma.employee.createMany({
    data: [
      { companyId: company.id, name: "Sanne de Vries", role: "admin", trainingCompleted: true },
      { companyId: company.id, name: "Tom Bakker", role: "manager", trainingCompleted: true },
      { companyId: company.id, name: "Priya Sharma", role: "employee", trainingCompleted: true },
      { companyId: company.id, name: "Lars Jansen", role: "employee", trainingCompleted: false },
      { companyId: company.id, name: "Fatima El Amrani", role: "employee", trainingCompleted: false },
    ],
  });

  await materializeComplianceItems(company.id, profile);
  await ensureDemoData(company);
  return company;
}

/** Idempotently ensures the demo company has fictional team members and a couple
 * of generated documents — also back-fills demo companies created before these
 * were added, without touching a real customer's data. */
async function ensureDemoData(company: Company): Promise<void> {
  const demoUsers = [
    { id: `${company.id}-u1`, email: "sanne@demo-recruitment.nl", name: "Sanne de Vries", role: "admin" as const },
    { id: `${company.id}-u2`, email: "tom@demo-recruitment.nl", name: "Tom Bakker", role: "manager" as const },
    { id: `${company.id}-u3`, email: "priya@demo-recruitment.nl", name: "Priya Sharma", role: "employee" as const },
    { id: `${company.id}-u4`, email: "lars@demo-recruitment.nl", name: "Lars Jansen", role: "employee" as const },
  ];
  // Keep the demo on the top plan so every document stays unlocked.
  if (company.plan !== "schaal") {
    await prisma.company.update({ where: { id: company.id }, data: { plan: "schaal" } });
  }

  const userCount = await prisma.user.count({ where: { companyId: company.id } });
  if (userCount === 0) {
    // Clear any orphaned demo users (from an earlier rebuild) so emails are free.
    await prisma.user.deleteMany({
      where: { email: { in: demoUsers.map((u) => u.email) } },
    });
    await prisma.user.createMany({
      data: demoUsers.map((u) => ({ ...u, companyId: company.id })),
    });
  }

  const docCount = await prisma.document.count({ where: { companyId: company.id } });
  if (docCount === 0) {
    const systems = await prisma.aiSystem.findMany({ where: { companyId: company.id } });
    for (const type of ["ai_policy", "risk_assessment"] as DocumentType[]) {
      await prisma.document.create({
        data: {
          companyId: company.id,
          type,
          version: 1,
          content: buildDocument(type, company, systems) as unknown as Prisma.InputJsonValue,
        },
      });
    }
  }
}
