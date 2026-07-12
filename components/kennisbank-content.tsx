import { Ban, CircleCheck, Eye, Scale, ScanSearch, ShieldAlert } from "lucide-react";

import { TOOL_GROUPS } from "@/lib/compliance/questions";
import { PendingPublicationNote } from "@/components/pending-publication-note";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const riskLevels = [
  {
    icon: Ban,
    tone: "border-red-200 bg-red-50",
    chip: "danger" as const,
    title: "Onaanvaardbaar risico — verboden",
    article: "Art. 5",
    text: "Een korte lijst praktijken is verboden, zoals sociale scoring door overheden, manipulatie die ernstige schade veroorzaakt, en het ongericht scrapen van gezichtsbeelden. Verboden sinds 2 februari 2025.",
  },
  {
    icon: ShieldAlert,
    tone: "border-amber-200 bg-amber-50",
    chip: "warning" as const,
    title: "Hoog risico",
    article: "Art. 6 + Annex III",
    text: "AI in o.a. werving, krediet, onderwijs, kritieke infrastructuur en rechtshandhaving. Hieraan hangen de zwaarste plichten: risicobeheer, datakwaliteit, menselijk toezicht, technische documentatie en (voor sommige inzet) een grondrechtentoets (FRIA).",
  },
  {
    icon: Eye,
    tone: "border-sky-200 bg-sky-50",
    chip: "info" as const,
    title: "Beperkt risico — transparantie",
    article: "Art. 50",
    text: "Chatbots, AI-gegenereerde content en deepfakes. De plicht is vooral transparantie: mensen moeten weten dat ze met AI te maken hebben of dat content kunstmatig is.",
  },
  {
    icon: CircleCheck,
    tone: "border-emerald-200 bg-emerald-50",
    chip: "success" as const,
    title: "Minimaal risico",
    article: "—",
    text: "De meeste AI-toepassingen, zoals spamfilters of tekstsuggesties. Geen specifieke verplichtingen — wel geldt voor iedereen de AI-geletterdheid (Art. 4).",
  },
];

const timeline = [
  { date: "2 feb 2025", title: "Verboden praktijken + AI-geletterdheid", text: "Art. 5 en Art. 4 zijn van kracht. Personeel dat met AI werkt moet voldoende kennis hebben." },
  { date: "2 aug 2025", title: "GPAI-modellen, governance & boetes", text: "Verplichtingen voor aanbieders van AI-modellen voor algemene doeleinden (Hoofdstuk V) en het handhavingskader." },
  { date: "2 dec 2026", title: "Nieuwe verboden + transparantie", text: "Twee nieuwe verboden praktijken (Art. 5: niet-consensueel intiem beeldmateriaal en materiaal van kindermisbruik) en de transparantieplicht (Art. 50) voor bestaande systemen worden van kracht (Digital Omnibus)." },
  { date: "2 dec 2027", title: "Hoog-risico (Annex III)", text: "De hoog-risicoverplichtingen voor Annex III (werving, krediet, onderwijs) worden van kracht — met de Digital Omnibus verschoven van 2 aug 2026." },
  { date: "2 aug 2028", title: "Hoog-risico producten (Annex I)", text: "AI als veiligheidscomponent in gereguleerde producten (machines, medische hulpmiddelen, e.d.) — verschoven van 2 aug 2027." },
];

const roles = [
  {
    title: "Aanbieder",
    text: "Ontwikkelt AI of brengt het onder eigen naam op de markt. Draagt de zwaarste verplichtingen: conformiteitsbeoordeling, technische documentatie, registratie en CE-markering voor hoog-risico systemen.",
  },
  {
    title: "Gebruiksverantwoordelijke",
    text: "Gebruikt AI onder eigen verantwoordelijkheid. Moet o.a. menselijk toezicht borgen, het systeem volgens de instructies gebruiken, logs bewaren en — bij bepaalde inzet — een FRIA uitvoeren.",
  },
];

const fines = [
  { amount: "€ 35 mln / 7%", text: "voor verboden praktijken (Art. 5)" },
  { amount: "€ 15 mln / 3%", text: "voor de meeste andere verplichtingen" },
  { amount: "€ 7,5 mln / 1%", text: "voor onjuiste of misleidende informatie aan toezichthouders" },
];

const shadowSteps = [
  "Vraag elk team welke AI-tools, plug-ins en browserextensies zij gebruiken.",
  "Loop de SaaS-abonnementen en facturen langs op AI-functies (vaak 'AI', 'Copilot' of 'Assistant').",
  "Controleer of standaardsoftware (Microsoft 365, Google Workspace, CRM) AI-functies aan heeft staan.",
  "Leg elk gevonden systeem vast in het AI-register met rol, doel en risicoklasse.",
];

/** The AI-Act explainer, shared by the public /kennisbank and the in-dashboard one. */
export function KennisbankContent() {
  return (
    <>
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">De vier risiconiveaus</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {riskLevels.map((r) => (
            <div key={r.title} className={`rounded-xl border-2 p-6 ${r.tone}`}>
              <div className="flex items-center justify-between">
                <r.icon className="h-7 w-7 text-navy-900" />
                <Badge variant={r.chip}>{r.article}</Badge>
              </div>
              <p className="mt-4 font-semibold">{r.title}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">Tijdlijn (Art. 113)</h2>
        <div className="space-y-4">
          {timeline.map((t) => (
            <Card key={t.date}>
              <CardContent className="flex flex-col gap-1 py-5 sm:flex-row sm:gap-6">
                <div className="shrink-0 sm:w-32">
                  <span className="font-semibold text-brand-700">{t.date}</span>
                </div>
                <div>
                  <p className="font-medium">{t.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{t.text}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Deze data volgen de officiële EU-tijdlijn (Art. 113). Wetgeving en
          deadlines kunnen wijzigen; we houden de data in het platform actueel.
        </p>
        <PendingPublicationNote className="mt-3" />
      </section>

      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">Wie moet wat doen?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {roles.map((r) => (
            <Card key={r.title}>
              <CardContent className="py-6">
                <p className="font-semibold">{r.title}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{r.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="schaduw-ai" className="mb-16 scroll-mt-24">
        <div className="mb-2 flex items-center gap-2">
          <ScanSearch className="h-6 w-6 text-brand-600" />
          <h2 className="text-2xl font-bold tracking-tight">Schaduw-AI opsporen</h2>
        </div>
        <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
          Schaduw-AI is AI die in uw organisatie wordt gebruikt zonder dat het is
          vastgelegd — de grootste blinde vlek bij een audit. De AI Act gaat ervan
          uit dat u wéét welke AI u inzet: een gebruiksverantwoordelijke moet AI
          volgens de instructies inzetten, menselijk toezicht borgen en logs bewaren
          (Art. 26). Ook AI-geletterdheid (Art. 4) en de transparantieplichten
          (Art. 50) gelden alleen aantoonbaar met het volledige plaatje.
        </p>

        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Veelgebruikte AI-tools — welke herkent u?
        </h3>
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {TOOL_GROUPS.filter((g) => g.label !== "Anders").map((group) => (
            <Card key={group.label}>
              <CardContent className="py-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {group.options.map((opt) => (
                    <span
                      key={opt.value}
                      className="rounded-md border bg-secondary/60 px-2 py-1 text-xs"
                    >
                      {opt.label}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Zo spoort u schaduw-AI op
        </h3>
        <Card>
          <CardContent className="py-5">
            <ol className="space-y-3">
              {shadowSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-6 flex items-center gap-2">
          <Scale className="h-6 w-6 text-brand-600" />
          <h2 className="text-2xl font-bold tracking-tight">Boetes (Art. 99)</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {fines.map((f) => (
            <Card key={f.amount}>
              <CardContent className="py-6 text-center">
                <p className="text-2xl font-bold">{f.amount}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Boetes gelden tot het genoemde bedrag óf percentage van de wereldwijde
          jaaromzet — afhankelijk van welk bedrag hoger is.
        </p>
      </section>
    </>
  );
}
