import { getActiveCompany } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
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

  // A cancel-at-period-end keeps the subscription active/trialing until it ends,
  // so planStatus alone can't show it. Read the live cancel state from Stripe
  // (best-effort — falls back to the stored renewal date if unreachable).
  let canceling = false;
  let accessOrRenewAt = company.planRenewsAt ? formatDate(company.planRenewsAt) : null;
  if (stripe && company.stripeSubscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(company.stripeSubscriptionId);
      if (sub.cancel_at_period_end || sub.cancel_at) {
        canceling = true;
        if (sub.cancel_at) accessOrRenewAt = formatDate(new Date(sub.cancel_at * 1000));
      }
    } catch {
      // Stripe unreachable — fall back to the stored plan fields.
    }
  }

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
              canceling={canceling}
              renewsAt={accessOrRenewAt}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
