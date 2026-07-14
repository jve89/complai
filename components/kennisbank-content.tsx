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
    text: "Een beperkt aantal toepassingen mag helemaal niet, waaronder sociale scoring door de overheid, manipulatie die mensen ernstig schaadt en het ongericht verzamelen van gezichtsbeelden. Deze praktijken zijn sinds 2 februari 2025 verboden.",
  },
  {
    icon: ShieldAlert,
    tone: "border-amber-200 bg-amber-50",
    chip: "warning" as const,
    title: "Hoog risico",
    article: "Art. 6 + Annex III",
    text: "Denk aan AI voor werving, kredietbeoordeling, onderwijs, kritieke infrastructuur of rechtshandhaving. Voor deze systemen gelden de strengste eisen: risicobeheer, datakwaliteit, menselijk toezicht, technische documentatie en — bij bepaalde toepassingen — een grondrechtentoets (FRIA).",
  },
  {
    icon: Eye,
    tone: "border-sky-200 bg-sky-50",
    chip: "info" as const,
    title: "Beperkt risico — transparantie",
    article: "Art. 50",
    text: "Hieronder vallen chatbots, door AI gemaakte content en deepfakes. Hier draait het vooral om openheid: gebruikers moeten kunnen zien dat ze met AI te maken hebben of dat materiaal kunstmatig is gemaakt.",
  },
  {
    icon: CircleCheck,
    tone: "border-emerald-200 bg-emerald-50",
    chip: "success" as const,
    title: "Minimaal risico",
    article: "—",
    text: "Verreweg de meeste AI valt hieronder, van spamfilters tot tekstsuggesties. Er gelden geen bijzondere verplichtingen, al blijft de AI-geletterdheid (Art. 4) voor iedereen overeind.",
  },
];

const timeline = [
  { date: "2 feb 2025", title: "Verboden praktijken + AI-geletterdheid", text: "Art. 5 en Art. 4 gelden vanaf nu. Iedereen die met AI werkt, moet er voldoende van afweten." },
  { date: "2 aug 2025", title: "GPAI-modellen, governance & boetes", text: "De plichten voor aanbieders van AI-modellen voor algemene doeleinden (Hoofdstuk V) gaan in, samen met het kader voor handhaving." },
  { date: "2 dec 2026", title: "Nieuwe verboden + transparantie", text: "Er komen twee verboden praktijken bij (Art. 5: niet-consensueel intiem beeldmateriaal en materiaal van kindermisbruik) en de transparantieplicht (Art. 50) gaat ook gelden voor systemen die al draaien (Digital Omnibus)." },
  { date: "2 dec 2027", title: "Hoog-risico (Annex III)", text: "De verplichtingen voor hoog-risico AI onder Annex III (werving, krediet, onderwijs) gaan gelden; de Digital Omnibus verschoof deze datum van 2 aug 2026." },
  { date: "2 aug 2028", title: "Hoog-risico producten (Annex I)", text: "AI die als veiligheidsonderdeel in gereguleerde producten zit (machines, medische hulpmiddelen en dergelijke); deze datum verschoof van 2 aug 2027." },
];

const roles = [
  {
    title: "Aanbieder",
    text: "Bouwt AI of brengt het onder de eigen naam op de markt. Voor deze partij gelden de meeste plichten: conformiteitsbeoordeling, technische documentatie, registratie en, bij hoog-risico systemen, CE-markering.",
  },
  {
    title: "Gebruiksverantwoordelijke",
    text: "Zet AI in onder eigen verantwoordelijkheid. Moet onder meer menselijk toezicht regelen, het systeem volgens de instructies gebruiken, logs bewaren en bij bepaalde toepassingen een FRIA uitvoeren.",
  },
];

const fines = [
  { amount: "€ 35 mln / 7%", text: "voor verboden praktijken (Art. 5)" },
  { amount: "€ 15 mln / 3%", text: "voor de meeste andere verplichtingen" },
  { amount: "€ 7,5 mln / 1%", text: "voor onjuiste of misleidende informatie aan toezichthouders" },
];

const shadowSteps = [
  "Vraag ieder team na welke AI-tools, plug-ins en browserextensies zij inzetten.",
  "Neem uw SaaS-abonnementen en facturen door op AI-functies — die heten vaak 'AI', 'Copilot' of 'Assistant'.",
  "Ga na of standaardsoftware zoals Microsoft 365, Google Workspace of uw CRM AI-functies heeft ingeschakeld.",
  "Zet elk systeem dat u vindt in het AI-register, met de rol, het doel en de risicoklasse erbij.",
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
          Deze data zijn gebaseerd op de officiële EU-tijdlijn (Art. 113). Regels en deadlines kunnen nog veranderen; wij houden ze in het platform actueel.
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
          Schaduw-AI is AI die ergens in uw organisatie wordt gebruikt zonder dat iemand het heeft vastgelegd — bij een audit vaak de grootste blinde vlek. De AI Act gaat ervan uit dat u weet welke AI u inzet: een gebruiksverantwoordelijke moet AI volgens de instructies gebruiken, menselijk toezicht borgen en logs bewaren (Art. 26). Ook AI-geletterdheid (Art. 4) en de transparantieplichten (Art. 50) kunt u pas aantonen als u het volledige overzicht heeft.
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
          De boete loopt op tot het genoemde bedrag óf tot het percentage van de wereldwijde jaaromzet — het hoogste van de twee is bepalend.
        </p>
      </section>
    </>
  );
}
