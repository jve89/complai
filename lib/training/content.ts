// E-learning content: role-based paths sharing five AI Act modules, each with a
// short quiz. Static content — answers are checked server-side on completion.

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number; // index of the correct option
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
  quiz: QuizQuestion[];
}

export interface LearningPath {
  id: "employee" | "manager" | "admin";
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
    title: "De EU AI Act in 15 minuten",
    minutes: 15,
    intro:
      "De EU AI Act is de eerste brede wet over AI. U leert het risicogebaseerde model kennen: van minimaal risico tot verboden toepassingen, en welke verplichtingen daarbij horen.",
    quiz: [
      {
        question: "Welk model hanteert de EU AI Act?",
        options: [
          "Een risicogebaseerd model",
          "Een leeftijdsgebaseerd model",
          "Een prijsmodel",
          "Een vrijwillig keurmerk",
        ],
        answer: 0,
      },
      {
        question: "Welke risicocategorie is verboden?",
        options: [
          "Minimaal risico",
          "Beperkt risico",
          "Hoog risico",
          "Onaanvaardbaar risico",
        ],
        answer: 3,
      },
      {
        question: "Wat regelt Artikel 4 van de AI Act?",
        options: [
          "AI-geletterdheid van medewerkers",
          "Belastingtarieven",
          "Productgaranties",
          "Auteursrecht",
        ],
        answer: 0,
      },
      {
        question: "Wat is een voorbeeld van een hoog-risico toepassing (Annex III)?",
        options: [
          "Een spamfilter",
          "AI voor werving en selectie van personeel",
          "Een spellingcontrole",
          "Een weer-app",
        ],
        answer: 1,
      },
      {
        question: "Wat eist Artikel 50 bij interactie met AI?",
        options: [
          "Een vergunning",
          "Transparantie: mensen informeren dat ze met AI te maken hebben",
          "Een betaling",
          "Niets",
        ],
        answer: 1,
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
      heading: "Waarom een AI-wet?",
      paragraphs: [
        "De EU AI Act (Verordening (EU) 2024/1689) is de eerste brede AI-wet ter wereld. Het doel: AI die veilig en transparant is en de grondrechten respecteert.",
        "De wet is sinds 2 februari 2025 van kracht en wordt gefaseerd ingevoerd.",
      ],
    },
    {
      heading: "Een risicogebaseerde aanpak",
      paragraphs: [
        "De wet deelt AI in naar risico: onaanvaardbaar (verboden — Art. 5), hoog risico (strenge eisen — Annex III), beperkt risico (transparantie — Art. 50) en minimaal risico.",
        "Hoe hoger het risico, hoe meer verplichtingen. De meeste alledaagse AI valt in de laagste categorieën.",
      ],
    },
    {
      heading: "Rollen en deadlines",
      paragraphs: [
        "U bent 'aanbieder' als u AI ontwikkelt of onder eigen naam op de markt brengt, en 'gebruiksverantwoordelijke' als u AI van anderen gebruikt.",
        "Belangrijke data: verboden praktijken en AI-geletterdheid gelden sinds februari 2025; de meeste hoog-risico- en transparantieplichten vanaf augustus 2026.",
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

export const MODULES: TrainingModule[] = BASE_MODULES.map((m) => ({
  ...m,
  lessons: MODULE_LESSONS[m.id] ?? [],
}));

export function getModule(id: string): TrainingModule | undefined {
  return MODULES.find((m) => m.id === id);
}

export function getPath(id: string): LearningPath | undefined {
  return PATHS.find((p) => p.id === id);
}
