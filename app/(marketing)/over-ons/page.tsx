import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Plane, ScanSearch, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Over ons",
  description:
    "ComplAI zet de EU AI Act om in duidelijke, aantoonbare stappen voor het Nederlandse mkb — met wortels in AI en luchtvaartcompliance.",
  alternates: { canonical: "/over-ons" },
};

const values = [
  {
    icon: ShieldCheck,
    title: "Eerlijk",
    text: "Hulp bij uw beslissingen, geen juridisch advies. We doen geen beloften die we niet kunnen nakomen en plaatsen alleen claims op de site die we hard kunnen maken.",
  },
  {
    icon: Plane,
    title: "Uit de praktijk",
    text: "Onze methode komt uit een wereld waarin naleving letterlijk over mensenlevens gaat: concreet, verifieerbaar en betrouwbaar op het moment dat het telt.",
  },
  {
    icon: ScanSearch,
    title: "Voor het mkb",
    text: "Geen kostbare adviestrajecten of lijvige rapporten. Wél een risicoscan, een AI-register, de juiste documenten en aantoonbare governance — helder en betaalbaar.",
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
            Zware regelgeving hanteerbaar maken, met de nauwkeurigheid van de{" "}
            <span className="bg-gradient-to-r from-brand-500 to-violet-500 bg-clip-text text-transparent">
              luchtvaart
            </span>
            .
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            ComplAI zet de EU AI Act om in heldere stappen die u kunt aantonen, toegesneden op het Nederlandse mkb. Waar die aanpak vandaan komt, leest u hieronder.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="container max-w-3xl space-y-6 text-[15px] leading-relaxed text-foreground/80">
          <p>
            Achter ComplAI staan mensen die weten wat naleving in de praktijk vraagt. Ons team bracht jarenlang ervaring mee in zowel <strong className="text-foreground">AI</strong> als <strong className="text-foreground">luchtvaartcompliance</strong> — een van de strengst gereguleerde en meest veiligheidskritische sectoren die er zijn. Juist daar leer je hoe je een woud aan regels terugbrengt tot iets uitvoerbaars: concreet, aantoonbaar en betrouwbaar wanneer het er echt toe doet. In de luchtvaart is naleving nooit bijzaak — het is de reden dat mensen veilig op hun bestemming aankomen.
          </p>
          <p>
            De EU AI Act voelde meteen vertrouwd. Verstrekkende nieuwe regels, forse boetes en bedrijven die door de bomen het bos niet meer zien — het is exact het vraagstuk waar de luchtvaart decennia terug al een antwoord op vond. Niet met dikke, ontoegankelijke rapporten, maar met heldere processen, checklists en documentatie.
          </p>
          <p>
            Die twee werelden — grondige AI-kennis en bewezen compliance-discipline — komen samen in alles wat we maken. ComplAI is geen juridisch adviesbureau, maar een werkomgeving die de AI Act voor u ontrafelt en vertaalt naar stappen die u zelf zet en zelf kunt aantonen.
          </p>
          <p>
            Onze missie laat zich kort samenvatten: de AI Act begrijpelijk en uitvoerbaar maken voor elk Nederlands mkb-bedrijf, zonder jurist en zonder kostbaar adviestraject. Transparant over wat we wél en niet doen, en met uw gegevens veilig binnen de EU.
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
            Wilt u weten waar u staat?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Doe de gratis risicoscan en zie binnen een paar minuten welke verplichtingen uit de AI Act voor uw organisatie gelden.
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
