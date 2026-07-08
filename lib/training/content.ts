// E-learning content: role-based paths sharing five AI Act modules, each with a
// short quiz. Static content — answers are checked server-side on completion.

export interface QuizQuestion {
  question: string;
  options: string[];
  /** Correct option index for a single-answer question (omit when `answers` is set). */
  answer?: number;
  /** Correct option indices for a multi-select question. Presence ⇒ multi-select. */
  answers?: number[];
  /** Shown after the learner answers — the explanation is where the learning
   *  happens. Reference the relevant AI Act article here. */
  explanation?: string;
  /** Optional case/scenario framing rendered above the question. */
  scenario?: string;
}

export interface LessonSection {
  heading: string;
  paragraphs: string[];
}

export interface TrainingModule {
  id: string;
  title: string;
  minutes: number;
  intro: string;
  /** Short reading content shown (paged) before the quiz. */
  lessons?: LessonSection[];
  /** Question bank. Each attempt asks `drawCount` of these (all if unset). */
  quiz: QuizQuestion[];
  /** If set and smaller than the bank, an attempt draws this many at random. */
  drawCount?: number;
}

/** Pass mark as a fraction of the questions asked (0.8 = the classic 4/5). */
export const PASS_FRACTION = 0.8;

/** How many questions an attempt asks for a module (the completion denominator). */
export function askCount(module: TrainingModule): number {
  return module.drawCount && module.drawCount < module.quiz.length
    ? module.drawCount
    : module.quiz.length;
}

/** The correct option indices for a question (single or multi). */
export function correctKey(q: QuizQuestion): number[] {
  return (q.answers ?? (q.answer === undefined ? [] : [q.answer]))
    .slice()
    .sort((a, b) => a - b);
}

/** True when `selected` option indices match the question's correct answer(s).
 *  Fails safe: a question with no defined answer can never be marked correct. */
export function isCorrect(q: QuizQuestion, selected: number[]): boolean {
  const key = correctKey(q);
  const sel = Array.from(new Set(selected)).sort((a, b) => a - b);
  return key.length > 0 && sel.length === key.length && sel.every((v, i) => v === key[i]);
}

export type PathId = "employee" | "manager" | "admin";

export interface LearningPath {
  id: PathId;
  label: string;
  audience: string;
}

/** A module is "passed" with at least this many correct answers (out of 5). */
export const PASS_THRESHOLD = 4;

export const PATHS: LearningPath[] = [
  {
    id: "employee",
    label: "Medewerker",
    audience: "Voor iedereen die in het dagelijks werk met AI-tools werkt.",
  },
  {
    id: "manager",
    label: "Manager",
    audience: "Voor leidinggevenden die verantwoordelijk zijn voor AI-gebruik in hun team.",
  },
  {
    id: "admin",
    label: "Beheerder",
    audience: "Voor beheerders en technische rollen die AI-systemen inrichten en beheren.",
  },
];

const BASE_MODULES: TrainingModule[] = [
  {
    id: "what-is-ai",
    title: "Wat is AI?",
    minutes: 10,
    intro:
      "Een korte introductie in kunstmatige intelligentie: wat het is, welke vormen er zijn (zoals machine learning en generatieve AI) en waar u het in de praktijk tegenkomt.",
    quiz: [
      {
        question: "Wat is kunstmatige intelligentie (AI) in de kern?",
        options: [
          "Software die taken uitvoert die normaal menselijke intelligentie vereisen",
          "Elke vorm van computersoftware",
          "Alleen humanoïde robots",
          "Een soort database",
        ],
        answer: 0,
      },
      {
        question: "Wat is 'machine learning'?",
        options: [
          "Computers die handmatig worden geprogrammeerd met regels",
          "Systemen die patronen leren uit data",
          "Een programmeertaal",
          "Een type beeldscherm",
        ],
        answer: 1,
      },
      {
        question: "Wat is een voorbeeld van generatieve AI?",
        options: [
          "Een rekenmachine",
          "Een spamfilter",
          "Een tool die teksten of afbeeldingen genereert, zoals ChatGPT",
          "Een back-upsysteem",
        ],
        answer: 2,
      },
      {
        question: "Waarom kan AI fouten maken?",
        options: [
          "AI maakt nooit fouten",
          "Omdat het leert uit data die onvolledig of vertekend kan zijn",
          "Alleen door stroomstoringen",
          "Omdat het altijd willekeurig werkt",
        ],
        answer: 1,
      },
      {
        question: "Waar komt u in een kantoor AI tegen?",
        options: [
          "Alleen in gespecialiseerde software",
          "Nergens",
          "In tekstassistenten, spamfilters, vertaaltools en chatbots",
          "Alleen in de boekhouding",
        ],
        answer: 2,
      },
    ],
  },
  {
    id: "ai-act-15",
    title: "De EU AI Act & het risicomodel",
    minutes: 15,
    intro:
      "De eerste brede AI-wet ter wereld. U leert het risicogebaseerde model — van minimaal risico tot verboden toepassingen — plus de deadlines en de boetes. De quiz test of u het kunt toepassen, niet alleen of u de termen kent.",
    drawCount: 6,
    quiz: [
      {
        question: "Wat is de kernlogica van de AI Act?",
        options: [
          "Risicogebaseerd: hoe hoger het risico, hoe meer verplichtingen",
          "Leeftijdsgebaseerd",
          "Gebaseerd op de prijs van het systeem",
          "Een vrijwillig keurmerk zonder verplichtingen",
        ],
        answer: 0,
        explanation:
          "De wet kent vier risicoklassen: onaanvaardbaar (verboden — Art. 5), hoog (strenge eisen), beperkt (transparantie — Art. 50) en minimaal. Hoe hoger het risico, hoe zwaarder de plichten.",
      },
      {
        scenario:
          "Een HR-afdeling wil sollicitanten automatisch laten scoren en rangschikken door een AI-tool.",
        question: "In welke risicocategorie valt dit hoogstwaarschijnlijk?",
        options: ["Minimaal risico", "Hoog risico", "Verboden", "Buiten de AI Act"],
        answer: 1,
        explanation:
          "Werving en selectie staat in Annex III (punt 4): AI die beslist of ondersteunt bij aanname of beoordeling van mensen is hoog risico. Dan gelden extra eisen zoals menselijk toezicht (Art. 14) en logging (Art. 12).",
      },
      {
        question: "Welke van deze toepassingen is VERBODEN onder Artikel 5?",
        options: [
          "Een klantenservice-chatbot",
          "Emotieherkenning van werknemers op de werkvloer",
          "Een spamfilter",
          "Automatische vertaling",
        ],
        answer: 1,
        explanation:
          "Art. 5(1)(f) verbiedt het afleiden van emoties van mensen op het werk of in het onderwijs (behalve om medische of veiligheidsredenen). De andere voorbeelden zijn laag risico.",
      },
      {
        question: "Welke praktijken zijn verboden (Art. 5)? Selecteer alle juiste.",
        options: [
          "Social scoring van burgers op basis van hun gedrag",
          "Ongericht gezichtsbeelden van internet schrapen voor een database",
          "Een aanbevelingssysteem voor films",
          "Manipulatieve technieken die iemand ernstige schade toebrengen",
        ],
        answers: [0, 1, 3],
        explanation:
          "Art. 5 verbiedt o.a. social scoring (c), ongericht scrapen van gezichtsbeelden (e) en schadelijke manipulatie (a). Een filmaanbeveler is minimaal risico.",
      },
      {
        scenario: "Uw website heeft een chatbot die klantvragen beantwoordt.",
        question: "Wat eist Artikel 50?",
        options: [
          "Niets, chatbots vallen buiten de wet",
          "U moet mensen laten weten dat ze met een AI-systeem praten",
          "U heeft een vergunning nodig",
          "U moet de gesprekken publiceren",
        ],
        answer: 1,
        explanation:
          "Art. 50 (transparantie) verplicht u gebruikers te informeren dat zij met AI communiceren, tenzij dat overduidelijk is. Ook AI-gegenereerde content moet herkenbaar zijn.",
      },
      {
        question:
          "Wanneer gaan de meeste hoog-risico- en transparantieplichten gelden (Art. 113)?",
        options: [
          "2 februari 2025",
          "2 augustus 2026",
          "2 augustus 2027",
          "Ze gelden nog niet",
        ],
        answer: 1,
        explanation:
          "De meeste plichten (waaronder Annex III hoog-risico en Art. 50) gelden vanaf 2 augustus 2026. Verboden praktijken (Art. 5) en AI-geletterdheid (Art. 4) gelden al sinds 2 februari 2025; bepaalde product-gebonden hoog-risicosystemen (Annex I) pas vanaf 2 augustus 2027.",
      },
      {
        question: "Wat is de maximale boete voor een verboden AI-praktijk (Art. 99)?",
        options: [
          "Een waarschuwing",
          "€ 10.000",
          "Tot € 35 miljoen of 7% van de wereldwijde jaaromzet",
          "Tot € 1 miljoen",
        ],
        answer: 2,
        explanation:
          "Art. 99: overtreding van de verbodsbepalingen kan leiden tot een boete tot € 35 miljoen of 7% van de wereldwijde jaaromzet — het hoogste van de twee. Voor andere overtredingen geldt tot € 15 miljoen of 3%.",
      },
      {
        scenario: "Uw team gebruikt ChatGPT om conceptmails en samenvattingen te schrijven.",
        question: "Welke categorie past hier het best?",
        options: [
          "Verboden",
          "Hoog risico",
          "Beperkt/minimaal risico — let wel op transparantie en vertrouwelijkheid",
          "Buiten de AI Act",
        ],
        answer: 2,
        explanation:
          "Algemeen productiviteitsgebruik van generatieve AI is doorgaans laag risico. Let wel op Art. 50 (herkenbaarheid van AI-content) en plak geen vertrouwelijke of persoonsgegevens in externe tools. Pas bij een Annex III-doel wordt het hoog risico.",
      },
      {
        question:
          "Een niet-EU-leverancier levert AI waarvan de uitkomsten in de EU worden gebruikt. Geldt de AI Act?",
        options: [
          "Nee, alleen EU-bedrijven vallen eronder",
          "Ja, ook buiten de EU als de output in de EU wordt gebruikt",
          "Alleen voor overheden",
          "Alleen als het bedrijf een EU-kantoor heeft",
        ],
        answer: 1,
        explanation:
          "Art. 2 geeft de wet een extraterritoriaal bereik: ook aanbieders en gebruiksverantwoordelijken buiten de EU vallen eronder wanneer de output binnen de EU wordt gebruikt.",
      },
    ],
  },
  {
    id: "responsible-use",
    title: "Verantwoord gebruik van AI",
    minutes: 10,
    intro:
      "Hoe gebruikt u AI op een veilige en verantwoorde manier? Denk aan het controleren van output, het beschermen van vertrouwelijke informatie en het houden van menselijk toezicht.",
    quiz: [
      {
        question: "Wat doet u met de output van een AI-tool?",
        options: [
          "Klakkeloos overnemen",
          "Altijd kritisch controleren voordat u erop vertrouwt",
          "Direct doorsturen naar klanten",
          "Negeren",
        ],
        answer: 1,
      },
      {
        question: "Mag u vertrouwelijke bedrijfsdata in een publieke AI-tool plakken?",
        options: [
          "Ja, altijd",
          "Alleen als het snel moet",
          "Nee, niet zonder dat dit is toegestaan en veilig is",
          "Ja, AI-tools zijn altijd veilig",
        ],
        answer: 2,
      },
      {
        question: "Wat betekent 'menselijk toezicht'?",
        options: [
          "Een mens kan AI-beslissingen controleren en corrigeren",
          "De AI controleert de mens",
          "Niemand kijkt mee",
          "Toezicht door een externe partij",
        ],
        answer: 0,
      },
      {
        question: "Wat doet u bij twijfel over een AI-uitkomst?",
        options: [
          "U vertrouwt blind op de AI",
          "U verifieert de uitkomst of overlegt met een collega",
          "U verwijdert het systeem",
          "U doet niets",
        ],
        answer: 1,
      },
      {
        question: "Waarom is bronvermelding bij AI-content belangrijk?",
        options: [
          "Dat is nooit nodig",
          "Voor transparantie en betrouwbaarheid",
          "Alleen voor afbeeldingen",
          "Alleen voor de directie",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: "recognising-risks",
    title: "Risico's herkennen en melden",
    minutes: 10,
    intro:
      "Leer signalen van problematisch AI-gebruik herkennen — zoals bias, onjuiste output of privacyrisico's — en weet hoe en waar u dit binnen de organisatie meldt.",
    quiz: [
      {
        question: "Wat is 'bias' in een AI-systeem?",
        options: [
          "Een technische storing",
          "Systematische vertekening die tot oneerlijke uitkomsten leidt",
          "Een type virus",
          "Een snelheidsprobleem",
        ],
        answer: 1,
      },
      {
        question: "Wat is een signaal dat een AI-systeem mogelijk niet eerlijk werkt?",
        options: [
          "Het werkt snel",
          "Bepaalde groepen krijgen stelselmatig andere uitkomsten",
          "Het heeft een mooie interface",
          "Het is populair",
        ],
        answer: 1,
      },
      {
        question: "Wat doet u als u een risico met een AI-systeem opmerkt?",
        options: [
          "Niets, het lost zichzelf op",
          "U meldt het via het interne meldproces",
          "U verwijdert het systeem zelf",
          "U vertelt het alleen aan een vriend",
        ],
        answer: 1,
      },
      {
        question: "Waarom is het melden van AI-risico's belangrijk?",
        options: [
          "Om problemen vroeg te signaleren en schade te voorkomen",
          "Het is verplicht om collega's te controleren",
          "Dat is niet belangrijk",
          "Alleen voor de statistieken",
        ],
        answer: 0,
      },
      {
        question: "Wie is verantwoordelijk voor het opvolgen van een melding?",
        options: [
          "Niemand",
          "De aangewezen verantwoordelijke of leidinggevende",
          "De leverancier van de koffieautomaat",
          "De klant",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: "privacy-ai",
    title: "Privacy en AI",
    minutes: 10,
    intro:
      "AI en persoonsgegevens raken elkaar voortdurend. U leert hoe de AI Act en de AVG samenhangen en hoe u zorgvuldig met persoonsgegevens omgaat bij het gebruik van AI.",
    quiz: [
      {
        question: "Welke wet beschermt persoonsgegevens in de EU?",
        options: ["De AVG (GDPR)", "De AI Act alleen", "De Mededingingswet", "De Arbowet"],
        answer: 0,
      },
      {
        question: "Wat is een goede praktijk bij AI en persoonsgegevens?",
        options: [
          "Zoveel mogelijk data verzamelen",
          "Dataminimalisatie: alleen wat nodig is",
          "Alle data publiek maken",
          "Data nooit beveiligen",
        ],
        answer: 1,
      },
      {
        question: "Mag u persoonsgegevens onbeperkt in elke AI-tool verwerken?",
        options: [
          "Ja",
          "Nee, dit moet voldoen aan de AVG en intern beleid",
          "Alleen op vrijdag",
          "Alleen kleine bestanden",
        ],
        answer: 1,
      },
      {
        question: "Wat is een verwerkersovereenkomst?",
        options: [
          "Een afspraak over kantoorartikelen",
          "Een overeenkomst over hoe een leverancier met uw data omgaat",
          "Een arbeidscontract",
          "Een softwarelicentie",
        ],
        answer: 1,
      },
      {
        question: "Wat doet u bij een mogelijk datalek via een AI-tool?",
        options: [
          "Niets",
          "Direct melden volgens de interne datalekprocedure",
          "Wachten tot iemand het merkt",
          "De tool blijven gebruiken",
        ],
        answer: 1,
      },
    ],
  },
];

// Short reading content per module, shown (paged) before the quiz so learners
// actually learn before being tested. Grounded in Reg. (EU) 2024/1689.
const MODULE_LESSONS: Record<string, LessonSection[]> = {
  "what-is-ai": [
    {
      heading: "Wat is kunstmatige intelligentie?",
      paragraphs: [
        "AI is software die taken uitvoert die normaal menselijke intelligentie vereisen: patronen herkennen, taal begrijpen of beslissingen ondersteunen.",
        "De AI Act definieert een AI-systeem als een machinaal systeem dat met een zekere mate van autonomie werkt en output genereert — zoals voorspellingen, aanbevelingen of beslissingen — die de fysieke of digitale omgeving kan beïnvloeden.",
      ],
    },
    {
      heading: "Welke vormen zijn er?",
      paragraphs: [
        "Machine learning leert patronen uit data in plaats van vaste regels. Generatieve AI (zoals ChatGPT of beeldgeneratoren) maakt nieuwe tekst, beeld of audio.",
        "Klassieke, volledig regelgebaseerde software valt meestal buiten de definitie. Twijfelt u? Behandel het dan als AI en leg het vast in uw register.",
      ],
    },
    {
      heading: "Waar komt u het tegen?",
      paragraphs: [
        "In chatbots, tekst- en beeldgeneratie, aanbevelingen, spamfilters en cv-selectie.",
        "Let op: veel gangbare software heeft inmiddels AI-functies ingebouwd (Microsoft 365, Google Workspace, CRM's). Ook dat telt mee.",
      ],
    },
  ],
  "ai-act-15": [
    {
      heading: "Waarom deze wet er is",
      paragraphs: [
        "Kunstmatige intelligentie neemt steeds vaker deel aan beslissingen die mensen direct raken: wie er wordt uitgenodigd voor een sollicitatiegesprek, wie een lening of verzekering krijgt, welke behandeling een patiënt krijgt voorgesteld, of iemand als mogelijk fraudegeval wordt aangemerkt. Wanneer zulke beslissingen oneerlijk, ondoorzichtig of onjuist zijn, kan de schade groot zijn én moeilijk terug te draaien. Daarom heeft de EU de AI Act (Verordening (EU) 2024/1689) aangenomen: de eerste brede, sectoroverstijgende AI-wet ter wereld.",
        "Het doel is nadrukkelijk tweeledig. Enerzijds vertrouwen: AI die in de EU wordt gebruikt moet veilig, transparant, traceerbaar en niet-discriminerend zijn en de grondrechten respecteren. Anderzijds ruimte voor innovatie: door één set regels voor de hele interne markt te maken — in plaats van 27 verschillende nationale regels — weten bedrijven waar ze aan toe zijn en kunnen ze in heel Europa opschalen.",
        "Belangrijk om te begrijpen: de wet reguleert niet 'AI' als technologie op zichzelf, maar het gebruik ervan en het risico dat dat gebruik met zich meebrengt. Precies dezelfde technologie kan in de ene context volstrekt onschuldig zijn en in de andere streng gereguleerd. Een taalmodel dat een vakantiemail opstelt is iets heel anders dan hetzelfde model dat bepaalt of iemand wordt aangenomen.",
        "De wet is sinds 2 februari 2025 van kracht en wordt stap voor stap ingevoerd tot 2027. Twee onderdelen gelden al: de verboden praktijken en de plicht om te zorgen voor voldoende AI-geletterdheid bij uw medewerkers. Die laatste plicht is de reden dat u nu deze training doet.",
      ],
    },
    {
      heading: "Wat is 'AI' volgens de wet?",
      paragraphs: [
        "Niet elk stukje software is 'AI'. De AI Act (Art. 3, lid 1) omschrijft een AI-systeem als een machinaal systeem dat is ontworpen om met een zekere mate van autonomie te werken, dat zich na de uitrol kan aanpassen, en dat uit de ontvangen input afleidt hoe het output genereert — zoals voorspellingen, aanbevelingen of beslissingen — die de fysieke of digitale omgeving kan beïnvloeden.",
        "De kern zit in het woord 'afleiden' (inference). Een AI-systeem leidt patronen of uitkomsten af uit data, in plaats van simpelweg een vast, door mensen geschreven regelscript uit te voeren. Een klassieke rekenformule in een spreadsheet of een eenvoudige 'als-dit-dan-dat'-macro valt daar meestal buiten. Een model dat uit duizenden voorbeelden heeft geléérd om spam te herkennen of tekst te genereren, valt er meestal wél onder.",
        "Voorbeelden die eronder vallen: tekst- en beeldgeneratoren (zoals ChatGPT of beeld-AI), aanbevelingssystemen, spraak- en beeldherkenning, fraudedetectie, cv-selectie en chatbots. Let op een valkuil: veel gangbare kantoorsoftware heeft inmiddels AI-functies ingebouwd — denk aan Microsoft 365 Copilot, Google Workspace, en AI-assistenten in CRM- en boekhoudpakketten. Ook die functies tellen mee, ook al heeft u ze niet als 'AI' aangeschaft.",
        "Twijfelt u of iets een AI-systeem is? Behandel het dan als AI en leg het vast in uw AI-register. Het register is het fundament onder alles wat volgt: u kunt pas beoordelen welke verplichtingen gelden als u eerst in kaart heeft welke AI uw organisatie eigenlijk gebruikt — inclusief de tools die medewerkers zelf hebben aangezet ('schaduw-AI').",
      ],
    },
    {
      heading: "Het risicomodel: vier niveaus",
      paragraphs: [
        "De hele wet draait om één idee: hoe groter het risico voor mensen, hoe zwaarder de eisen. De AI Act ordent AI in vier niveaus, te zien als een piramide met bovenin weinig, zwaar gereguleerde toepassingen en onderin de grote massa alledaagse AI.",
        "Onaanvaardbaar risico — verboden (Art. 5). Een klein aantal toepassingen is simpelweg verboden omdat ze niet te verenigen zijn met de grondrechten. Voorbeelden: social scoring van burgers, manipulatie die ernstige schade veroorzaakt, en emotieherkenning op de werkvloer of in het onderwijs. Hier bestaat geen 'ja, mits' — het mag gewoon niet, en dit verbod geldt al sinds februari 2025.",
        "Hoog risico (Annex III en Annex I). AI die belangrijke beslissingen over mensen neemt of daarbij ondersteunt — werving en selectie, krediet, verzekering, onderwijs, of toegang tot essentiële publieke en private diensten — is toegestaan, maar onder strenge voorwaarden: een risicomanagementsysteem, eisen aan datakwaliteit, menselijk toezicht, logging, technische documentatie en soms een grondrechtentoets (FRIA). Dit is de categorie waar de meeste compliance-inspanning gaat zitten, en waar de meeste mkb-organisaties met minstens één systeem in terechtkomen.",
        "Beperkt risico — transparantie (Art. 50). Voor toepassingen als chatbots en AI-gegenereerde content geldt vooral een informatieplicht: mensen moeten weten dat ze met een AI-systeem te maken hebben, of dat wat ze zien door AI is gemaakt (denk aan 'deepfakes' en gegenereerde afbeeldingen).",
        "Minimaal risico. Verreweg de meeste alledaagse AI — spamfilters, vertaaltools, tekstassistentie, autocorrectie — valt in deze categorie. Hiervoor stelt de AI Act geen bijzondere verplichtingen. Wél blijft verantwoord gebruik gelden, en blijft de privacywetgeving (AVG) onverkort van toepassing zodra er persoonsgegevens in het spel zijn.",
      ],
    },
    {
      heading: "Verboden praktijken uitgelicht (Art. 5)",
      paragraphs: [
        "Omdat de verbodsbepalingen absoluut zijn én al gelden, is het belangrijk om ze te kunnen herkennen — ook al zult u ze in een normaal mkb zelden zelf inzetten. De wet verbiedt onder meer de volgende categorieën.",
        "Manipulatie en uitbuiting: AI die met onderbewuste of bewust misleidende technieken het gedrag van mensen wezenlijk verstoort en zo ernstige schade veroorzaakt, en AI die kwetsbaarheden van mensen uitbuit vanwege hun leeftijd, een beperking of een specifieke sociale of economische situatie.",
        "Social scoring: het over langere tijd beoordelen of classificeren van mensen op basis van hun sociale gedrag of afgeleide persoonskenmerken, waarbij dat 'cijfer' leidt tot nadelige behandeling in een niet-gerelateerde context of buiten verhouding tot het gedrag.",
        "Biometrie en profilering: het ongericht schrapen van gezichtsbeelden van internet of camerabeelden om herkenningsdatabases mee op te bouwen; emotieherkenning op het werk of in het onderwijs (behalve om medische of veiligheidsredenen); en biometrische categorisering die bedoeld is om gevoelige kenmerken zoals ras, politieke opvatting, geloof of seksuele geaardheid af te leiden.",
        "De praktische les: ken deze lijst, zodat u meteen een rode vlag herkent als een leverancier of tool zoiets aanbiedt — bijvoorbeeld software die belooft de 'betrokkenheid' of 'stemming' van medewerkers te meten via camera's. Herkent u zo'n toepassing? Gebruik die niet en meld het bij de AI-verantwoordelijke in uw organisatie.",
      ],
    },
    {
      heading: "Uw rol: aanbieder of gebruiksverantwoordelijke?",
      paragraphs: [
        "De AI Act legt verplichtingen op afhankelijk van uw rol bij een systeem. Twee rollen doen er voor de meeste organisaties toe, en het verschil bepaalt wat u moet doen.",
        "Aanbieder ('provider'): u ontwikkelt een AI-systeem of brengt het onder uw eigen naam of merk op de markt. Aanbieders dragen de zwaarste last — zij moeten een hoog-risicosysteem volledig laten voldoen aan alle eisen vóórdat het op de markt komt, inclusief conformiteitsbeoordeling en technische documentatie.",
        "Gebruiksverantwoordelijke ('deployer'): u gebruikt een AI-systeem van een ander onder eigen gezag binnen uw organisatie. De meeste mkb'ers zitten in deze rol. Uw plichten zijn lichter, maar reëel: gebruik het systeem volgens de instructies van de aanbieder, zorg voor bekwaam menselijk toezicht, bewaar de automatisch gegenereerde logs, en informeer betrokkenen — en voer voor sommige hoog-risicotoepassingen vooraf een grondrechtentoets (FRIA) uit.",
        "Let op een belangrijke valkuil: u kunt ongemerkt 'aanbieder' worden. Zet u uw eigen naam of merk op een systeem, past u een bestaand hoog-risicosysteem wezenlijk aan, of gebruikt u het voor een duidelijk ander doel dan waarvoor het is bedoeld? Dan kunt u de zwaardere aanbiedersverplichtingen krijgen. Weten in welke rol u zit — per systeem — is dus de sleutel tot weten wat u moet regelen.",
      ],
    },
    {
      heading: "Wanneer geldt wat? (Art. 113)",
      paragraphs: [
        "De wet wordt gefaseerd ingevoerd, zodat organisaties tijd hebben om zich voor te bereiden. Het is een misverstand dat 'het allemaal nog niet geldt' — een deel is al van kracht. De hoofdlijn van de tijdlijn:",
        "2 februari 2025: de verboden praktijken (Art. 5) en de plicht tot AI-geletterdheid (Art. 4) gelden. Dit is nu dus al van kracht.",
        "2 augustus 2025: de regels voor general-purpose AI-modellen (GPAI) en het bestuurlijke kader — toezichthouders en het boeteregime — treden in werking.",
        "2 augustus 2026: het leeuwendeel van de wet gaat gelden, waaronder de hoog-risico-eisen voor de Annex III-toepassingen en de transparantieplichten van Art. 50. Voor de meeste organisaties is dit de belangrijkste datum.",
        "2 augustus 2027: de laatste fase, voor bepaalde hoog-risicosystemen die onderdeel zijn van producten onder bestaande productwetgeving (Annex I). De boodschap: 2026 is dichterbij dan het lijkt, en voorbereiding — een register opbouwen, documentatie maken, mensen trainen — kost tijd. Vroeg beginnen loont.",
      ],
    },
    {
      heading: "Bereik en boetes",
      paragraphs: [
        "De AI Act heeft een ruim, extraterritoriaal bereik (Art. 2). De wet geldt niet alleen voor bedrijven in de EU, maar ook voor aanbieders en gebruiksverantwoordelijken búiten de EU wanneer de output van het systeem in de EU wordt gebruikt. 'Buiten de EU' betekent dus niet 'buiten de wet': een Amerikaanse of Aziatische tool die u in Nederland inzet, valt gewoon onder de wet.",
        "Niet-naleving kan fors kosten. Voor de verboden praktijken (Art. 5) gelden boetes tot € 35 miljoen of 7% van de wereldwijde jaaromzet — het hoogste van de twee. Voor de meeste andere overtredingen tot € 15 miljoen of 3%, en voor het verstrekken van onjuiste of misleidende informatie aan toezichthouders tot € 7,5 miljoen of 1%.",
        "Voor het mkb en start-ups voorziet de wet in verhoudingsgewijs lagere maxima, zodat een boete proportioneel blijft. Maar de kern verandert niet: naleving is geen vrijblijvende papieroefening. Naast de boete zelf spelen reputatieschade en aansprakelijkheid een rol als een AI-systeem iemand benadeelt.",
        "De praktische vertaling: breng in kaart welke AI u gebruikt, bepaal per systeem in welke risicocategorie het valt en welke rol u heeft, en regel de bijbehorende verplichtingen. Dat is precies waar de rest van deze training en de tools van ComplAI — de risicoscan, het register en de documentgenerator — u stap voor stap bij helpen.",
      ],
    },
    {
      heading: "Wat betekent dit concreet voor u?",
      paragraphs: [
        "U hoeft geen jurist te worden. Voor de meeste medewerkers komt het neer op vijf gewoonten: begrijp de vier risiconiveaus, herken wanneer een toepassing hoog risico of verboden is, wees transparant over AI-gebruik, houd altijd menselijk toezicht bij beslissingen over mensen, en meld het als u twijfelt.",
        "Voor uw organisatie als geheel is de volgorde logisch: (1) breng alle AI in beeld in het register, inclusief ingebouwde en zelf-aangezette tools; (2) bepaal per systeem de risicocategorie en uw rol; (3) regel de bijbehorende verplichtingen — documentatie, menselijk toezicht, transparantie, en waar nodig een FRIA; en (4) houd het actueel, want AI verandert snel en uw register en beoordeling moeten meebewegen.",
        "In de volgende modules maken we elk onderdeel concreet: de verboden praktijken, het herkennen van hoog risico, de transparantieplichten, verantwoord dagelijks gebruik en de samenhang met privacy. Deze module gaf u het raamwerk waarmee de rest op zijn plek valt — beschouw het als de kaart voordat we de route in detail bekijken.",
      ],
    },
  ],
  "responsible-use": [
    {
      heading: "Menselijk toezicht",
      paragraphs: [
        "AI ondersteunt, mensen beslissen. Bij beslissingen over mensen — sollicitanten, klanten, medewerkers — moet een mens kunnen ingrijpen en de uitkomst kunnen herzien.",
        "Vertrouw AI-output nooit blind, zeker niet als die gevolgen heeft voor personen.",
      ],
    },
    {
      heading: "Wees transparant",
      paragraphs: [
        "Laat mensen weten wanneer ze met een AI-systeem te maken hebben, bijvoorbeeld een chatbot, of wanneer content door AI is gegenereerd (Art. 50).",
      ],
    },
    {
      heading: "Let op kwaliteit en bronnen",
      paragraphs: [
        "Generatieve AI kan fouten maken of overtuigend klinkende onzin produceren ('hallucineren'). Controleer feiten en wees kritisch op vertekening (bias).",
        "Deel geen vertrouwelijke of persoonsgegevens met externe AI-tools zonder dat dit is toegestaan en vastgelegd.",
      ],
    },
  ],
  "recognising-risks": [
    {
      heading: "Verboden praktijken (Art. 5)",
      paragraphs: [
        "Sommige toepassingen zijn simpelweg verboden: social scoring, manipulatie die ernstige schade veroorzaakt, emotieherkenning op het werk of in het onderwijs, en het ongericht scrapen van gezichtsbeelden.",
        "Herkent u zoiets in uw organisatie? Meld het direct.",
      ],
    },
    {
      heading: "Signalen van hoog risico",
      paragraphs: [
        "AI die beslist of ondersteunt bij werving, krediet, verzekering, onderwijs of toegang tot essentiële diensten is vaak hoog risico (Annex III).",
        "Daar gelden extra eisen, zoals menselijk toezicht, logging en soms een grondrechtentoets (FRIA).",
      ],
    },
    {
      heading: "Melden bij twijfel",
      paragraphs: [
        "Twijfelt u of een toepassing mag of hoog risico is? Meld het bij de AI-verantwoordelijke in uw organisatie.",
        "Beter één keer te veel gemeld dan een verboden of hoog-risico systeem over het hoofd gezien.",
      ],
    },
  ],
  "privacy-ai": [
    {
      heading: "AI en persoonsgegevens",
      paragraphs: [
        "Veel AI verwerkt persoonsgegevens. Naast de AI Act blijft de AVG (GDPR) volledig gelden.",
        "Verwerk alleen de gegevens die u echt nodig heeft (dataminimalisatie) en zorg voor een geldige grondslag.",
      ],
    },
    {
      heading: "Wees voorzichtig met invoer",
      paragraphs: [
        "Wat u in een externe AI-tool typt, kan worden opgeslagen of gebruikt voor training.",
        "Deel geen klant-, medische of andere vertrouwelijke gegevens zonder dat dit is toegestaan en vastgelegd, bijvoorbeeld via een verwerkersovereenkomst.",
      ],
    },
    {
      heading: "Rechten van betrokkenen",
      paragraphs: [
        "Mensen hebben recht op inzage, correctie en bezwaar — ook bij besluiten waar AI aan te pas komt.",
        "Bij besluiten met grote impact heeft iemand recht op een menselijke beoordeling.",
      ],
    },
  ],
};

// Role-specific modules on top of the shared core. Art. 4 requires AI literacy
// "proportionate to the role and context", so managers get oversight/accountability
// content and beheerders (technical roles) get risk-management/documentation content.
const ROLE_MODULES: TrainingModule[] = [
  // ---- Manager ----
  {
    id: "human-oversight",
    title: "Menselijk toezicht inrichten (Art. 14)",
    minutes: 12,
    intro:
      "Voor leidinggevenden: hoe u effectief menselijk toezicht organiseert op hoog-risico AI, zodat mensen beslissingen kunnen begrijpen, controleren en zo nodig overrulen of stoppen.",
    lessons: [
      {
        heading: "Waarom menselijk toezicht?",
        paragraphs: [
          "Artikel 14 eist dat hoog-risico AI zó is ingericht dat mensen er effectief toezicht op kunnen houden, om risico's voor gezondheid, veiligheid en grondrechten te voorkomen of te beperken.",
          "Als leidinggevende zorgt u dat de juiste mensen zijn aangewezen én toegerust om dat toezicht daadwerkelijk uit te oefenen.",
        ],
      },
      {
        heading: "Wat is effectief toezicht?",
        paragraphs: [
          "Wie toezicht houdt, moet de mogelijkheden én de grenzen van het systeem begrijpen, alert blijven op 'automation bias' (blind vertrouwen op AI), de output goed interpreteren, en kunnen besluiten het systeem niet te gebruiken, te overrulen of te stoppen.",
          "Toezicht is pas effectief als de betrokkene tijd, kennis en mandaat heeft om in te grijpen.",
        ],
      },
      {
        heading: "Uw rol als leidinggevende",
        paragraphs: [
          "Wijs bekwame, getrainde mensen aan met de bevoegdheid om in te grijpen, en laat AI-beslissingen niet ongecontroleerd doorlopen — zeker niet bij beslissingen over mensen zoals werving of beoordeling.",
        ],
      },
    ],
    quiz: [
      {
        question: "Wat vereist Artikel 14?",
        options: [
          "Dat hoog-risico AI zo is ingericht dat mensen er effectief toezicht op kunnen houden",
          "Dat AI volledig autonoom beslist",
          "Dat er nooit een mens bij betrokken is",
          "Dat AI verboden wordt",
        ],
        answer: 0,
      },
      {
        question: "Wat is 'automation bias'?",
        options: [
          "Een technische storing in het model",
          "De neiging om AI-output te blind te vertrouwen",
          "Een vorm van cyberaanval",
          "Een type trainingsdata",
        ],
        answer: 1,
      },
      {
        question: "Wat moet iemand die toezicht houdt kunnen doen?",
        options: [
          "Alleen toekijken",
          "De AI-uitkomst negeren, overrulen of het systeem stoppen",
          "Het systeem sneller maken",
          "De data verwijderen",
        ],
        answer: 1,
      },
      {
        question: "Hoe zorgt u dat toezicht daadwerkelijk werkt?",
        options: [
          "Door niemand aan te wijzen",
          "Door bekwame mensen aan te wijzen met tijd en mandaat om in te grijpen",
          "Door de AI zichzelf te laten controleren",
          "Door het toezicht uit te besteden aan de leverancier",
        ],
        answer: 1,
      },
      {
        question: "Wanneer is menselijk toezicht extra belangrijk?",
        options: [
          "Bij een spellingcontrole",
          "Nooit",
          "Bij beslissingen met impact op mensen, zoals werving of beoordeling",
          "Alleen bij hardware",
        ],
        answer: 2,
      },
    ],
  },
  {
    id: "deployer-duties",
    title: "Verantwoordelijkheden bij gebruik (Art. 26 & 27)",
    minutes: 12,
    intro:
      "Als gebruiksverantwoordelijke ('deployer') gebruikt u AI van een leverancier. Deze module behandelt uw plichten: gebruik volgens de instructies, toezicht, logging bewaren en betrokkenen informeren.",
    lessons: [
      {
        heading: "Gebruik volgens de gebruiksaanwijzing (Art. 26)",
        paragraphs: [
          "U bent 'gebruiksverantwoordelijke' als u een AI-systeem van een ander onder eigen gezag gebruikt. Gebruik een hoog-risico systeem volgens de gebruiksaanwijzing van de aanbieder.",
          "Wijs het menselijk toezicht toe aan bekwame personen met de nodige bevoegdheid en ondersteuning.",
        ],
      },
      {
        heading: "Monitoren, loggen en melden",
        paragraphs: [
          "Houd de werking in de gaten en bewaar de automatisch gegenereerde logs.",
          "Ziet u een ernstig risico of incident? Schort het gebruik op en informeer de aanbieder en, waar nodig, de toezichthouder.",
        ],
      },
      {
        heading: "Mensen informeren (Art. 26(7) & 27)",
        paragraphs: [
          "Informeer werknemers en hun vertegenwoordigers vóór u hoog-risico AI op de werkvloer inzet, en informeer betrokkenen dat zij aan een hoog-risico systeem worden onderworpen.",
          "Sommige gebruiksverantwoordelijken (zoals overheidsinstanties en bepaalde diensten) moeten vooraf een grondrechtentoets (FRIA, Art. 27) uitvoeren.",
        ],
      },
    ],
    quiz: [
      {
        question: "Wat is een 'gebruiksverantwoordelijke' (deployer)?",
        options: [
          "De maker van het AI-systeem",
          "Een organisatie die een AI-systeem van een ander gebruikt onder eigen gezag",
          "De toezichthouder",
          "De eindklant",
        ],
        answer: 1,
      },
      {
        question: "Hoe moet u een hoog-risico systeem gebruiken?",
        options: [
          "Zoals u zelf wilt",
          "Volgens de gebruiksaanwijzing van de aanbieder",
          "Zonder toezicht",
          "Alleen in het weekend",
        ],
        answer: 1,
      },
      {
        question: "Wat doet u met de automatisch gegenereerde logs?",
        options: ["Direct wissen", "Bewaren", "Publiceren", "Negeren"],
        answer: 1,
      },
      {
        question: "Wie moet u informeren vóór inzet van hoog-risico AI op de werkvloer?",
        options: [
          "Niemand",
          "Alleen de directie",
          "De betrokken werknemers en hun vertegenwoordigers",
          "De concurrentie",
        ],
        answer: 2,
      },
      {
        question: "Wat is een FRIA (Art. 27)?",
        options: [
          "Een financieel rapport",
          "Een grondrechtentoets die sommige gebruiksverantwoordelijken vooraf moeten uitvoeren",
          "Een softwarelicentie",
          "Een type AI-model",
        ],
        answer: 1,
      },
    ],
  },
  // ---- Beheerder / technische rollen ----
  {
    id: "risk-management",
    title: "Risicomanagement, logging & robuustheid (Art. 9, 12, 15)",
    minutes: 14,
    intro:
      "Voor technische en beheerdersrollen: het opzetten van een risicomanagementsysteem, logging en traceerbaarheid, en het borgen van nauwkeurigheid, robuustheid en cyberbeveiliging van hoog-risico AI.",
    lessons: [
      {
        heading: "Risicomanagementsysteem (Art. 9)",
        paragraphs: [
          "Hoog-risico AI vereist een doorlopend, iteratief risicomanagementproces over de hele levenscyclus: risico's voor gezondheid, veiligheid en grondrechten identificeren en beoordelen, maatregelen nemen en testen.",
          "Het is geen eenmalige exercitie — u herhaalt en actualiseert het gedurende de hele levensduur van het systeem.",
        ],
      },
      {
        heading: "Logging en traceerbaarheid (Art. 12)",
        paragraphs: [
          "Hoog-risico systemen moeten technisch in staat zijn gebeurtenissen automatisch te registreren (logs), zodat de werking traceerbaar blijft gedurende de levenscyclus.",
        ],
      },
      {
        heading: "Nauwkeurigheid, robuustheid en cyberbeveiliging (Art. 15)",
        paragraphs: [
          "Systemen moeten een passend niveau van nauwkeurigheid, robuustheid en cyberbeveiliging halen en consistent presteren.",
          "Denk aan weerbaarheid tegen fouten en tegen manipulatie zoals 'data poisoning' en 'adversarial' aanvallen.",
        ],
      },
    ],
    quiz: [
      {
        question: "Hoe vaak loopt het risicomanagementproces (Art. 9)?",
        options: [
          "Eenmalig bij de start",
          "Doorlopend, gedurende de hele levenscyclus",
          "Alleen bij een audit",
          "Nooit",
        ],
        answer: 1,
      },
      {
        question: "Waarvoor dient logging (Art. 12)?",
        options: [
          "Marketing",
          "Traceerbaarheid van de werking van het systeem",
          "Snellere verwerking",
          "Reclame tonen",
        ],
        answer: 1,
      },
      {
        question: "Wat eist Artikel 15?",
        options: [
          "Alleen een mooie interface",
          "Nauwkeurigheid, robuustheid en cyberbeveiliging",
          "Een lage prijs",
          "Onbeperkte dataverzameling",
        ],
        answer: 1,
      },
      {
        question: "Wat is 'data poisoning'?",
        options: [
          "Het versleutelen van data",
          "Het manipuleren van trainingsdata om een model te misleiden",
          "Een back-upmethode",
          "Een vorm van dataminimalisatie",
        ],
        answer: 1,
      },
      {
        question: "Wat is het doel van risicomanagement?",
        options: [
          "Risico's voor gezondheid, veiligheid en grondrechten beperken",
          "Meer data verzamelen",
          "Kosten verhogen",
          "Toezicht vermijden",
        ],
        answer: 0,
      },
    ],
  },
  {
    id: "technical-docs",
    title: "Technische documentatie & datakwaliteit (Art. 10, 11, Annex IV)",
    minutes: 12,
    intro:
      "Voor beheerders: welke technische documentatie een hoog-risico systeem nodig heeft, hoe u datakwaliteit en -governance borgt, en wat er geldt voor GPAI-modellen.",
    lessons: [
      {
        heading: "Technische documentatie (Art. 11, Annex IV)",
        paragraphs: [
          "Voordat een hoog-risico systeem op de markt komt, moet er technische documentatie volgens Annex IV zijn — met o.a. een systeembeschrijving, ontwerp, monitoring en prestaties — en die houdt u actueel.",
        ],
      },
      {
        heading: "Data governance (Art. 10)",
        paragraphs: [
          "Trainings-, validatie- en testdata moeten aan kwaliteitseisen voldoen: relevant, voldoende representatief en zo foutloos mogelijk.",
          "Onderzoek data actief op mogelijke bias (vertekening) en neem maatregelen om die te beperken.",
        ],
      },
      {
        heading: "GPAI-modellen",
        paragraphs: [
          "Aanbieders van general-purpose AI-modellen (GPAI) hebben eigen verplichtingen: technische documentatie, een samenvatting van de trainingsdata en een auteursrechtbeleid.",
        ],
      },
    ],
    quiz: [
      {
        question: "Wat beschrijft Annex IV?",
        options: [
          "De inhoud van de technische documentatie voor hoog-risico AI",
          "De boetes",
          "De prijslijst",
          "De organisatiestructuur",
        ],
        answer: 0,
      },
      {
        question: "Wanneer moet de technische documentatie klaar zijn?",
        options: [
          "Nooit",
          "Pas na een klacht",
          "Voordat het systeem op de markt komt, en bijgehouden daarna",
          "Alleen bij verkoop",
        ],
        answer: 2,
      },
      {
        question: "Welke eisen stelt Artikel 10 aan data?",
        options: [
          "Zo veel mogelijk data, ongeacht kwaliteit",
          "Relevant, representatief en zo foutloos mogelijk",
          "Alleen openbare data",
          "Geen eisen",
        ],
        answer: 1,
      },
      {
        question: "Waarop moet u data onderzoeken?",
        options: ["Kleur", "Mogelijke bias (vertekening)", "Bestandsgrootte", "Populariteit"],
        answer: 1,
      },
      {
        question: "Wie heeft eigen documentatieplichten voor GPAI?",
        options: [
          "Alleen eindgebruikers",
          "Aanbieders van general-purpose AI-modellen",
          "De boekhouding",
          "Niemand",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: "platform-beheer",
    title: "Werken met ComplAI als beheerder",
    minutes: 10,
    intro:
      "Voor beheerders: hoe ComplAI werkt, wat u als beheerder kunt en waar u verantwoordelijk voor bent — van het uitnodigen van uw team tot het beheren van uw pakket.",
    lessons: [
      {
        heading: "Het platform in het kort",
        paragraphs: [
          "ComplAI helpt uw organisatie grip te krijgen op de EU AI Act. De kernonderdelen: het AI-register (al uw AI-systemen), de documentgenerator (beleid, FRIA, transparantie en meer), e-learning met certificaten, en het governance-overzicht met deadlines en kwartaalchecks.",
          "Alles begint bij de risicoscan: die bepaalt welke verplichtingen en documenten voor uw organisatie gelden. Werk de scan bij als er iets verandert.",
        ],
      },
      {
        heading: "Uw rol als beheerder",
        paragraphs: [
          "Als beheerder bent u de admin van uw organisatie in ComplAI. U nodigt collega's uit via Medewerkers en wijst hun rol toe: Medewerker, Manager of Beheerder. Alleen beheerders kunnen uitnodigen en rollen wijzigen.",
          "De rol bepaalt het leerpad in de e-learning (Medewerker, Manager of Beheerder). Een organisatie kan meerdere beheerders hebben.",
        ],
      },
      {
        heading: "Pakket, documenten en verantwoordelijkheid",
        paragraphs: [
          "Uw pakket bepaalt welke documenten u kunt genereren; u beheert het via Instellingen → Abonnement.",
          "Gegenereerde documenten zijn concept-sjablonen op basis van uw eigen opgaven. U vult ze aan, laat ze toetsen en stelt ze zelf vast — ComplAI biedt beslissingsondersteuning, geen juridisch advies. Als beheerder houdt u het register actueel, wijst u training toe en stelt u documenten vast.",
        ],
      },
    ],
    quiz: [
      {
        question: "Wie kan in ComplAI teamleden uitnodigen en hun rol wijzigen?",
        options: [
          "Iedereen in de organisatie",
          "Alleen een beheerder",
          "Alleen ComplAI",
          "Alleen een manager",
        ],
        answer: 1,
      },
      {
        question: "Wat bepaalt het leerpad van een teamlid in de e-learning?",
        options: [
          "Hun e-mailadres",
          "De rol die de beheerder toewijst (medewerker/manager/beheerder)",
          "De datum van aanmelden",
          "Het toeval",
        ],
        answer: 1,
      },
      {
        question: "Wat bepaalt welke documenten u kunt genereren?",
        options: [
          "Het aantal medewerkers",
          "Uw pakket (abonnement)",
          "De dag van de week",
          "Niets, alles is altijd beschikbaar",
        ],
        answer: 1,
      },
      {
        question: "Wat is de status van een door ComplAI gegenereerd document?",
        options: [
          "Een juridisch bindend eindproduct",
          "Een concept-sjabloon dat u zelf aanvult en vaststelt",
          "Een door de toezichthouder goedgekeurd document",
          "Een openbare publicatie",
        ],
        answer: 1,
      },
      {
        question: "Kan een organisatie meerdere beheerders hebben?",
        options: ["Ja", "Nee, maximaal één", "Alleen met een Audit-pakket", "Alleen met een betaald pakket"],
        answer: 0,
      },
    ],
  },
];

export const MODULES: TrainingModule[] = [
  ...BASE_MODULES.map((m) => ({ ...m, lessons: MODULE_LESSONS[m.id] ?? [] })),
  ...ROLE_MODULES,
];

// Which modules make up each learning path. Everyone does the core five; managers
// and beheerders add role-specific modules on top (Art. 4 proportionality).
const CORE_IDS = BASE_MODULES.map((m) => m.id);
export const PATH_MODULES: Record<PathId, string[]> = {
  employee: CORE_IDS,
  manager: [...CORE_IDS, "human-oversight", "deployer-duties"],
  admin: [...CORE_IDS, "risk-management", "technical-docs", "platform-beheer"],
};

export function getModule(id: string): TrainingModule | undefined {
  return MODULES.find((m) => m.id === id);
}

export function getPath(id: string): LearningPath | undefined {
  return PATHS.find((p) => p.id === id);
}

/** The ordered modules for a learning path (falls back to the core set). */
export function modulesForPath(pathId: string): TrainingModule[] {
  const ids = PATH_MODULES[pathId as PathId] ?? CORE_IDS;
  return ids
    .map((id) => getModule(id))
    .filter((m): m is TrainingModule => Boolean(m));
}

/** How many modules a learning path requires (its completion denominator). */
export function moduleCountForPath(pathId: string): number {
  return (PATH_MODULES[pathId as PathId] ?? CORE_IDS).length;
}
