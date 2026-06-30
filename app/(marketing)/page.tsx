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
  { icon: Search, title: "Scan", text: "Ontdek in vijf minuten waar uw organisatie staat." },
  { icon: ClipboardList, title: "Registreer", text: "Verzamel al uw AI-toepassingen op één plek." },
  { icon: Layers, title: "Classificeer", text: "Laat het risiconiveau per systeem automatisch bepalen." },
  { icon: FileText, title: "Documenteer", text: "Maak beleid, FRIA en beoordelingen met één druk op de knop." },
  { icon: GraduationCap, title: "Train", text: "Maak uw team AI-vaardig met e-learning en certificaten." },
  { icon: Activity, title: "Monitor", text: "Houd deadlines in het oog en blijf doorlopend compliant." },
];

const pains = [
  {
    icon: AlertTriangle,
    title: "Onontwarbare regels",
    text: "Honderden pagina's wetstekst, risicoklassen en uitzonderingen. Waar moet u beginnen?",
  },
  {
    icon: Clock,
    title: "De klok tikt",
    text: "De regels gaan stap voor stap in. Te laat handelen kan uitlopen op stevige boetes.",
  },
  {
    icon: Euro,
    title: "Advies kost een vermogen",
    text: "Een extern traject loopt zo in de duizenden euro's — voor werk dat grotendeels herhaalbaar is.",
  },
  {
    icon: FileText,
    title: "Niemand weet wat er draait",
    text: "Welke AI gebruikt uw organisatie eigenlijk? En wie is waarvoor verantwoordelijk?",
  },
];

const features = [
  {
    icon: Database,
    title: "AI-register",
    text: "Al uw AI-systemen overzichtelijk bij elkaar, met automatische risico-indeling volgens Annex III.",
  },
  {
    icon: FileText,
    title: "Documentgenerator",
    text: "Beleid, risicobeoordeling, FRIA en transparantieverklaring — direct gevuld met uw eigen gegevens.",
  },
  {
    icon: GraduationCap,
    title: "E-learning",
    text: "Leerpaden per rol met toetsen en certificaten, zodat AI-geletterdheid (Art. 4) aantoonbaar wordt.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance-dashboard",
    text: "Uw score, de status per AI Act-artikel, openstaande acties en deadlines in één overzicht.",
  },
  {
    icon: BarChart3,
    title: "Governance",
    text: "Kwartaalchecks en signalen bij verlopen documenten of ontbrekende certificaten. Doorlopend grip.",
  },
  {
    icon: Sparkles,
    title: "Altijd actueel",
    text: "Het platform beweegt mee met de gefaseerde invoering van de wet, zodat u nooit iets mist.",
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
      <section className="relative overflow-hidden border-b bg-white">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-15%] h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(124,58,237,0.16),rgba(99,102,241,0.10),transparent)] blur-2xl" />
        </div>
        <div className="container relative grid gap-14 py-20 lg:grid-cols-2 lg:items-center lg:py-32">
          <div className="space-y-7">
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              AI Act-compliance voor het mkb
            </Badge>
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Word AI Act-compliant{" "}
              <span className="bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent">
                zonder advieskosten.
              </span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
              ComplAI maakt van de Europese AI-wetgeving een afvinkbaar
              stappenplan: scan uw risico's, leg uw AI-systemen vast, genereer de
              verplichte documenten en maak uw team AI-vaardig — vanuit één
              omgeving.
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

          {/* Dashboard mockup */}
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[28px] bg-gradient-to-br from-brand-500/15 to-violet-500/15 blur-2xl" />
            <div className="rounded-2xl border bg-white p-2 shadow-xl shadow-brand-500/10 ring-1 ring-black/5">
              <div className="rounded-xl border bg-card p-6">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm font-semibold">Compliance-score</span>
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    Voorbeeld
                  </Badge>
                </div>
                <div className="flex items-center gap-6">
                  <div className="relative grid h-28 w-28 place-items-center">
                    <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#ede9fe" strokeWidth="10" />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - 0.58)}`}
                      />
                    </svg>
                    <span className="absolute text-2xl font-bold">58</span>
                  </div>
                  <div className="space-y-2.5 text-sm">
                    {[
                      ["Art. 4 · AI-geletterdheid", "open"],
                      ["Art. 5 · Verboden praktijken", "ok"],
                      ["Art. 50 · Transparantie", "bezig"],
                    ].map(([label, status]) => (
                      <div key={label} className="flex items-center gap-2">
                        <span
                          className={
                            status === "ok"
                              ? "h-2 w-2 rounded-full bg-emerald-500"
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
              Zo werkt het — in zes stappen
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Van de eerste scan tot doorlopende bewaking: ComplAI loodst u door
              elke stap.
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
              Klinkt dit bekend?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              De AI Act levert vooral kopzorgen op. ComplAI ruimt ze op.
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
              Alles op één plek
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Elke verplichting uit de AI Act afgedekt — en aantoonbaar onder
              controle.
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
              Zelf uitzoeken, inhuren of ComplAI?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Hetzelfde resultaat — zonder de rekening en de wachttijd van een
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
              Voor elke organisatie een passend plan
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              De scan is gratis, zonder account. Elk betaald plan begint met een
              gratis eerste maand.
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
                <p className="mt-1 min-h-[1rem] text-xs font-medium text-brand-600">
                  {plan.freeFirstMonth
                    ? "Eerste maand gratis"
                    : "Geen abonnement nodig"}
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
            Binnen vijf minuten weet u waar u staat
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            Start de gratis risicoscan en ontvang meteen uw compliance-score met
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
