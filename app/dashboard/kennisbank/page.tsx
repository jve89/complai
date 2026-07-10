import { BookOpen } from "lucide-react";

import { getActiveCompany } from "@/lib/auth";
import { contentUnlocked, TIER_LABEL, CONTENT_MIN_TIER } from "@/lib/plan";
import { PageHeader } from "@/components/dashboard/page-header";
import { KennisbankContent } from "@/components/kennisbank-content";
import { UpgradeWall } from "@/components/dashboard/upgrade-wall";

export const dynamic = "force-dynamic";

export default async function DashboardKennisbankPage() {
  const { company } = await getActiveCompany();
  const unlocked = contentUnlocked(company.plan);

  return (
    <>
      <PageHeader
        title="Kennisbank"
        description="De EU AI-wet helder uitgelegd: risiconiveaus, deadlines, rollen en boetes."
      />
      {unlocked ? (
        <KennisbankContent />
      ) : (
        <UpgradeWall
          icon={BookOpen}
          title="De kennisbank is een betaalde functie"
          description="De EU AI Act helder uitgelegd — risiconiveaus, deadlines, rollen en boetes, altijd actueel. Ontgrendel met elk betaald pakket."
          tierLabel={TIER_LABEL[CONTENT_MIN_TIER]}
        />
      )}
    </>
  );
}
