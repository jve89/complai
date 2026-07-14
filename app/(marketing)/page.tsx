import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  Clock,
  Database,
  Euro,
  FileText,
  GraduationCap,
  Languages,
  Minus,
  Package,
  Scale,
  ScanSearch,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Faq } from "@/components/marketing/faq";
import { StructuredData } from "@/components/marketing/structured-data";
import { PendingPublicationNote } from "@/components/pending-publication-note";
import { PLANS } from "@/lib/stripe";
import { formatEuro } from "@/lib/utils";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// The three ways to start — every klant doet ze uiteindelijk alle drie, de
// volgorde maakt niet uit. Each card has its own direct action.
const startSteps = [
  {
    icon: Search,
    title: "Doe de gratis risicoscan",
    text: "Zie in vijf minuten welke verplichtingen uit de AI Act op uw organisatie van toepassing zijn. Zonder account.",
    cta: { label: "Start de scan", href: "/scan" },
    primary: true,
  },
  {
    icon: Package,
    title: "Kies uw pakket",
    text: "Van een eenvoudige start tot een volledig documentendossier. U zegt maandelijks op en betaalt geen opstartkosten.",
    cta: { label: "Bekijk pakketten", href: "/pricing" },
  },
  {
    icon: UserPlus,
    title: "Maak een gratis account",
    text: "Een eigen compliance-omgeving, zonder dat u betaalgegevens invult. Uw collega's nodigt u later in een paar klikken uit.",
    cta: { label: "Registreer gratis", href: "/signup" },
  },
];

const pains = [
  {
    icon: AlertTriangle,
    title: "Regels die niemand overziet",
    text: "Honderden pagina's wettekst, vol risicoklassen en uitzonderingen. Waar begint u?",
  },
  {
    icon: Clock,
    title: "De tijd dringt",
    text: "De verplichtingen treden gefaseerd in werking. Wie te lang wacht, riskeert forse boetes.",
  },
  {
    icon: Euro,
    title: "Advies is prijzig",
    text: "Een extern adviestraject kost al snel duizenden euro's, terwijl veel van dat werk zich laat standaardiseren.",
  },
  {
    icon: FileText,
    title: "Geen zicht op wat er draait",
    text: "Welke AI draait er eigenlijk binnen uw organisatie? En wie draagt waarvoor de verantwoordelijkheid?",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Compliance-dashboard",
    text: "Uw gereedheidsscore, de stand per verplichting, wat er nog openstaat en welke deadlines eraan komen — alles op één scherm.",
  },
  {
    icon: Database,
    title: "AI-register",
    text: "Al uw AI-systemen bij elkaar, met per systeem een automatische risico-suggestie op basis van Annex III die u zelf bevestigt.",
  },
  {
    icon: ScanSearch,
    title: "Schaduw-AI-check",
    text: "Breng AI in kaart die nog nergens is vastgelegd. Juist dat gemis valt bij een controle als eerste op.",
  },
  {
    icon: FileText,
    title: "Documentgenerator",
    text: "Beleid, risicobeoordeling, FRIA en transparantieverklaring, meteen ingevuld met uw eigen gegevens.",
  },
  {
    icon: GraduationCap,
    title: "E-learning & certificaten",
    text: "Leerpaden per rol, met toetsen en certificaten, zodat u AI-geletterdheid (Art. 4) kunt aantonen.",
  },
  {
    icon: BarChart3,
    title: "Governance",
    text: "Kwartaalchecks plus meldingen zodra documenten verlopen of certificaten ontbreken. Zo houdt u doorlopend grip.",
  },
  {
    icon: BookOpen,
    title: "Kennisbank",
    text: "De AI Act in begrijpelijk Nederlands: risiconiveaus, rollen, deadlines en boetes, altijd binnen handbereik.",
  },
  {
    icon: Users,
    title: "Team & rollen",
    text: "Nodig collega's uit als beheerder, manager of medewerker, elk met een leerpad dat bij die rol past.",
  },
  {
    icon: Sparkles,
    title: "Meegroeien met de wet",
    text: "Naarmate de AI Act stap voor stap in werking treedt, werken wij de deadlines en verplichtingen in het platform bij. U werkt zo altijd met de meest actuele stand.",
  },
];

const comparisonRows = [
  { label: "Kosten", self: "Gratis (kost veel tijd)", consultant: "€ 5.000+", complai: "Vanaf € 19,99/mnd" },
  { label: "Doorlooptijd", self: "Weken", consultant: "Weken tot maanden", complai: "Dezelfde dag" },
  { label: "AI-register", self: false, consultant: true, complai: true },
  { label: "Automatische risico-suggestie", self: false, consultant: false, complai: true },
  { label: "Documenten (beleid, FRIA)", self: false, consultant: true, complai: true },
  { label: "E-learning & certificaten", self: false, consultant: false, complai: true },
  { label: "Doorlopende monitoring", self: false, consultant: false, complai: true },
  { label: "Groeit mee met de wet", self: false, consultant: false, complai: true },
];

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === "string") return <span className="text-sm">{value}</span>;
  return value ? (
    <Check className="mx-auto h-5 w-5 text-brand-600" />
  ) : (
    <Minus className="mx-auto h-5 w-5 text-muted-foreground/40" />
  );
}

export default function LandingPage() {
  return (
    <>
      <StructuredData />
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-white">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-15%] h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(124,58,237,0.16),rgba(99,102,241,0.10),transparent)] blur-2xl" />
        </div>
        <div className="container relative grid gap-14 py-20 lg:grid-cols-2 lg:items-center lg:py-32">
          <div className="space-y-7">
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              Van kracht sinds 2 februari 2025
            </Badge>
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              De AI-wet, vertaald naar{" "}
              <span className="bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent">
                wat ú moet doen
              </span>
              .
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
              De EU AI-wet geldt nu al en wordt stapsgewijs uitgebreid. Doe de
              gratis scan en zie binnen een paar minuten uw risicocategorie, uw rol
              en de deadlines die voor u gelden — plus een stappenplan dat u kunt
              afvinken. Zonder account, zonder advieskosten.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/scan">
                  Start gratis risicoscan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/#hoe-het-werkt">Bekijk hoe het werkt</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              In 5 minuten · zonder account · met PDF-rapport
            </p>
          </div>

          {/* Product preview */}
          <div className="relative">
            <div className="absolute inset-2 -z-10 rounded-[28px] bg-gradient-to-br from-brand-500/20 to-violet-500/20 blur-3xl" />
            <Image
              src="/hero-dashboard.png"
              alt="ComplAI-dashboard: gereedheidsscore, AI-register, verplichtingen en aankomende deadlines in één omgeving"
              width={1200}
              height={900}
              priority
              sizes="(min-width: 1024px) 600px, 100vw"
              className="h-auto w-full brightness-105"
            />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b bg-secondary/40">
        <div className="container grid grid-cols-2 gap-x-4 gap-y-3 py-4 text-center text-xs text-muted-foreground sm:grid-cols-4 sm:text-sm">
          <span className="flex items-center justify-center gap-1.5">
            <Scale className="h-4 w-4 shrink-0 text-brand-500" /> Gebaseerd op Verordening (EU) 2024/1689
          </span>
          <span className="flex items-center justify-center gap-1.5">
            <Clock className="h-4 w-4 shrink-0 text-brand-500" /> Deadlines volgens de officiële EU-tijdlijn (Art. 113)
          </span>
          <span className="flex items-center justify-center gap-1.5">
            <Languages className="h-4 w-4 shrink-0 text-brand-500" /> Volledig in het Nederlands
          </span>
          <span className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-brand-500" /> Uw antwoorden blijven binnen de EU
          </span>
        </div>
      </section>

      {/* Urgency */}
      <section className="border-b bg-navy-900 text-white">
        <div className="container py-16 sm:py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              De invoering is al begonnen
            </h2>
            <p className="mt-4 text-lg text-white/70">
              De AI Act treedt in fases in werking en de eerste verplichtingen gelden vandaag al.
              Wie op tijd begint, loopt niet achter de feiten aan.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: GraduationCap,
                title: "Al verplicht",
                text: "Sinds 2 februari 2025 geldt AI-geletterdheid (Art. 4) voor iedereen die met AI werkt.",
              },
              {
                icon: AlertTriangle,
                title: "Al verboden",
                text: "De praktijken die Art. 5 verbiedt, mogen sinds 2 februari 2025 niet meer.",
              },
              {
                icon: Clock,
                title: "Vanaf december 2027",
                text: "De zwaardere hoog-risicoverplichtingen (Annex III) worden dan van kracht, met de Digital Omnibus verschoven van augustus 2026.",
              },
              {
                icon: Scale,
                title: "Forse boetes",
                text: "Ernstige overtredingen kunnen oplopen tot € 35 miljoen of 7% van de wereldwijde jaaromzet.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/10 bg-white/5 p-6"
              >
                <item.icon className="h-7 w-7 text-brand-400" />
                <p className="mt-4 font-semibold">{item.title}</p>
                <p className="mt-1.5 text-sm text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
          <PendingPublicationNote className="mx-auto mt-8 max-w-2xl" />
          <div className="mt-10 flex flex-col items-center gap-3">
            <Button asChild size="lg">
              <Link href="/scan">
                Doe nu de gratis scan <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="max-w-2xl text-center text-xs text-white/50">
              Toepassingsdata volgens de officiële EU-tijdlijn (Art. 113).
              Wetgeving en deadlines kunnen wijzigen; we houden de data in het
              platform actueel. Dit is beslissingsondersteuning, geen juridisch advies.
            </p>
          </div>
        </div>
      </section>

      {/* Getting started — three interchangeable first steps */}
      <section id="hoe-het-werkt" className="py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              In drie stappen aan de slag
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              De volgorde bepaalt u zelf. Waar u ook start, alles komt samen in
              uw eigen dashboard.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {startSteps.map((step, i) => (
              <div
                key={step.title}
                className="relative flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="absolute right-5 top-5 text-4xl font-bold text-brand-500/25">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{step.text}</p>
                <Button
                  asChild
                  variant={step.primary ? "default" : "outline"}
                  className="mt-5 w-fit"
                >
                  <Link href={step.cta.href}>
                    {step.cta.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="border-y bg-secondary/50 py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Herkenbaar?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              De AI Act bezorgt veel organisaties hoofdbrekens. ComplAI neemt ze uit handen.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pains.map((pain) => (
              <div key={pain.title} className="rounded-xl border bg-card p-6">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <pain.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">{pain.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{pain.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="functies" className="py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Uw hele compliance op één plek
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Zodra u binnen bent, pakt u uw verplichtingen uit de AI Act
              stap voor stap aan en legt u onderweg vast wat u doet.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border bg-card p-6 transition-colors hover:border-brand-500/40"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-navy-900 text-brand-400">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-y bg-secondary/50 py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Zelf uitpluizen, een adviseur inschakelen of ComplAI?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Hetzelfde resultaat, zonder de kosten en de wachttijd van een
              adviesbureau.
            </p>
          </div>

          <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border bg-card">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-muted/40 text-sm">
                  <th className="p-4 font-medium">&nbsp;</th>
                  <th className="p-4 text-center font-medium">Zelf doen</th>
                  <th className="p-4 text-center font-medium">Consultant</th>
                  <th className="bg-brand-50 p-4 text-center font-semibold text-brand-700">
                    <span className="inline-flex items-center gap-1">
                      <Scale className="h-4 w-4" /> ComplAI
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label} className="border-b last:border-0">
                    <td className="p-4 text-sm font-medium">{row.label}</td>
                    <td className="p-4 text-center text-muted-foreground">
                      <CellValue value={row.self} />
                    </td>
                    <td className="p-4 text-center text-muted-foreground">
                      <CellValue value={row.consultant} />
                    </td>
                    <td className="bg-brand-50/50 p-4 text-center font-medium">
                      <CellValue value={row.complai} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="prijzen" className="py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Een pakket dat bij uw organisatie past
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              De scan is gratis en vraagt geen account. Betaalt u per jaar, dan krijgt u
              2 maanden gratis.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={
                  plan.highlighted
                    ? "relative flex h-full flex-col rounded-xl border-2 border-brand-500 bg-card p-6 shadow-lg"
                    : "flex h-full flex-col rounded-xl border bg-card p-6"
                }
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-6">Aanbevolen</Badge>
                )}
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="mt-2 text-3xl font-bold">
                  €{formatEuro(plan.monthly)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /mnd
                  </span>
                </p>
                <p className="mt-1 min-h-[1rem] text-xs font-medium text-brand-600">
                  {plan.monthly === 0 ? "Geen abonnement nodig" : "Maandelijks opzegbaar"}
                </p>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  {plan.tagline}
                </p>
                <Button
                  asChild
                  variant={plan.highlighted ? "default" : "outline"}
                  className="mt-4 w-full"
                >
                  <Link href="/pricing">Bekijk pakket</Link>
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Alle pakketten en de volledige functievergelijking vindt u op de{" "}
            <Link href="/pricing" className="font-medium text-primary hover:underline">
              prijzenpagina
            </Link>
            .
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t bg-secondary/50 py-20">
        <div className="container max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Veelgestelde vragen
            </h2>
          </div>
          <Faq />
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-navy-900 text-white">
        <div className="container py-20 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            In vijf minuten weet u precies waar u staat
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            Doe de gratis risicoscan en ontvang direct uw compliance-score met
            concrete vervolgstappen.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/scan">
              Start gratis risicoscan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
