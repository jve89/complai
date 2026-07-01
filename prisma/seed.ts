import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fixed ids so re-running the seed is idempotent (upsert by id).
const COMPANY_ID = "demo-company";
const ADMIN_ID = "demo-admin-user"; // mirrors a Supabase auth uid in real use

async function main() {
  const company = await prisma.company.upsert({
    where: { id: COMPANY_ID },
    update: {},
    create: {
      id: COMPANY_ID,
      name: "Demo Bedrijf B.V.",
      size: "11-50",
      sector: "Zakelijke dienstverlening",
      country: "NL",
    },
  });

  await prisma.user.upsert({
    where: { id: ADMIN_ID },
    update: {},
    create: {
      id: ADMIN_ID,
      email: "admin@demobedrijf.nl",
      name: "Sanne de Vries",
      role: "admin",
      companyId: company.id,
    },
  });

  // A couple of extra team members so the settings team table is populated.
  for (const member of [
    { id: "demo-user-tom", email: "tom@demobedrijf.nl", name: "Tom Bakker", role: "employee" as const },
    { id: "demo-user-priya", email: "priya@demobedrijf.nl", name: "Priya Sharma", role: "manager" as const },
  ]) {
    await prisma.user.upsert({
      where: { id: member.id },
      update: {},
      create: { ...member, companyId: company.id },
    });
  }

  // Reset child collections so the demo set stays exactly as described.
  await prisma.aiSystem.deleteMany({ where: { companyId: company.id } });
  await prisma.aiSystem.createMany({
    data: [
      {
        companyId: company.id,
        name: "ChatGPT (Enterprise)",
        description:
          "Generatieve AI-assistent voor tekst, gebruikt door marketing en support.",
        vendor: "OpenAI",
        role: "deployer",
        riskLevel: "limited",
        status: "active",
      },
      {
        companyId: company.id,
        name: "CV-screening tool",
        description:
          "Geautomatiseerde voorselectie van sollicitanten op basis van cv's.",
        vendor: "HireSmart",
        role: "deployer",
        riskLevel: "high", // Annex III — werving en selectie
        status: "review",
      },
      {
        companyId: company.id,
        name: "Sales-forecast model",
        description: "Intern voorspelmodel voor omzetprognoses.",
        vendor: "Intern ontwikkeld",
        role: "provider",
        riskLevel: "minimal",
        status: "active",
      },
    ],
  });

  // Sample scan result
  await prisma.scanResult.deleteMany({ where: { companyId: company.id } });
  await prisma.scanResult.create({
    data: {
      companyId: company.id,
      userId: ADMIN_ID,
      // Answer keys match the question ids in lib/scan/questions.ts so the
      // scoring engine reproduces this result (score ≈ 50, "gemiddeld").
      score: 50,
      answers: {
        size: "11-50",
        sector: "zakelijke-dienstverlening",
        usesAi: true,
        aiCategories: ["generatief", "werving"],
        highRisk: true,
        staffTrained: false,
        hasPolicy: false,
        hasRegister: true,
        informsUsers: false,
        hasOversight: true,
      },
    },
  });

  // Compliance items per AI Act article
  await prisma.complianceItem.deleteMany({ where: { companyId: company.id } });
  await prisma.complianceItem.createMany({
    data: [
      {
        companyId: company.id,
        article: "Art. 4",
        title: "AI-geletterdheid van medewerkers aantoonbaar borgen",
        status: "open",
        deadline: new Date("2026-09-30"),
      },
      {
        companyId: company.id,
        article: "Art. 5",
        title: "Toetsen op verboden AI-praktijken",
        status: "compliant",
      },
      {
        companyId: company.id,
        article: "Art. 50",
        title: "Transparantie richting gebruikers bij AI-interactie",
        status: "in_progress",
        deadline: new Date("2026-08-15"),
      },
      {
        companyId: company.id,
        article: "Art. 6",
        title: "Classificatie hoog-risico AI-systemen (Annex III)",
        status: "in_progress",
        deadline: new Date("2026-07-31"),
      },
    ],
  });

  // Employees / training overview
  await prisma.employee.deleteMany({ where: { companyId: company.id } });
  await prisma.employee.createMany({
    data: [
      {
        companyId: company.id,
        userId: ADMIN_ID,
        name: "Sanne de Vries",
        role: "manager",
        trainingCompleted: true,
      },
      {
        companyId: company.id,
        name: "Tom Bakker",
        role: "employee",
        trainingCompleted: false,
      },
      {
        companyId: company.id,
        name: "Priya Sharma",
        role: "admin",
        trainingCompleted: false,
      },
    ],
  });

  console.info("✅ Seed voltooid voor", company.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
