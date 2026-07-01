import { getActiveCompany } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { TIER_LABEL, TIER_ORDER, tierRank } from "@/lib/plan";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/dashboard/settings/profile-form";
import { BillingSection } from "@/components/dashboard/settings/billing-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { company } = await getActiveCompany();

  const planLabel = TIER_LABEL[TIER_ORDER[tierRank(company.plan)]];
  const hasSubscription = Boolean(company.stripeCustomerId);

  return (
    <>
      <PageHeader
        title="Instellingen"
        description="Beheer uw bedrijfsprofiel en abonnement."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bedrijfsprofiel</CardTitle>
            <CardDescription>
              Deze gegevens worden gebruikt in uw documenten en rapporten.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm company={company} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Abonnement & facturatie</CardTitle>
            <CardDescription>
              Bekijk uw plan en beheer uw betaalgegevens.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BillingSection
              planLabel={planLabel}
              planStatus={company.planStatus}
              hasSubscription={hasSubscription}
              renewsAt={company.planRenewsAt ? formatDate(company.planRenewsAt) : null}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
