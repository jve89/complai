import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function RegisterPage() {
  return (
    <ComingSoon
      title="AI-register"
      description="Beheer al uw AI-systemen en hun risicoclassificatie."
      bullets={[
        "Tabel met alle geregistreerde AI-systemen",
        "Toevoegen, bewerken en verwijderen van systemen",
        "Automatische risicoclassificatie op basis van Annex III",
        "Filteren op risiconiveau en status, export naar CSV",
      ]}
    />
  );
}
