import { PageHeader } from "@/components/dashboard/page-header";
import { KennisbankContent } from "@/components/kennisbank-content";

export const dynamic = "force-dynamic";

export default function DashboardKennisbankPage() {
  return (
    <>
      <PageHeader
        title="Kennisbank"
        description="De EU AI-wet helder uitgelegd: risiconiveaus, deadlines, rollen en boetes."
      />
      <KennisbankContent />
    </>
  );
}
