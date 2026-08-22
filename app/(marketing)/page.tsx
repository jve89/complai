import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Clock,
  Database,
  Euro,
  EyeOff,
  FileText,
  GraduationCap,
  Lock,
  Mail,
  Plus,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { StructuredData } from "@/components/marketing/structured-data";
import { HomeEffects } from "@/components/marketing/home/home-effects";
import { PLANS } from "@/lib/stripe";
import { formatEuro } from "@/lib/utils";

import "./home.css";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Stagger delay for scroll-reveal, as a typed CSS custom property.
const rd = (ms: number): CSSProperties => ({ "--d": `${ms}ms` }) as CSSProperties;

const basis = [
  { icon: ShieldCheck, title: "De wettekst zelf", text: "Verordening (EU) 2024/1689, niet een samenvatting van een samenvatting." },
  { icon: Clock, title: "De officiële tijdlijn", text: "Toepassingsdata volgens Art. 113, inclusief wijzigingen uit de Digital Omnibus." },
  { icon: Lock, title: "Uw gegevens blijven in de EU", text: "Verwerking binnen de EU. De scan werkt zonder account." },
  { icon: FileText, title: "Geen juridisch advies", text: "Beslissingsondersteuning die uw dossier opbouwt. Dat zeggen we liever vooraf." },
];

const milestones = [
  { date: "2 februari 2025", tag: { label: "Geldt nu", cls: "tag-now" }, title: "AI-geletterdheid en verboden praktijken", text: "Iedereen die met AI werkt moet aantoonbaar weten hoe die AI werkt en welke risico's eraan kleven (Art. 4). De praktijken uit Art. 5 mogen niet meer." },
  { date: "2 augustus 2025", tag: { label: "Geldt nu", cls: "tag-now" }, title: "Regels voor AI-modellen voor algemene doeleinden", text: "Aanbieders van GPAI-modellen vallen onder eigen documentatie- en transparantieverplichtingen. Gebruikt u zulke modellen, dan raakt dat uw leveranciersafspraken." },
  { date: "2 december 2026", tag: { label: "Bijna", cls: "tag-soon" }, title: "Transparantie richting uw klanten", text: "Chatbots moeten zich kenbaar maken als AI en AI-gegenereerde content moet herkenbaar zijn (Art. 50). Dit raakt juist de mkb-websites die vandaag al een AI-assistent draaien." },
  { date: "2 december 2027", tag: { label: "Volgt", cls: "tag-next" }, title: "De zware hoog-risicoverplichtingen", text: "De verplichtingen voor Bijlage III-systemen — denk aan werving, kredietbeoordeling of toegang tot voorzieningen. Met de Digital Omnibus verschoven van augustus 2026." },
  { date: "Vandaag", tag: { label: "Uw echte risico", cls: "tag-now" }, title: "De boete is niet wat u als eerste raakt", text: "De plafonds lopen op tot € 35 miljoen of 7% van de wereldomzet, en voor mkb en start-ups geldt het laagste van de twee (Art. 99). Maar de eerste die om uw AI-beleid vraagt is zelden een toezichthouder. Het is een klant in een leveranciersvragenlijst, een verzekeraar bij verlenging, of een aanbesteding met een uitsluitingscriterium. Die geven u geen jaar de tijd." },
];

const laws = [
  "Artikel 4 — Aanbieders en gebruiksverantwoordelijken van AI-systemen nemen maatregelen om, zoveel mogelijk, te zorgen voor een toereikend niveau van AI-geletterdheid bij hun personeel en andere personen die namens hen betrokken zijn bij de werking en het gebruik van AI-systemen, rekening houdend met hun technische kennis, ervaring, onderwijs en opleiding en de context waarin de AI-systemen zullen worden gebruikt.",
  "Artikel 6, lid 2 — AI-systemen als bedoeld in bijlage III worden als AI-systemen met een hoog risico beschouwd, tenzij het AI-systeem geen significant risico op schade voor de gezondheid, de veiligheid of de grondrechten van natuurlijke personen inhoudt, mede doordat het de uitkomst van de besluitvorming niet wezenlijk beïnvloedt.",
  "Artikel 27 — Voorafgaand aan het gebruik van een AI-systeem met een hoog risico verrichten gebruiksverantwoordelijken die publiekrechtelijke instanties zijn, of private entiteiten die openbare diensten verlenen, een beoordeling van het effect op de grondrechten dat het gebruik van een dergelijk systeem kan opleveren.",
  "Artikel 50 — Aanbieders zorgen ervoor dat AI-systemen die bedoeld zijn om rechtstreeks met natuurlijke personen te interageren, zodanig worden ontworpen en ontwikkeld dat de betrokken natuurlijke personen worden geïnformeerd dat zij interageren met een AI-systeem, tenzij dit duidelijk is voor een normaal geïnformeerde persoon.",
];

const todos = [
  { title: "Zet uw team op een leerpad", text: "E-learning per rol, met toets en certificaat als bewijs voor Art. 4." },
  { title: "Classificeer elk AI-systeem", text: "Het register geeft per systeem een risico-suggestie op basis van Bijlage III, die u zelf bevestigt." },
  { title: "Genereer uw FRIA", text: "De grondrechtenbeoordeling, vooringevuld met uw eigen organisatiegegevens." },
  { title: "Meld AI in uw klantcontact", text: "Kant-en-klare transparantieverklaring voor uw chatbot en gegenereerde content." },
];

const pains = [
  { icon: FileText, title: "Regels die niemand overziet", text: "Honderden pagina's wettekst, vol risicoklassen en uitzonderingen. Waar begint u?" },
  { icon: Clock, title: "De tijd dringt", text: "De verplichtingen treden gefaseerd in werking. Wie te lang wacht, loopt achter de feiten aan." },
  { icon: Euro, title: "Advies is prijzig", text: "Een extern adviestraject kost al snel duizenden euro's, terwijl veel van dat werk zich laat standaardiseren." },
  { icon: EyeOff, title: "Geen zicht op wat er draait", text: "Welke AI draait er eigenlijk binnen uw organisatie? En wie draagt waarvoor de verantwoordelijkheid?" },
];

const startSteps = [
  { num: "01 — gratis", title: "Doe de risicoscan", text: "Zie in vijf minuten welke verplichtingen uit de AI Act op uw organisatie van toepassing zijn. Zonder account.", cta: { label: "Start de scan", href: "/scan" } },
  { num: "02 — vanaf € 19,99", title: "Kies uw pakket", text: "Van een eenvoudige start tot een volledig documentendossier. U zegt maandelijks op en betaalt geen opstartkosten.", cta: { label: "Bekijk pakketten", href: "/pricing" } },
  { num: "03 — zonder betaalgegevens", title: "Maak een gratis account", text: "Een eigen compliance-omgeving. Uw collega's nodigt u later in een paar klikken uit.", cta: { label: "Registreer gratis", href: "/signup" } },
];

const features = [
  { icon: ShieldCheck, title: "Compliance-dashboard", text: "Uw gereedheidsscore, de stand per verplichting, wat er nog openstaat en welke deadlines eraan komen — alles op één scherm.", cls: "f f-wide" },
  { icon: Database, title: "AI-register", text: "Al uw AI-systemen bij elkaar, met per systeem een automatische risico-suggestie op basis van Bijlage III die u zelf bevestigt.", cls: "f f-wide" },
  { icon: ScanSearch, title: "Schaduw-AI-check", text: "Breng AI in kaart die nog nergens is vastgelegd. Juist dat gemis valt bij een controle als eerste op.", cls: "f" },
  { icon: FileText, title: "Documentgenerator", text: "Beleid, risicobeoordeling, FRIA en transparantieverklaring, meteen ingevuld met uw eigen gegevens.", cls: "f" },
  { icon: GraduationCap, title: "E-learning & certificaten", text: "Leerpaden per rol, met toetsen en certificaten, zodat u AI-geletterdheid kunt aantonen.", cls: "f" },
  { icon: BarChart3, title: "Governance", text: "Kwartaalchecks plus meldingen zodra documenten verlopen of certificaten ontbreken.", cls: "f" },
  { icon: BookOpen, title: "Kennisbank", text: "De AI Act in begrijpelijk Nederlands: risiconiveaus, rollen, deadlines en boetes.", cls: "f" },
  { icon: Users, title: "Team & rollen", text: "Nodig collega's uit als beheerder, manager of medewerker, elk met een passend leerpad.", cls: "f" },
  { icon: Sparkles, title: "Meegroeien met de wet", text: "Naarmate de AI Act stap voor stap in werking treedt, werken wij de deadlines en verplichtingen in het platform bij. U werkt altijd met de meest actuele stand.", cls: "f f-wide" },
];

const comparison = [
  { label: "Kosten", self: "Gratis (kost veel tijd)", consultant: "€ 5.000+", complai: "vanaf € 19,99/mnd", cost: true },
  { label: "Doorlooptijd", self: "Weken", consultant: "Weken tot maanden", complai: "Dezelfde dag" },
  { label: "AI-register", self: false, consultant: true, complai: true },
  { label: "Automatische risico-suggestie", self: false, consultant: false, complai: true },
  { label: "Documenten (beleid, FRIA)", self: false, consultant: true, complai: true },
  { label: "E-learning & certificaten", self: false, consultant: false, complai: true },
  { label: "Doorlopende monitoring", self: false, consultant: false, complai: true },
  { label: "Groeit mee met de wet", self: false, consultant: false, complai: true },
];

// Plan feature bullets, in PLANS order (Scan · Basis · Compliance · Audit).
const planBullets: string[][] = [
  ["Risicoscan met pdf-rapport", "Dashboard met uw status", "Bericht bij wetswijziging"],
  ["Alles uit Scan", "AI-register", "AI-beleid en transparantieverklaring", "E-learning voor Art. 4"],
  ["Alles uit Basis", "Risicobeoordeling per systeem", "FRIA-generator", "Kwartaalchecks en meldingen"],
  ["Alles uit Compliance", "Volledig documentendossier", "Export voor auditor of klant", "Uitgebreid rollenbeheer"],
];

const contactWays = [
  { icon: Mail, href: "/contact", title: "Stuur ons een bericht", sub: "Antwoord binnen één werkdag" },
  { icon: CalendarDays, href: "/demo", title: "Plan een gesprek van 20 minuten", sub: "Online, samen door het platform" },
  { icon: BookOpen, href: "/kennisbank", title: "Eerst zelf lezen", sub: "De kennisbank, in gewoon Nederlands" },
];

const faqs = [
  { q: "Wij gebruiken alleen een chatbot en wat AI in bestaande software. Telt dat ook?", a: "Ja. U bent dan gebruiksverantwoordelijke, en dat is precies de rol waar Art. 4 op ziet: u moet kunnen aantonen dat de mensen die ermee werken weten wat het doet en waar het misgaat. Draait er een AI-assistent in uw klantcontact, dan komt daar per 2 december 2026 de transparantieplicht uit Art. 50 bij. U hoeft geen AI te bouwen om onder de wet te vallen — gebruiken is genoeg." },
  { q: "Raakt de wet mijn organisatie ook?", a: "Bijna zeker, ongeacht uw omvang. Vaak zit AI verstopt in software die u al jaren gebruikt: slimme zoeksuggesties, automatische categorisering van facturen, leadscoring in uw CRM of cv-selectie in uw recruitmenttool. De gratis scan brengt dat gebruik in kaart en zegt welke rol u heeft: aanbieder of gebruiksverantwoordelijke." },
  { q: "Tegen wanneer moet ik dit op orde hebben?", a: "Deels nu al. AI-geletterdheid (Art. 4) en de verboden praktijken (Art. 5) gelden sinds 2 februari 2025. De transparantieplicht rond chatbots en gegenereerde content volgt op 2 december 2026 en de zware hoog-risicoverplichtingen uit Bijlage III op 2 december 2027." },
  { q: "Moet ik hiervoor een adviesbureau inschakelen?", a: "Voor de meeste mkb-organisaties niet. Het register, het beleid, de standaarddocumenten en de scholing laten zich standaardiseren — daar is ComplAI voor gebouwd. Werkt u met echt hoog-risico toepassingen, dan is dit dossier een stevige basis waarop uw jurist verder bouwt, tegen minder uren." },
  { q: "Wat gebeurt er met mijn gegevens?", a: "Uw antwoorden en documenten blijven binnen de EU. De scan werkt zonder account, dus u geeft pas gegevens af op het moment dat u zelf een omgeving aanmaakt. In de verwerkersovereenkomst staat precies wat wij wel en niet met uw gegevens doen." },
  { q: "Is de risicoscan echt kosteloos?", a: "Ja. Geen account, geen betaalgegevens, geen proefperiode die stilzwijgend doorloopt. U vult de scan in en krijgt uw risicocategorie, uw rol, de deadlines die voor u gelden en een stappenplan als pdf." },
  { q: "En wat houdt de EU AI Act nu precies in?", a: "De AI Act (Verordening (EU) 2024/1689) is de eerste brede Europese wet voor kunstmatige intelligentie. Systemen worden ingedeeld naar risico — van minimaal tot onaanvaardbaar — en per categorie gelden andere verplichtingen. De wet werkt rechtstreeks door in Nederland; er komt geen aparte Nederlandse wet die u er nog naast moet leggen." },
];

const Arrow = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Tick = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2 6.2l2.6 2.6L10 3.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function LandingPage() {
  return (
    <div className="hp">
      <StructuredData />
      <HomeEffects />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <span className="blob blob-1" />
          <span className="blob blob-2" />
          <span className="blob blob-3" />
        </div>
        <div className="grid-lines" aria-hidden="true" />
        <div className="wrap hero-grid">
          <div data-reveal>
            <p className="status-pill">
              <span className="dot-live" aria-hidden="true" /> Van kracht sinds 2 februari 2025
              <span className="badge" id="daysSince">dag —</span>
            </p>
            <h1 className="h1">
              U gebruikt al AI.<br />Alleen kunt u dat<br /><em className="hl">niet aantonen</em>.
            </h1>
            <p className="lede">
              Sinds 2 februari 2025 moet u kunnen laten zien dat uw mensen begrijpen waar
              ze mee werken. Niet dát ze het begrijpen — dat u het kunt bewijzen. De meeste
              mkb-organisaties ontdekken pas dat dat bewijs ontbreekt op het moment dat een
              klant, een verzekeraar of een aanbesteding erom vraagt.
            </p>
            <div className="hero-cta">
              <Link href="/scan" className="btn btn-primary btn-lg">Doe de gratis scan <Arrow /></Link>
              <Link href="#vertaling" className="btn btn-ghost btn-lg">Zie eerst hoe het werkt</Link>
            </div>
            <p className="hero-note">
              <span><i className="check-i"><Tick size={9} /></i> 5 minuten</span>
              <span><i className="check-i"><Tick size={9} /></i> Geen account, geen betaalgegevens</span>
              <span><i className="check-i"><Tick size={9} /></i> Pdf die u kunt doorsturen</span>
            </p>
            <p className="hero-human">
              Liever eerst iemand spreken? <Link href="#contact">Plan een gesprek van 20 minuten</Link> — zonder verkooppraat.
            </p>
          </div>

          <div className="mock" data-reveal="scale" style={rd(160)}>
            <span className="mock-label">Voorbeeldweergave van het dashboard</span>
            <div className="mock-card">
              <div className="mock-top" aria-hidden="true"><i /><i /><i /><span className="t">complai — dashboard</span></div>
              <div className="gauge-row">
                <div className="gauge">
                  <svg width="104" height="104" viewBox="0 0 104 104" aria-hidden="true">
                    <circle cx="52" cy="52" r="44" fill="none" stroke="#E8EFF4" strokeWidth="10" />
                    <circle id="gaugeArc" cx="52" cy="52" r="44" fill="none" stroke="url(#g1)" strokeWidth="10" strokeLinecap="round" strokeDasharray="276.5" strokeDashoffset="276.5" style={{ transition: "stroke-dashoffset 1.8s cubic-bezier(.22,.9,.28,1)" }} />
                    <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1257E0" /><stop offset="1" stopColor="#00C4A7" /></linearGradient></defs>
                  </svg>
                  <p className="gauge-val"><span id="gaugeNum">0</span><small>%</small></p>
                </div>
                <div>
                  <p style={{ fontFamily: "var(--display)", fontSize: 19, fontWeight: 600, letterSpacing: "-.02em" }}>Gereedheidsscore</p>
                  <p className="small" style={{ marginTop: 6, maxWidth: "24ch" }}>4 van de 9 verplichtingen afgerond. Twee punten vragen deze maand actie.</p>
                </div>
              </div>
              <div className="mock-rows">
                <div className="mrow" style={{ animationDelay: ".5s" }}><span className="chip chip-ok">Klaar</span> AI-geletterdheid <span className="art">Art. 4</span></div>
                <div className="mrow" style={{ animationDelay: ".68s" }}><span className="chip chip-ok">Klaar</span> AI-register bijgewerkt <span className="art">Bijlage III</span></div>
                <div className="mrow" style={{ animationDelay: ".86s" }}><span className="chip chip-busy">Bezig</span> Transparantieverklaring <span className="art">Art. 50</span></div>
                <div className="mrow" style={{ animationDelay: "1.04s" }}><span className="chip chip-todo">Open</span> FRIA-beoordeling <span className="art">Art. 27</span></div>
              </div>
              <p className="mock-foot">
                <span className="dot-still" aria-hidden="true" /> Eerstvolgende deadline <span className="d" id="mockDeadline">—</span>
              </p>
            </div>
            <div className="float-tag a" aria-hidden="true"><span className="chip chip-ok">Nieuw</span> 2 schaduw-AI-tools gevonden</div>
            <div className="float-tag b" aria-hidden="true">Volledig in het Nederlands</div>
          </div>
        </div>
      </section>

      {/* WAAROP DIT IS GEBASEERD */}
      <div className="basis">
        <div className="wrap basis-in">
          {basis.map((b) => (
            <div className="basis-item" key={b.title}>
              <b.icon size={20} aria-hidden="true" />
              <div><b>{b.title}</b><span>{b.text}</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* KLOK — deadlines */}
      <section className="section clock" id="klok">
        <div className="wrap">
          <div style={{ maxWidth: 760 }} data-reveal>
            <p className="eyebrow">Art. 113 — toepassingsdata</p>
            <h2 className="h2">De invoering is niet aanstaande. Die is begonnen.</h2>
            <p className="lede">Twee verplichtingen gelden vandaag al. De rest komt in fases — en elke fase vraagt werk dat zich niet in een weekend laat inhalen.</p>
          </div>

          <div className="counters" data-reveal style={rd(120)}>
            <div className="counter red">
              <p className="n" id="cSince">0</p>
              <p className="l">dagen dat AI-geletterdheid (Art. 4) en het verbod uit Art. 5 al gelden</p>
            </div>
            <div className="counter mint">
              <p className="n" id="cUntil">0</p>
              <p className="l">dagen tot de eerstvolgende deadline: <span id="nextLabel">—</span></p>
            </div>
          </div>

          <div className="rail" id="rail">
            <div className="rail-line" aria-hidden="true"><div className="rail-fill" id="railFill" /></div>
            {milestones.map((m) => (
              <article className="mile" data-mile data-reveal key={m.title}>
                <span className="mile-dot" aria-hidden="true" />
                <p className="mile-date">{m.date} <span className={`tag ${m.tag.cls}`}>{m.tag.label}</span></p>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </article>
            ))}
          </div>

          <div className="clock-foot">
            <p>Digital Omnibus — aangenomen door de Raad; publicatie in het Publicatieblad in afwachting. Tot publicatie geldt formeel de oorspronkelijke datum uit Art. 113. Wetgeving en deadlines kunnen wijzigen; wij werken de data in het platform bij. Dit is beslissingsondersteuning, geen juridisch advies.</p>
            <Link href="/scan" className="btn btn-mint">Zie welke datum voor ú telt <Arrow /></Link>
          </div>
        </div>
      </section>

      {/* WET → CHECKLIST */}
      <section className="translate" id="vertaling">
        <div className="wrap" style={{ paddingTop: "clamp(72px,10vw,132px)" }}>
          <div className="section-head" data-reveal>
            <p className="eyebrow">De kern van ComplAI</p>
            <h2 className="h2">Links de wettekst. Rechts uw takenlijst.</h2>
            <p className="lede">113 artikelen en 13 bijlagen. Daar staan voor uw organisatie een handvol concrete taken in — de rest gaat over iemand anders. Scroll verder en zie de vertaling gebeuren.</p>
          </div>
        </div>

        <div className="tr-stage" id="trStage">
          <div className="tr-sticky">
            <div className="wrap">
              <div className="tr-grid">
                <div className="law">
                  <p className="law-head"><span>Verordening (EU) 2024/1689</span><span>PB L, 12.7.2024</span></p>
                  {laws.map((l, i) => (<p data-law key={i}>{l}</p>))}
                  <p className="law-seal">— 113 artikelen · 13 bijlagen —</p>
                </div>
                <div>
                  <div className="todo-head">
                    <p className="eyebrow">Uw stappenplan</p>
                    <h3 className="h3" style={{ marginTop: 14 }}>Vier taken, met eigenaar en datum</h3>
                  </div>
                  <div className="todos">
                    {todos.map((t) => (
                      <div className="todo" data-todo key={t.title}>
                        <span className="box" aria-hidden="true"><Tick /></span>
                        <p><b>{t.title}</b><span>{t.text}</span></p>
                      </div>
                    ))}
                  </div>
                  <p className="tr-progress"><span id="trCount">0</span>/4 vertaald</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PIJNPUNTEN */}
      <section className="section">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="eyebrow">Herkenbaar?</p>
            <h2 className="h2">Vier redenen waarom dit al maanden op uw lijstje staat</h2>
          </div>
          <div className="pain-grid">
            {pains.map((p, i) => (
              <div className="pain" data-reveal style={rd(i * 80)} key={p.title}>
                <div className="pain-ico" aria-hidden="true"><p.icon size={20} /></div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STAPPEN */}
      <section className="section" style={{ background: "var(--mist)" }} id="hoe-het-werkt">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="eyebrow">In drie stappen aan de slag</p>
            <h2 className="h2">De volgorde bepaalt u zelf</h2>
            <p className="lede">Waar u ook start, alles komt samen in uw eigen dashboard.</p>
          </div>
          <div className="steps">
            {startSteps.map((s, i) => (
              <div className="step" data-reveal style={rd(i * 100)} key={s.title}>
                <span className="num">{s.num}</span>
                <h3 className="h3">{s.title}</h3>
                <p>{s.text}</p>
                <Link href={s.cta.href} className="link-arrow">{s.cta.label} <Arrow size={14} /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCTIES */}
      <section className="section" id="functies">
        <div className="wrap">
          <div className="feat-head">
            <div className="section-head" data-reveal>
              <p className="eyebrow">Uw hele compliance op één plek</p>
              <h2 className="h2" style={{ marginBottom: 0 }}>Alles wat u straks moet kunnen laten zien, op één plek</h2>
            </div>
            <Link href="/demo" className="link-arrow" data-reveal style={rd(120)}>Bekijk de demo <Arrow size={14} /></Link>
          </div>
          <div className="bento">
            {features.map((f, i) => (
              <div className={f.cls} data-reveal style={rd((i % 3) * 80)} key={f.title}>
                <span className="f-glow" aria-hidden="true" />
                <div className="f-ico" aria-hidden="true"><f.icon size={18} /></div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VERGELIJKING */}
      <section className="section" style={{ background: "var(--mist)" }}>
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="eyebrow">Zelf uitpluizen, adviseur of ComplAI?</p>
            <h2 className="h2">Hetzelfde resultaat, zonder de kosten en de wachttijd</h2>
          </div>
          <div className="cmp-wrap" data-reveal style={rd(120)}>
            <div className="cmp-scroll" tabIndex={0} role="region" aria-label="Vergelijking van drie manieren om AI Act-compliant te worden">
              <table>
                <thead><tr><th scope="col"><span className="sr-only">Onderdeel</span></th><th scope="col">Zelf doen</th><th scope="col">Consultant</th><th scope="col">ComplAI</th></tr></thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      <Cell value={row.self} cost={row.cost} />
                      <Cell value={row.consultant} cost={row.cost} />
                      <Cell value={row.complai} cost={row.cost} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="tiny" style={{ marginTop: 16 }} data-reveal>Een consultant blijft zinvol bij echt hoog-risico toepassingen. Dan levert dit dossier het voorwerk, tegen minder uren.</p>
        </div>
      </section>

      {/* PRIJZEN */}
      <section className="section" id="prijzen">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="eyebrow">Prijzen</p>
            <h2 className="h2">Minder per maand dan één uur adviseur</h2>
            <p className="lede">De scan is gratis en vraagt geen account. U zegt maandelijks op. Betaalt u per jaar, dan krijgt u twee maanden gratis.</p>
          </div>
          <div className="plans">
            {PLANS.map((plan, i) => (
              <div className={plan.highlighted ? "plan best" : "plan"} data-reveal style={rd(i * 90)} key={plan.id}>
                <p className="name">{plan.name}</p>
                <p className="price">€{formatEuro(plan.monthly)}<small>/mnd</small></p>
                <p className="terms">{plan.monthly === 0 ? "geen abonnement nodig" : "maandelijks opzegbaar"}</p>
                <ul>
                  {(planBullets[i] ?? []).map((b) => (
                    <li key={b}><Tick size={13} /> {b}</li>
                  ))}
                </ul>
                <Link href="/pricing" className={plan.highlighted ? "btn btn-primary" : "btn btn-ghost"}>Bekijk pakket</Link>
              </div>
            ))}
          </div>
          <p className="plan-foot" data-reveal>
            <span>Alle bedragen exclusief btw.</span>
            <span>Geen opstartkosten.</span>
            <span>Overstappen tussen pakketten kan elk moment.</span>
            <Link href="/pricing" className="link-arrow">Volledige functievergelijking <Arrow size={14} /></Link>
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section className="section" id="contact" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="contact" data-reveal>
            <div>
              <h2 className="h2">Liever eerst een mens dan een formulier?</h2>
              <p>Twijfelt u of dit voor uw organisatie de juiste route is, dan zeggen we dat liever in twintig minuten dan na drie maanden abonnement. U spreekt iemand die de verordening kent, niet een verkoper met een script.</p>
            </div>
            <div className="contact-ways">
              {contactWays.map((w) => (
                <Link className="way" href={w.href} key={w.title}>
                  <span className="way-ico" aria-hidden="true"><w.icon size={18} /></span>
                  <span><b>{w.title}</b><span>{w.sub}</span></span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq" style={{ background: "var(--mist)" }}>
        <div className="wrap faq">
          <div style={{ textAlign: "center", marginBottom: 20 }} data-reveal>
            <p className="eyebrow" style={{ justifyContent: "center" }}>Veelgestelde vragen</p>
            <h2 className="h2" style={{ marginTop: 18 }}>De vragen die het vaakst binnenkomen</h2>
          </div>
          {faqs.map((f) => (
            <div className="q" data-reveal key={f.q}>
              <h3><button aria-expanded="false"><span>{f.q}</span><span className="pm" aria-hidden="true"><Plus size={12} /></span></button></h3>
              <div className="a"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* SLOT */}
      <section className="section">
        <div className="wrap">
          <div className="final" data-reveal="scale">
            <p className="eyebrow">Vijf minuten</p>
            <h2 className="h2">Vijf minuten nu. Of weken, als iemand er straks om vraagt.</h2>
            <p>Doe de gratis risicoscan en ontvang direct uw risicocategorie, uw rol en de deadlines die voor u gelden — met een stappenplan dat u kunt doorsturen naar uw directie.</p>
            <div className="final-cta">
              <Link href="/scan" className="btn btn-mint btn-lg">Doe de gratis scan <Arrow /></Link>
              <Link href="#contact" className="btn btn-line btn-lg">Eerst iemand spreken</Link>
            </div>
            <p className="final-note">Geen account · geen betaalgegevens · u kunt op elk moment stoppen</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Cell({ value, cost }: { value: string | boolean; cost?: boolean }) {
  if (typeof value === "string") {
    return <td className={cost ? "cost" : undefined}>{value}</td>;
  }
  return (
    <td>
      {value ? (
        <span className="yes">✓<span className="sr-only">inbegrepen</span></span>
      ) : (
        <span className="no">—<span className="sr-only">niet inbegrepen</span></span>
      )}
    </td>
  );
}
