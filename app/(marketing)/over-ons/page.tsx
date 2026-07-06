import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Plane, ScanSearch, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Over ons",
  description:
    "ComplAI vertaalt de EU AI Act naar heldere, aantoonbare stappen voor het Nederlandse mkb — vanuit een achtergrond in luchtvaartcompliance en AI.",
  alternates: { canonical: "/over-ons" },
};

const values = [
  {
    icon: ShieldCheck,
    title: "Eerlijk",
    text: "Beslissingsondersteuning, geen juridisch advies. We beloven niets wat we niet kunnen waarmaken en zetten alleen claims op de site die we kunnen onderbouwen.",
  },
  {
    icon: Plane,
    title: "Uit de praktijk",
    text: "Onze aanpak komt uit een sector waar compliance letterlijk over veiligheid gaat: concreet, controleerbaar en te vertrouwen als het erop aankomt.",
  },
  {
    icon: ScanSearch,
    title: "Voor het mkb",
    text: "Geen dure adviestrajecten of dikke rapporten. Een risicoscan, een AI-register, de juiste documenten en aantoonbare governance — begrijpelijk en betaalbaar.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b bg-secondary/30 py-16 sm:py-20">
        <div className="container max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Over ons
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Complexe regels werkbaar maken — dat leerde ik in de{" "}
            <span className="bg-gradient-to-r from-brand-500 to-violet-500 bg-clip-text text-transparent">
              luchtvaart
            </span>
            .
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            ComplAI vertaalt de EU AI Act naar heldere, aantoonbare stappen voor
            het Nederlandse mkb. Die aanpak komt niet uit de lucht vallen.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="container max-w-3xl space-y-6 text-[15px] leading-relaxed text-foreground/80">
          <p>
            Ik ben Johan van Erkel, oprichter van ComplAI. Mijn achtergrond ligt
            in <strong className="text-foreground">luchtvaartcompliance</strong> —
            een van de meest gereguleerde en veiligheidskritische sectoren die er
            bestaat. Daar leerde ik hoe je van een berg complexe regelgeving iets
            werkbaars maakt: concreet, aantoonbaar, en te vertrouwen wanneer het
            erop aankomt. In de luchtvaart is compliance geen bijzaak — het is de
            reden dat mensen veilig aankomen.
          </p>
          <p>
            Toen de EU AI Act eraan kwam, zag ik hetzelfde patroon. Nieuwe,
            ingrijpende regels. Stevige boetes. En organisaties die door de bomen
            het bos niet meer zien. Precies het probleem dat de luchtvaart
            decennia geleden al oploste — met duidelijke processen, checklists en
            documentatie in plaats van dure, ontoegankelijke rapporten.
          </p>
          <p>
            Ik combineer die compliance-ervaring met{" "}
            <strong className="text-foreground">diepgaande kennis van AI</strong>:
            hoe de techniek werkt, waar de risico&rsquo;s zitten en wat de wet er
            in de praktijk van vraagt. ComplAI is het resultaat — geen juridisch
            adviesbureau, maar een werkomgeving die de AI Act voor u ontwart en
            omzet in stappen die u zelf kunt zetten en aantonen.
          </p>
          <p>
            De missie is simpel: de AI Act begrijpelijk en behapbaar maken voor
            elke Nederlandse mkb-organisatie, zonder dat u een jurist of een duur
            adviestraject nodig heeft. Eerlijk over wat we wél en niet zijn, en
            met uw gegevens veilig binnen de EU.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="border-t bg-secondary/30 py-16">
        <div className="container max-w-4xl">
          <div className="grid gap-6 sm:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl border bg-card p-6">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-navy-900 text-brand-400">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Benieuwd waar u staat?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Doe de gratis risicoscan en ontdek in vijf minuten welke AI
            Act-verplichtingen voor uw organisatie gelden.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/scan">
                Doe de gratis risicoscan <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Neem contact op</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
