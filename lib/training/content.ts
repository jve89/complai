// E-learning content: role-based paths sharing five AI Act modules, each with a
// short quiz. Static content — answers are checked server-side on completion.

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number; // index of the correct option
}

export interface TrainingModule {
  id: string;
  title: string;
  minutes: number;
  intro: string;
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

export const MODULES: TrainingModule[] = [
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

export function getModule(id: string): TrainingModule | undefined {
  return MODULES.find((m) => m.id === id);
}

export function getPath(id: string): LearningPath | undefined {
  return PATHS.find((p) => p.id === id);
}
