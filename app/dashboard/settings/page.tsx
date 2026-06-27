import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Instellingen"
      description="Beheer uw bedrijfsprofiel, team en abonnement."
      bullets={[
        "Bedrijfsprofiel: naam, omvang, sector en logo",
        "Teamleden uitnodigen en rollen toewijzen",
        "Abonnement en facturatie via Stripe",
      ]}
    />
  );
}
