import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function GovernancePage() {
  return (
    <ComingSoon
      title="Governance"
      description="Blijf continu in control met kwartaalchecks en signalen."
      bullets={[
        "Kwartaaloverzicht van vereiste compliance-checks",
        "Signalen voor verlopen documenten en ontbrekende certificaten",
        "Overzicht van openstaande compliance-items",
        "Governance-score in procenten",
      ]}
    />
  );
}
