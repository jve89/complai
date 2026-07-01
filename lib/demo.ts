// The public demo reuses the real dashboard, pointed at a fictional company that
// lives in the DB with representative data. getActiveCompany() returns this
// company for /demo/* requests (flagged by middleware), so every dashboard page
// renders exactly as it does for a real customer — just with demo data.

import type { Company, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { buildProfile } from "@/lib/compliance/profile";
import { evidenceFromAnswers } from "@/lib/compliance/evidence-from-answers";
import { materializeComplianceItems } from "@/lib/compliance/materialize";
import type { ScanAnswers } from "@/lib/compliance/questions";

export const DEMO_COMPANY_NAME = "Demo Recruitment B.V.";

// A mid-size HR team deploying AI candidate screening (Annex III, hoog risico)
// with some readiness in place — enough to make every module look alive.
const DEMO_ANSWERS = {
  roles: ["deployer"],
  modifications: ["none"],
  annexI_B: ["none"],
  annexI_A: [],
  annexIII_areas: ["4"],
  annexIII_subareas: [],
  scopeCriteria: ["established_eu"],
  gpaiSystemic: [],
  exclusions: [],
  prohibited: [],
  transparency: ["chatbot"],
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
  },
} as ScanAnswers;

/** Find-or-create the fictional demo company with its data. Idempotent. */
export async function getDemoCompany(): Promise<Company> {
  const existing = await prisma.company.findFirst({
    where: { name: DEMO_COMPANY_NAME },
  });
  if (existing) return existing;

  const profile = buildProfile(DEMO_ANSWERS, evidenceFromAnswers(DEMO_ANSWERS));

  const company = await prisma.company.create({
    data: {
      name: DEMO_COMPANY_NAME,
      size: "51-250",
      sector: "hr",
      plan: profile.recommendedTier,
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
  return company;
}
