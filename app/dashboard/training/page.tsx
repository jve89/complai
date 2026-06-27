import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function TrainingPage() {
  return (
    <ComingSoon
      title="E-learning"
      description="Borg AI-geletterdheid (Art. 4) met rolgerichte leerpaden."
      bullets={[
        "Leerpaden voor Medewerker, Manager en IT",
        "Vijf modules per pad met een afsluitende quiz",
        "Certificaat-PDF bij afronding",
        "Overzicht van voortgang per medewerker",
      ]}
    />
  );
}
