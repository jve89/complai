import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ScanAnswers } from "@/lib/compliance/questions";
import { ScanWizard } from "@/components/scan/scan-wizard";

export const dynamic = "force-dynamic";

export default async function ScanPage() {
  // For a logged-in user, pre-fill the wizard with their most recent answers so
  // re-running the scan from the dashboard means *editing* their case, not
  // starting over. Anonymous visitors get a blank wizard.
  let initialAnswers: ScanAnswers | undefined;
  const user = await getCurrentUser().catch(() => null);
  if (user?.company?.id) {
    const last = await prisma.scanResult.findFirst({
      where: { companyId: user.company.id },
      orderBy: { createdAt: "desc" },
    });
    if (last?.answers) initialAnswers = last.answers as unknown as ScanAnswers;
  }

  return <ScanWizard initialAnswers={initialAnswers} />;
}
