import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Check,
  ClipboardList,
  Clock,
  Database,
  Euro,
  FileText,
  GraduationCap,
  Layers,
  Minus,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Faq } from "@/components/marketing/faq";
import { PLANS } from "@/lib/stripe";

const steps = [
  { icon: Search, title: "Scan", text: "Breng uw AI-risico's in 5 minuten in kaart." },
  { icon: ClipboardList, title: "Registreer", text: "Leg al uw AI-systemen vast in één register." },
  { icon: Layers, title: "Classificeer", text: "Bepaal automatisch het risiconiveau per systeem." },
  { icon: FileText, title: "Documenteer", text: "Genereer beleid, FRIA en beoordelingen met één klik." },
  { icon: GraduationCap, title: "Train", text: "Borg AI-geletterdheid met e-learning en certificaten." },
  { icon: Activity, title: "Monitor", text: "Bewaak deadlines en blijf continu compliant." },
];

const pains = [
  {
    icon: AlertTriangle,
    title: "De wet is complex",
    text: "Honderden pagina's juridische tekst, risicocategorieën en uitzonderingen. Waar begint u?",
  },
  {
    icon: Clock,
    title: "Deadlines lopen",
    text: "De verplichtingen worden gefaseerd ingevoerd. Te laat zijn kan flinke boetes betekenen.",
  },
  {
    icon: Euro,
    title: "Consultants zijn duur",
    text: "Een extern adviestraject kost al snel duizenden euro's — terwijl het meeste herhaalbaar is.",
  },
  {
    icon: FileText,
    title: "Geen overzicht",
    text: "Welke AI gebruikt uw organisatie eigenlijk? En wie is waarvoor verantwoordelijk?",
  },
];

const features = [
  {
    icon: Database,
    title: "AI-register",
    text: "Centraal overzicht van al uw AI-systemen met automatische risicoclassificatie op basis van Annex III.",
  },
  {
    icon: FileText,
    title: "Documentgenerator",
    text: "AI-beleid, risicobeoordeling, FRIA en transparantieverklaring — automatisch gevuld met uw gegevens.",
  },
  {
    icon: GraduationCap,
    title: "E-learning",
    text: "Rolgerichte leerpaden met quizzen en certificaten om AI-geletterdheid (Art. 4) aantoonbaar te borgen.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance-dashboard",
    text: "Eén score, status per AI Act-artikel, openstaande acties en deadline-alerts in één oogopslag.",
  },
  {
    icon: BarChart3,
    title: "Governance",
    text: "Kwartaalchecks, signalen voor verlopen documenten en ontbrekende certificaten — continu in control.",
  },
  {
    icon: Sparkles,
    title: "Altijd actueel",
    text: "Het platform groeit mee met de gefaseerde invoering van de AI Act, zodat u niets mist.",
  },
];

const comparisonRows = [
  { label: "Kosten", self: "Gratis (veel tijd)", consultant: "€ 5.000+", complai: "Vanaf € 49/mnd" },
  { label: "Doorlooptijd", self: "Weken", consultant: "Weken tot maanden", complai: "Dezelfde dag" },
  { label: "AI-register", self: false, consultant: true, complai: true },
  { label: "Automatische classificatie", self: false, consultant: false, complai: true },
  { label: "Documenten (beleid, FRIA)", self: false, consultant: true, complai: true },
  { label: "E-learning & certificaten", self: false, consultant: false, complai: true },
  { label: "Continue monitoring", self: false, consultant: false, complai: true },
  { label: "Altijd up-to-date", self: false, consultant: false, complai: true },
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.18),transparent)]" />
        <div className="container relative grid gap-12 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div className="space-y-7">
            <Badge variant="navy" className="border border-brand-500/40 bg-brand-500/10 text-brand-400">
              EU AI Act · compliance voor het mkb
            </Badge>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Grip op uw AI.<br />
              <span className="text-brand-400">Klaar voor de AI Act.</span>
            </h1>
            <p className="max-w-xl text-lg text-white/70">
              ComplAI vertaalt de Europese AI-wetgeving naar concrete acties.
              Scan uw risico's, registreer uw AI-systemen, genereer de juiste
              documenten en train uw team — alles in één platform.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/scan">
                  Start gratis risicoscan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/#hoe-het-werkt">Bekijk hoe het werkt</Link>
              </Button>
            </div>
            <p className="text-sm text-white/50">
              Geen account nodig · Direct een PDF-rapport · 5 minuten
            </p>
          </div>

          {/* Dashboard mockup */}
          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur">
              <div className="rounded-xl bg-white p-5 text-navy-900">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold">Compliance-score</span>
                  <Badge variant="warning">In ontwikkeling</Badge>
                </div>
                <div className="flex items-center gap-5">
                  <div className="relative grid h-24 w-24 place-items-center">
                    <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - 0.58)}`}
                      />
                    </svg>
                    <span className="absolute text-xl font-bold">58</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {[
                      ["Art. 4 · AI-geletterdheid", "open"],
                      ["Art. 5 · Verboden praktijken", "ok"],
                      ["Art. 50 · Transparantie", "bezig"],
                    ].map(([label, status]) => (
                      <div key={label} className="flex items-center gap-2">
                        <span
                          className={
                            status === "ok"
                              ? "h-2 w-2 rounded-full bg-brand-500"
                              : status === "bezig"
                                ? "h-2 w-2 rounded-full bg-amber-500"
                                : "h-2 w-2 rounded-full bg-red-500"
                          }
                        />
                        <span className="text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="hoe-het-werkt" className="py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Compliant in zes stappen
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Van eerste scan tot continue monitoring — ComplAI begeleidt u door
              het hele traject.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="relative rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="absolute right-5 top-5 text-4xl font-bold text-muted/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
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
              De AI Act roept vooral vragen op. ComplAI geeft antwoorden.
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
              Eén platform, alle verplichtingen
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Alles wat u nodig heeft om aan de AI Act te voldoen — en aantoonbaar
              in control te blijven.
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
              Zelf doen, consultant of ComplAI?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Dezelfde compliance, zonder de kosten en doorlooptijd van een
              adviestraject.
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
              Een plan voor elke organisatie
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Begin gratis. Schaal mee wanneer u er klaar voor bent.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={
                  plan.highlighted
                    ? "relative rounded-xl border-2 border-brand-500 bg-card p-6 shadow-lg"
                    : "rounded-xl border bg-card p-6"
                }
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-6">Meest gekozen</Badge>
                )}
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="mt-2 text-3xl font-bold">
                  €{plan.monthly}
                  <span className="text-sm font-normal text-muted-foreground">
                    /mnd
                  </span>
                </p>
                <p className="mt-2 min-h-[2.5rem] text-sm text-muted-foreground">
                  {plan.tagline}
                </p>
                <Button
                  asChild
                  variant={plan.highlighted ? "default" : "outline"}
                  className="mt-4 w-full"
                >
                  <Link href="/pricing">Bekijk plan</Link>
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Alle plannen en functievergelijking op de{" "}
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
            Weet binnen 5 minuten waar u staat
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
