import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function DocumentsPage() {
  return (
    <ComingSoon
      title="Documenten"
      description="Genereer de verplichte AI Act-documenten met één klik."
      bullets={[
        "AI-beleid, risicobeoordeling, FRIA en transparantieverklaring",
        "Automatisch gevuld met uw bedrijfs- en registergegevens",
        "Download als PDF",
        "Versiebeheer per documenttype",
      ]}
    />
  );
}
