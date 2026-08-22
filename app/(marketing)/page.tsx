import Link from "next/link";
import type { CSSProperties } from "react";
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
  Package,
  Plus,
  Scale,
  ScanSearch,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
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

const trust = [
  { icon: Scale, text: "Gebaseerd op Verordening (EU) 2024/1689" },
  { icon: Clock, text: "Deadlines volgens de EU-tijdlijn (Art. 113)" },
  { icon: Languages, text: "Volledig in het Nederlands" },
  { icon: ShieldCheck, text: "Uw antwoorden blijven binnen de EU" },
];

const milestones = [
  {
    date: "2 februari 2025",
    tag: { label: "Geldt nu", cls: "tag-now" },
    title: "AI-geletterdheid en verboden praktijken",
    text: "Iedereen die met AI werkt moet aantoonbaar weten hoe die AI werkt en welke risico's eraan kleven (Art. 4). De praktijken uit Art. 5 mogen niet meer.",
  },
  {
    date: "2 augustus 2025",
    tag: { label: "Geldt nu", cls: "tag-now" },
    title: "Regels voor AI-modellen voor algemene doeleinden",
    text: "Aanbieders van GPAI-modellen vallen onder eigen documentatie- en transparantieverplichtingen. Gebruikt u zulke modellen, dan raakt dat uw leveranciersafspraken.",
  },
  {
    date: "2 december 2026",
    tag: { label: "Bijna", cls: "tag-soon" },
    title: "Transparantie richting uw klanten",
    text: "Chatbots moeten zich kenbaar maken als AI en AI-gegenereerde content moet herkenbaar zijn (Art. 50). Dit raakt juist de mkb-websites die vandaag al een AI-assistent draaien.",
  },
  {
    date: "2 december 2027",
    tag: { label: "Volgt", cls: "tag-next" },
    title: "De zware hoog-risicoverplichtingen",
    text: "De verplichtingen voor Bijlage III-systemen — denk aan werving, kredietbeoordeling of toegang tot voorzieningen. Met de Digital Omnibus verschoven van augustus 2026.",
  },
  {
    date: "Doorlopend",
    tag: { label: "Bij overtreding", cls: "tag-next" },
    title: "Boetes tot € 35 miljoen of 7% van de wereldomzet",
    text: "Voor mkb en start-ups geldt het laagste van de twee plafonds (Art. 99). Het toezicht in Nederland ligt bij bestaande toezichthouders zoals de AP, RDI, DNB, AFM en IGJ.",
  },
];

const laws = [
  "Artikel 4 — Aanbieders en gebruiksverantwoordelijken van AI-systemen nemen maatregelen om, zoveel mogelijk, te zorgen voor een toereikend niveau van AI-geletterdheid bij hun personeel en andere personen die namens hen betrokken zijn bij de werking en het gebruik van AI-systemen.",
  "Artikel 6, lid 2 — AI-systemen als bedoeld in bijlage III worden als AI-systemen met een hoog risico beschouwd, tenzij het AI-systeem geen significant risico op schade voor de gezondheid, de veiligheid of de grondrechten van natuurlijke personen inhoudt.",
  "Artikel 27 — Voorafgaand aan het gebruik van een AI-systeem met een hoog risico verrichten bepaalde gebruiksverantwoordelijken een beoordeling van het effect op de grondrechten dat het gebruik van een dergelijk systeem kan opleveren.",
  "Artikel 50 — Aanbieders zorgen ervoor dat AI-systemen die bedoeld zijn om rechtstreeks met natuurlijke personen te interageren, zo worden ontworpen dat de betrokkenen worden geïnformeerd dat zij met een AI-systeem interageren, tenzij dit duidelijk is.",
];

const todos = [
  {
    title: "Zet uw team op een leerpad",
    text: "E-learning per rol, met toets en certificaat als bewijs voor Art. 4.",
  },
  {
    title: "Classificeer elk AI-systeem",
    text: "Het register geeft per systeem een risico-suggestie op basis van Bijlage III, die u zelf bevestigt.",
  },
  {
    title: "Genereer uw FRIA",
    text: "De grondrechtenbeoordeling, vooringevuld met uw eigen organisatiegegevens.",
  },
  {
    title: "Meld AI in uw klantcontact",
    text: "Kant-en-klare transparantieverklaring voor uw chatbot en gegenereerde content.",
  },
];

const pains = [
  { icon: AlertTriangle, title: "Regels die niemand overziet", text: "Honderden pagina's wettekst, vol risicoklassen en uitzonderingen. Waar begint u?" },
  { icon: Clock, title: "De tijd dringt", text: "De verplichtingen treden gefaseerd in werking. Wie te lang wacht, loopt achter de feiten aan." },
  { icon: Euro, title: "Advies is prijzig", text: "Een extern adviestraject kost al snel duizenden euro's, terwijl veel van dat werk zich laat standaardiseren." },
  { icon: ScanSearch, title: "Geen zicht op wat er draait", text: "Welke AI draait er eigenlijk binnen uw organisatie? En wie draagt waarvoor de verantwoordelijkheid?" },
];

const startSteps = [
  { num: "01 — gratis", icon: Search, title: "Doe de risicoscan", text: "Zie in vijf minuten welke verplichtingen uit de AI Act op uw organisatie van toepassing zijn. Zonder account.", cta: { label: "Start de scan", href: "/scan" } },
  { num: "02 — vanaf € 19,99", icon: Package, title: "Kies uw pakket", text: "Van een eenvoudige start tot een volledig documentendossier. U zegt maandelijks op en betaalt geen opstartkosten.", cta: { label: "Bekijk pakketten", href: "/pricing" } },
  { num: "03 — zonder betaalgegevens", icon: UserPlus, title: "Maak een gratis account", text: "Een eigen compliance-omgeving. Uw collega's nodigt u later in een paar klikken uit.", cta: { label: "Registreer gratis", href: "/signup" } },
];

const features = [
  { icon: ShieldCheck, title: "Compliance-dashboard", text: "Uw gereedheidsscore, de stand per verplichting, wat er nog openstaat en welke deadlines eraan komen — alles op één scherm.", cls: "f f-wide" },
  { icon: Database, title: "AI-register", text: "Al uw AI-systemen bij elkaar, met per systeem een automatische risico-suggestie op basis van Bijlage III die u zelf bevestigt.", cls: "f f-wide" },
  { icon: ScanSearch, title: "Schaduw-AI-check", text: "Breng AI in kaart die nog nergens is vastgelegd. Juist dat gemis valt bij een controle als eerste op.", cls: "f" },
  { icon: FileText, title: "Documentgenerator", text: "Beleid, risicobeoordeling, FRIA en transparantieverklaring, meteen ingevuld met uw eigen gegevens.", cls: "f" },
  { icon: GraduationCap, title: "E-learning & certificaten", text: "Leerpaden per rol, met toetsen en certificaten, zodat u AI-geletterdheid (Art. 4) kunt aantonen.", cls: "f" },
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

const faqs = [
  { q: "Wat houdt de EU AI Act in?", a: "Het is de eerste brede Europese wet met regels voor zowel het bouwen als het inzetten van AI. Toepassingen worden ingedeeld op risico — van minimaal tot verboden — en aan elk niveau hangen eigen plichten. Praktisch komt het neer op het in kaart brengen van uw AI-gebruik, het bijspijkeren van AI-kennis bij uw medewerkers en openheid naar iedereen die met de AI te maken krijgt." },
  { q: "Raakt de wet mijn organisatie ook?", a: "Vrijwel zeker wel. Gebruikt of levert u AI — een tekstassistent, een chatbot, een selectietool of een voorspelmodel — dan valt u onder de wet, hoe groot of klein uw organisatie ook is. De scan toont u in enkele minuten welke plichten juist voor u van toepassing zijn." },
  { q: "Tegen wanneer moet ik dit op orde hebben?", a: "De invoering gebeurt gefaseerd. De regels voor verboden toepassingen (Art. 5) en AI-geletterdheid (Art. 4) gelden inmiddels. De transparantie-eisen (Art. 50) en de plichten voor hoog-risico systemen volgen daarna. ComplAI houdt de voor u relevante data automatisch bij." },
  { q: "Moet ik hiervoor een adviesbureau inschakelen?", a: "Voor de meeste mkb-bedrijven is dat niet nodig. ComplAI vertaalt de wet naar concrete stappen, levert de vereiste documenten als sjablonen die u met uw eigen gegevens invult, en biedt e-learning met certificaten — tegen een fractie van de kosten van een adviestraject." },
  { q: "Wat gebeurt er met mijn gegevens?", a: "Uw scans, documenten en accountgegevens bewaren wij versleuteld en binnen de EU (Supabase, regio eu-west-1). Wij werken uitsluitend met zorgvuldig gekozen subverwerkers onder een verwerkersovereenkomst en geven uw gegevens niet aan derden voor hún eigen doeleinden." },
  { q: "Is de risicoscan echt kosteloos?", a: "Ja. U doorloopt de volledige scan zonder account en downloadt daarna een PDF-rapport met uw score. Met een gratis account bewaart u die resultaten en volgt u relevante wetswijzigingen in het dashboard. Het AI-register en de documenten zijn beschikbaar vanaf het pakket Basis." },
];

export default function LandingPage() {
  return (
    <div className="hp">
      <StructuredData />
      <HomeEffects />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <span className="blob blob-1" />
          <span className="blob blob-2" />
          <span className="blob blob-3" />
        </div>
        <div className="grid-lines" />
        <div className="wrap hero-grid">
          <div data-reveal>
            <div className="status-pill">
              <span className="dot-live" /> De AI-wet geldt al
              <span className="badge" id="daysSince">dag —</span>
            </div>
            <h1 className="h1">
              De AI-wet,<br />vertaald naar wat <em className="hl">ú moet doen</em>.
            </h1>
            <p className="lede">
              Honderden pagina&apos;s Europese wettekst worden hier één lijst met
              afvinkbare stappen. Doe de gratis scan en zie binnen vijf minuten uw
              risicocategorie, uw rol en de deadlines die voor uw organisatie gelden.
            </p>
            <div className="hero-cta">
              <Link href="/scan" className="btn btn-primary btn-lg">
                Start gratis risicoscan <ArrowRight size={16} />
              </Link>
              <Link href="#vertaling" className="btn btn-ghost btn-lg">Bekijk hoe het werkt</Link>
            </div>
            <div className="hero-note">
              <span><i className="check-i"><Check size={9} /></i> In 5 minuten klaar</span>
              <span><i className="check-i"><Check size={9} /></i> Zonder account</span>
              <span><i className="check-i"><Check size={9} /></i> Met pdf-rapport</span>
            </div>
          </div>

          <div className="mock" data-reveal="scale" style={rd(160)}>
            <div className="mock-card">
              <div className="mock-top"><i /><i /><i /><span className="t">complai — dashboard</span></div>
              <div className="gauge-row">
                <div className="gauge">
                  <svg width="104" height="104" viewBox="0 0 104 104">
                    <circle cx="52" cy="52" r="44" fill="none" stroke="#E8EFF4" strokeWidth="10" />
                    <circle
                      id="gaugeArc"
                      cx="52"
                      cy="52"
                      r="44"
                      fill="none"
                      stroke="url(#g1)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray="276.5"
                      strokeDashoffset="276.5"
                      style={{ transition: "stroke-dashoffset 1.8s cubic-bezier(.22,.9,.28,1)" }}
                    />
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#1257E0" />
                        <stop offset="1" stopColor="#00C4A7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="gauge-val"><span id="gaugeNum">0</span><small>%</small></div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--display)", fontSize: 19, fontWeight: 600, letterSpacing: "-.02em" }}>
                    Gereedheidsscore
                  </div>
                  <p className="small" style={{ marginTop: 6, maxWidth: "24ch" }}>
                    4 van de 9 verplichtingen zijn afgerond. Nog 2 punten vragen deze maand actie.
                  </p>
                </div>
              </div>
              <div className="mock-rows">
                <div className="mrow" style={{ animationDelay: ".5s" }}><span className="chip chip-ok">Klaar</span> AI-geletterdheid <span className="art">Art. 4</span></div>
                <div className="mrow" style={{ animationDelay: ".68s" }}><span className="chip chip-ok">Klaar</span> AI-register bijgewerkt <span className="art">Bijlage III</span></div>
                <div className="mrow" style={{ animationDelay: ".86s" }}><span className="chip chip-busy">Bezig</span> Transparantieverklaring <span className="art">Art. 50</span></div>
                <div className="mrow" style={{ animationDelay: "1.04s" }}><span className="chip chip-todo">Open</span> FRIA-beoordeling <span className="art">Art. 27</span></div>
              </div>
              <div className="mock-foot">
                <span className="dot-live" /> Eerstvolgende deadline <span className="d" id="mockDeadline">—</span>
              </div>
            </div>
            <div className="float-tag a"><span className="chip chip-ok">Nieuw</span> 2 schaduw-AI-tools gevonden</div>
            <div className="float-tag b">🇳🇱 Volledig in het Nederlands</div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <div className="trust">
        <div className="wrap trust-in">
          {trust.map((t) => (
            <div className="trust-item" key={t.text}><t.icon size={16} /> {t.text}</div>
          ))}
        </div>
      </div>

      {/* KLOK — deadlines */}
      <section className="section clock" id="klok">
        <div className="wrap">
          <div style={{ maxWidth: 760 }} data-reveal>
            <span className="eyebrow">Art. 113 — toepassingsdata</span>
            <h2 className="h2">De invoering is niet aanstaande. Die is begonnen.</h2>
            <p className="lede">
              Twee verplichtingen gelden vandaag al, de rest komt in fases. Elke maand
              wachten is een maand die u straks in weken moet inhalen.
            </p>
          </div>

          <div className="counters" data-reveal style={rd(120)}>
            <div className="counter red">
              <div className="n" id="cSince">0</div>
              <div className="l">dagen dat AI-geletterdheid (Art. 4) en het verbod uit Art. 5 al gelden</div>
            </div>
            <div className="counter mint">
              <div className="n" id="cUntil">0</div>
              <div className="l">dagen tot de eerstvolgende deadline: <span id="nextLabel">—</span></div>
            </div>
          </div>

          <div className="rail" id="rail">
            <div className="rail-line"><div className="rail-fill" id="railFill" /></div>
            {milestones.map((m) => (
              <article className="mile" data-mile data-reveal key={m.title}>
                <span className="mile-dot" />
                <div className="mile-date">{m.date} <span className={`tag ${m.tag.cls}`}>{m.tag.label}</span></div>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </article>
            ))}
          </div>

          <div className="clock-foot">
            <p>
              Digital Omnibus — aangenomen door de Raad; publicatie in het Publicatieblad
              in afwachting. Tot publicatie geldt formeel de oorspronkelijke datum uit
              Art. 113. Wetgeving en deadlines kunnen wijzigen; wij houden de data in het
              platform actueel. Dit is beslissingsondersteuning, geen juridisch advies.
            </p>
            <Link href="/scan" className="btn btn-mint">
              Zie welke datum voor ú telt <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* WET → CHECKLIST */}
      <section className="translate" id="vertaling">
        <div className="wrap" style={{ paddingTop: "clamp(72px,10vw,140px)" }}>
          <div style={{ maxWidth: 720 }} data-reveal>
            <span className="eyebrow">De kern van ComplAI</span>
            <h2 className="h2" style={{ margin: "18px 0" }}>Links de wettekst. Rechts uw takenlijst.</h2>
            <p className="lede">
              Dit is precies wat het platform doet: het leest de verordening zo dat u hem
              niet hoeft te lezen. Scroll verder en zie de vertaling gebeuren.
            </p>
          </div>
        </div>

        <div className="tr-stage" id="trStage">
          <div className="tr-sticky">
            <div className="wrap">
              <div className="tr-grid">
                <div className="law" id="lawCard">
                  <div className="law-head"><span>Verordening (EU) 2024/1689</span><span>PB L, 12.7.2024</span></div>
                  {laws.map((l, i) => (<p data-law key={i}>{l}</p>))}
                  <div className="law-seal">— 458 blz. —</div>
                </div>

                <div>
                  <div className="todo-head">
                    <span className="eyebrow">Uw stappenplan</span>
                    <h3 className="h3" style={{ marginTop: 14 }}>Vier taken, met eigenaar en datum</h3>
                  </div>
                  <div className="todos" id="todos">
                    {todos.map((t) => (
                      <div className="todo" data-todo key={t.title}>
                        <span className="box"><Check size={12} /></span>
                        <div><b>{t.title}</b><span>{t.text}</span></div>
                      </div>
                    ))}
                  </div>
                  <div className="tr-progress"><span id="trCount">0</span>/4 vertaald · <span id="trPct">0</span>%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PIJNPUNTEN */}
      <section className="section">
        <div className="wrap">
          <div style={{ maxWidth: 640 }} data-reveal>
            <span className="eyebrow">Herkenbaar?</span>
            <h2 className="h2" style={{ marginTop: 18 }}>Vier redenen waarom dit blijft liggen</h2>
          </div>
          <div className="pain-grid">
            {pains.map((p, i) => (
              <div className="pain" data-reveal style={rd(i * 80)} key={p.title}>
                <div className="pain-ico"><p.icon size={20} /></div>
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
          <div style={{ maxWidth: 640 }} data-reveal>
            <span className="eyebrow">In drie stappen aan de slag</span>
            <h2 className="h2" style={{ margin: "18px 0 16px" }}>De volgorde bepaalt u zelf</h2>
            <p className="lede">Waar u ook start, alles komt samen in uw eigen dashboard.</p>
          </div>
          <div className="steps">
            {startSteps.map((s, i) => (
              <div className="step" data-reveal style={rd(i * 100)} key={s.title}>
                <span className="num">{s.num}</span>
                <h3 className="h3">{s.title}</h3>
                <p>{s.text}</p>
                <Link href={s.cta.href} className="link-arrow">{s.cta.label} <ArrowRight size={14} /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCTIES */}
      <section className="section" id="functies">
        <div className="wrap">
          <div className="feat-head">
            <div style={{ maxWidth: 620 }} data-reveal>
              <span className="eyebrow">Uw hele compliance op één plek</span>
              <h2 className="h2" style={{ marginTop: 18 }}>Negen onderdelen, één werkomgeving</h2>
            </div>
            <Link href="/demo" className="link-arrow" data-reveal style={rd(120)}>
              Bekijk de demo <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bento">
            {features.map((f, i) => (
              <div className={f.cls} data-reveal style={rd((i % 3) * 80)} key={f.title}>
                <span className="f-glow" />
                <div className="f-ico"><f.icon size={18} /></div>
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
          <div style={{ maxWidth: 660 }} data-reveal>
            <span className="eyebrow">Zelf uitpluizen, adviseur of ComplAI?</span>
            <h2 className="h2" style={{ margin: "18px 0 16px" }}>Hetzelfde resultaat, zonder de kosten en de wachttijd</h2>
          </div>
          <div className="cmp-wrap" data-reveal style={rd(120)}>
            <table>
              <thead><tr><th>&nbsp;</th><th>Zelf doen</th><th>Consultant</th><th>ComplAI</th></tr></thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <Cell value={row.self} cost={row.cost} />
                    <Cell value={row.consultant} cost={row.cost} />
                    <Cell value={row.complai} cost={row.cost} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PRIJZEN */}
      <section className="section" id="prijzen">
        <div className="wrap">
          <div style={{ maxWidth: 660 }} data-reveal>
            <span className="eyebrow">Prijzen</span>
            <h2 className="h2" style={{ margin: "18px 0 16px" }}>Een pakket dat bij uw organisatie past</h2>
            <p className="lede">De scan is gratis en vraagt geen account. Betaalt u per jaar, dan krijgt u twee maanden gratis.</p>
          </div>
          <div className="plans">
            {PLANS.map((plan, i) => (
              <div className={plan.highlighted ? "plan best" : "plan"} data-reveal style={rd(i * 90)} key={plan.id}>
                <div className="name">{plan.name}</div>
                <div className="price">€{formatEuro(plan.monthly)}<small>/mnd</small></div>
                <div className="terms">{plan.monthly === 0 ? "geen abonnement nodig" : "maandelijks opzegbaar"}</div>
                <p>{plan.tagline}</p>
                <Link href="/pricing" className={plan.highlighted ? "btn btn-primary" : "btn btn-ghost"}>Bekijk pakket</Link>
              </div>
            ))}
          </div>
          <p className="tiny" style={{ marginTop: 22 }} data-reveal>
            Alle pakketten en de volledige functievergelijking vindt u op de{" "}
            <Link href="/pricing" style={{ color: "var(--blue)", fontWeight: 600 }}>prijzenpagina</Link>.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq" style={{ background: "var(--mist)" }}>
        <div className="wrap faq">
          <div style={{ textAlign: "center", marginBottom: 20 }} data-reveal>
            <span className="eyebrow" style={{ justifyContent: "center" }}>Veelgestelde vragen</span>
            <h2 className="h2" style={{ marginTop: 18 }}>Kort antwoord op de vragen die het vaakst komen</h2>
          </div>
          {faqs.map((f) => (
            <div className="q" data-reveal key={f.q}>
              <button aria-expanded="false"><span>{f.q}</span><span className="pm"><Plus size={12} /></span></button>
              <div className="a"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* SLOT */}
      <section className="section">
        <div className="wrap">
          <div className="final" data-reveal="scale">
            <span className="eyebrow">Vijf minuten</span>
            <h2 className="h2">In vijf minuten weet u precies waar u staat</h2>
            <p>
              Doe de gratis risicoscan en ontvang direct uw compliance-score met concrete
              vervolgstappen. Zonder account, zonder advieskosten.
            </p>
            <Link href="/scan" className="btn btn-mint btn-lg">Start gratis risicoscan <ArrowRight size={16} /></Link>
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
  return <td>{value ? <span className="yes">✓</span> : <span className="no">—</span>}</td>;
}
