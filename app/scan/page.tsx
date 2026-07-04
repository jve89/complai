import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ScanAnswers } from "@/lib/compliance/questions";
import { ScanWizard } from "@/components/scan/scan-wizard";

export const dynamic = "force-dynamic";

export default async function ScanPage() {
  // For a logged-in user, pre-fill the wizard so they never re-type what we
  // already know. Most recent scan → editing their case, not starting over.
  // No prior scan → seed the company basics captured at signup (name/size/
  // sector). Anonymous visitors get a blank wizard.
  let initialAnswers: ScanAnswers | undefined;
  const user = await getCurrentUser().catch(() => null);
  if (user?.company) {
    const last = await prisma.scanResult.findFirst({
      where: { companyId: user.company.id },
      orderBy: { createdAt: "desc" },
    });
    if (last?.answers) {
      initialAnswers = last.answers as unknown as ScanAnswers;
    } else {
      initialAnswers = {
        companyName: user.company.name || undefined,
        size: user.company.size || undefined,
        sector: user.company.sector || undefined,
      } as ScanAnswers;
    }
  }

  return <ScanWizard initialAnswers={initialAnswers} />;
}
