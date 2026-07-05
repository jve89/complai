import { Ban, CircleCheck, Eye, Scale, ShieldAlert } from "lucide-react";

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
  { date: "2 aug 2026", title: "Het merendeel van de wet", text: "Hoog-risico verplichtingen voor Annex III en de transparantieplichten (Art. 50) worden van kracht." },
  { date: "2 aug 2027", title: "Hoog-risico producten (Annex I)", text: "AI als veiligheidscomponent in gereguleerde producten (machines, medische hulpmiddelen, e.d.)." },
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
