import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BellRing,
  BookMarked,
  ExternalLink,
  Scale,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Kwaliteit & actualiteit",
  description:
    "Hoe ComplAI zijn inhoud juist en actueel houdt: primaire bronnen, meebewegen met de wet, toetsing vóór publicatie en eerlijke communicatie.",
  alternates: { canonical: "/kwaliteit" },
};

const pillars = [
  {
    icon: BookMarked,
    title: "Primaire bronnen",
    text: "We baseren ons op de officiële teksten: Verordening (EU) 2024/1689 en de publicaties van de Europese Commissie, de Raad en het Europees Parlement en het Publicatieblad — niet op tweedehands samenvattingen.",
  },
  {
    icon: BellRing,
    title: "We bewegen mee als de wet beweegt",
    text: "Verandert de wet, dan verandert het platform. Toen de Digital Omnibus in juni 2026 de hoog-risicodeadlines verschoof en twee nieuwe verboden toevoegde, werkten we de e-learning, de tijdlijn en de scan-deadlines bij — en ziet elke klant in het dashboard wat er is veranderd én wat wij hebben bijgewerkt.",
  },
  {
    icon: ShieldCheck,
    title: "Getoetst vóór het live gaat",
    text: "Onze inhoud wordt getoetst tegen de verordening voordat die live gaat. Elke quizvraag, elke artikelverwijzing en elke datum in de e-learning wordt gecontroleerd; klopt iets niet, dan gaat het niet mee.",
  },
  {
    icon: Scale,
    title: "Eerlijk over wat het is",
    text: "ComplAI is beslissingsondersteuning en AI-geletterdheid — geen juridisch advies. We zeggen 'dit is veranderd en dit hebben wij bijgewerkt', nooit 'u bent nu compliant'. Bij twijfel raden we aan een expert te betrekken.",
  },
];

const sources = [
  { label: "Verordening (EU) 2024/1689 (EU AI Act) — EUR-Lex", url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj" },
  { label: "Europese Commissie — AI Act", url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai" },
  { label: "Raad van de EU — Digital Omnibus (29 juni 2026)", url: "https://www.consilium.europa.eu/en/press/press-releases/2026/06/29/artificial-intelligence-council-gives-final-green-light-to-simplify-and-streamline-rules/" },
];

export default function QualityPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b bg-secondary/30 py-16 sm:py-20">
        <div className="container max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Kwaliteit &amp; actualiteit
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Compliance is alleen iets waard als het{" "}
            <span className="bg-gradient-to-r from-brand-500 to-violet-500 bg-clip-text text-transparent">
              klopt — en actueel blijft
            </span>
            .
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            De EU AI Act verandert. Daarom is ComplAI zo gebouwd dat de inhoud
            juist is, meebeweegt met de wet, en dat u kunt zien hóé we dat doen.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="grid gap-6 sm:grid-cols-2">
            {pillars.map((pil) => (
              <div key={pil.title} className="rounded-xl border bg-card p-6">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-navy-900 text-brand-400">
                  <pil.icon className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-base font-semibold">{pil.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pil.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Independent review — TODO(founders): add a named legal/AI reviewer and
          1–2 real customer testimonials here once available. Do NOT fabricate. */}
      <section className="border-t bg-secondary/30 py-16">
        <div className="container max-w-3xl space-y-4 text-[15px] leading-relaxed text-foreground/80">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Onafhankelijke toetsing
          </h2>
          <p>
            ComplAI is gebouwd door mensen met ervaring in AI en in
            compliance-zware sectoren — lees daarover op{" "}
            <Link href="/over-ons" className="font-medium text-brand-600 hover:underline">
              Over ons
            </Link>
            . We toetsen onze inhoud tegen de verordening en werken die bij zodra
            de wet verandert, zodat u niet op een verouderde uitleg bouwt.
          </p>
          <p className="text-sm text-muted-foreground">
            Vragen over hoe we tot een uitleg of datum komen? Neem gerust{" "}
            <Link href="/contact" className="font-medium text-brand-600 hover:underline">
              contact
            </Link>{" "}
            op — we onderbouwen het graag met de bron.
          </p>
        </div>
      </section>

      {/* Sources */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight">Bronnen die we volgen</h2>
          <ul className="mt-4 space-y-2">
            {sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:underline"
                >
                  {s.label} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-16">
        <div className="container max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Begin met een actuele blik op uw situatie
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Doe de gratis risicoscan — gebaseerd op de meest actuele tijdlijn,
            inclusief de wijzigingen van de Digital Omnibus.
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
