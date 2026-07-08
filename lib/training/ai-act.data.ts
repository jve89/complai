// Extracted from the hand-authored risk-model module (same shape as modules.generated.ts).
export const AI_ACT_MODULE = {
  "id": "ai-act-15",
  "title": "De EU AI Act & het risicomodel",
  "role": "core",
  "drawCount": 6,
  "intro": "De eerste brede AI-wet ter wereld. U leert het risicogebaseerde model — van minimaal risico tot verboden toepassingen — plus de deadlines en de boetes. De quiz test of u het kunt toepassen, niet alleen of u de termen kent.",
  "minutes": 15,
  "lessons": [
    {
      "heading": "Waarom deze wet er is",
      "paragraphs": [
        "Kunstmatige intelligentie neemt steeds vaker deel aan beslissingen die mensen direct raken: wie er wordt uitgenodigd voor een sollicitatiegesprek, wie een lening of verzekering krijgt, welke behandeling een patiënt krijgt voorgesteld, of iemand als mogelijk fraudegeval wordt aangemerkt. Wanneer zulke beslissingen oneerlijk, ondoorzichtig of onjuist zijn, kan de schade groot zijn én moeilijk terug te draaien. Daarom heeft de EU de AI Act (Verordening (EU) 2024/1689) aangenomen: de eerste brede, sectoroverstijgende AI-wet ter wereld.",
        "Het doel is nadrukkelijk tweeledig. Enerzijds vertrouwen: AI die in de EU wordt gebruikt moet veilig, transparant, traceerbaar en niet-discriminerend zijn en de grondrechten respecteren. Anderzijds ruimte voor innovatie: door één set regels voor de hele interne markt te maken — in plaats van 27 verschillende nationale regels — weten bedrijven waar ze aan toe zijn en kunnen ze in heel Europa opschalen.",
        "Belangrijk om te begrijpen: de wet reguleert niet 'AI' als technologie op zichzelf, maar het gebruik ervan en het risico dat dat gebruik met zich meebrengt. Precies dezelfde technologie kan in de ene context volstrekt onschuldig zijn en in de andere streng gereguleerd. Een taalmodel dat een vakantiemail opstelt is iets heel anders dan hetzelfde model dat bepaalt of iemand wordt aangenomen.",
        "De wet is sinds 2 februari 2025 van kracht en wordt stap voor stap ingevoerd tot 2028. Twee onderdelen gelden al: de verboden praktijken en de plicht om te zorgen voor voldoende AI-geletterdheid bij uw medewerkers. Die laatste plicht is de reden dat u nu deze training doet."
      ]
    },
    {
      "heading": "Wat is 'AI' volgens de wet?",
      "paragraphs": [
        "Niet elk stukje software is 'AI'. De AI Act (Art. 3, lid 1) omschrijft een AI-systeem als een machinaal systeem dat is ontworpen om met een zekere mate van autonomie te werken, dat zich na de uitrol kan aanpassen, en dat uit de ontvangen input afleidt hoe het output genereert — zoals voorspellingen, aanbevelingen of beslissingen — die de fysieke of digitale omgeving kan beïnvloeden.",
        "De kern zit in het woord 'afleiden' (inference). Een AI-systeem leidt patronen of uitkomsten af uit data, in plaats van simpelweg een vast, door mensen geschreven regelscript uit te voeren. Een klassieke rekenformule in een spreadsheet of een eenvoudige 'als-dit-dan-dat'-macro valt daar meestal buiten. Een model dat uit duizenden voorbeelden heeft geléérd om spam te herkennen of tekst te genereren, valt er meestal wél onder.",
        "Voorbeelden die eronder vallen: tekst- en beeldgeneratoren (zoals ChatGPT of beeld-AI), aanbevelingssystemen, spraak- en beeldherkenning, fraudedetectie, cv-selectie en chatbots. Let op een valkuil: veel gangbare kantoorsoftware heeft inmiddels AI-functies ingebouwd — denk aan Microsoft 365 Copilot, Google Workspace, en AI-assistenten in CRM- en boekhoudpakketten. Ook die functies tellen mee, ook al heeft u ze niet als 'AI' aangeschaft.",
        "Twijfelt u of iets een AI-systeem is? Behandel het dan als AI en leg het vast in uw AI-register. Het register is het fundament onder alles wat volgt: u kunt pas beoordelen welke verplichtingen gelden als u eerst in kaart heeft welke AI uw organisatie eigenlijk gebruikt — inclusief de tools die medewerkers zelf hebben aangezet ('schaduw-AI')."
      ]
    },
    {
      "heading": "Het risicomodel: vier niveaus",
      "paragraphs": [
        "De hele wet draait om één idee: hoe groter het risico voor mensen, hoe zwaarder de eisen. De AI Act ordent AI in vier niveaus, te zien als een piramide met bovenin weinig, zwaar gereguleerde toepassingen en onderin de grote massa alledaagse AI.",
        "Onaanvaardbaar risico — verboden (Art. 5). Een klein aantal toepassingen is simpelweg verboden omdat ze niet te verenigen zijn met de grondrechten. Voorbeelden: social scoring van burgers, manipulatie die ernstige schade veroorzaakt, en emotieherkenning op de werkvloer of in het onderwijs. Hier bestaat geen 'ja, mits' — het mag gewoon niet, en dit verbod geldt al sinds februari 2025.",
        "Hoog risico (Annex III en Annex I). AI die belangrijke beslissingen over mensen neemt of daarbij ondersteunt — werving en selectie, krediet, verzekering, onderwijs, of toegang tot essentiële publieke en private diensten — is toegestaan, maar onder strenge voorwaarden: een risicomanagementsysteem, eisen aan datakwaliteit, menselijk toezicht, logging, technische documentatie en soms een grondrechtentoets (FRIA). Dit is de categorie waar de meeste compliance-inspanning gaat zitten, en waar de meeste mkb-organisaties met minstens één systeem in terechtkomen.",
        "Beperkt risico — transparantie (Art. 50). Voor toepassingen als chatbots en AI-gegenereerde content geldt vooral een informatieplicht: mensen moeten weten dat ze met een AI-systeem te maken hebben, of dat wat ze zien door AI is gemaakt (denk aan 'deepfakes' en gegenereerde afbeeldingen).",
        "Minimaal risico. Verreweg de meeste alledaagse AI — spamfilters, vertaaltools, tekstassistentie, autocorrectie — valt in deze categorie. Hiervoor stelt de AI Act geen bijzondere verplichtingen. Wél blijft verantwoord gebruik gelden, en blijft de privacywetgeving (AVG) onverkort van toepassing zodra er persoonsgegevens in het spel zijn."
      ]
    },
    {
      "heading": "Verboden praktijken uitgelicht (Art. 5)",
      "paragraphs": [
        "Omdat de verbodsbepalingen absoluut zijn én al gelden, is het belangrijk om ze te kunnen herkennen — ook al zult u ze in een normaal mkb zelden zelf inzetten. De wet verbiedt onder meer de volgende categorieën.",
        "Manipulatie en uitbuiting: AI die met onderbewuste of bewust misleidende technieken het gedrag van mensen wezenlijk verstoort en zo ernstige schade veroorzaakt, en AI die kwetsbaarheden van mensen uitbuit vanwege hun leeftijd, een beperking of een specifieke sociale of economische situatie.",
        "Social scoring: het over langere tijd beoordelen of classificeren van mensen op basis van hun sociale gedrag of afgeleide persoonskenmerken, waarbij dat 'cijfer' leidt tot nadelige behandeling in een niet-gerelateerde context of buiten verhouding tot het gedrag.",
        "Biometrie en profilering: het ongericht schrapen van gezichtsbeelden van internet of camerabeelden om herkenningsdatabases mee op te bouwen; emotieherkenning op het werk of in het onderwijs (behalve om medische of veiligheidsredenen); en biometrische categorisering die bedoeld is om gevoelige kenmerken zoals ras, politieke opvatting, geloof of seksuele geaardheid af te leiden.",
        "De praktische les: ken deze lijst, zodat u meteen een rode vlag herkent als een leverancier of tool zoiets aanbiedt — bijvoorbeeld software die belooft de 'betrokkenheid' of 'stemming' van medewerkers te meten via camera's. Herkent u zo'n toepassing? Gebruik die niet en meld het bij de AI-verantwoordelijke in uw organisatie."
      ]
    },
    {
      "heading": "Uw rol: aanbieder of gebruiksverantwoordelijke?",
      "paragraphs": [
        "De AI Act legt verplichtingen op afhankelijk van uw rol bij een systeem. Twee rollen doen er voor de meeste organisaties toe, en het verschil bepaalt wat u moet doen.",
        "Aanbieder ('provider'): u ontwikkelt een AI-systeem of brengt het onder uw eigen naam of merk op de markt. Aanbieders dragen de zwaarste last — zij moeten een hoog-risicosysteem volledig laten voldoen aan alle eisen vóórdat het op de markt komt, inclusief conformiteitsbeoordeling en technische documentatie.",
        "Gebruiksverantwoordelijke ('deployer'): u gebruikt een AI-systeem van een ander onder eigen gezag binnen uw organisatie. De meeste mkb'ers zitten in deze rol. Uw plichten zijn lichter, maar reëel: gebruik het systeem volgens de instructies van de aanbieder, zorg voor bekwaam menselijk toezicht, bewaar de automatisch gegenereerde logs, en informeer betrokkenen — en voer voor sommige hoog-risicotoepassingen vooraf een grondrechtentoets (FRIA) uit.",
        "Let op een belangrijke valkuil: u kunt ongemerkt 'aanbieder' worden. Zet u uw eigen naam of merk op een systeem, past u een bestaand hoog-risicosysteem wezenlijk aan, of gebruikt u het voor een duidelijk ander doel dan waarvoor het is bedoeld? Dan kunt u de zwaardere aanbiedersverplichtingen krijgen. Weten in welke rol u zit — per systeem — is dus de sleutel tot weten wat u moet regelen."
      ]
    },
    {
      "heading": "Wanneer geldt wat? (Art. 113)",
      "paragraphs": [
        "De wet wordt gefaseerd ingevoerd, zodat organisaties tijd hebben om zich voor te bereiden. Het is een misverstand dat 'het allemaal nog niet geldt' — een deel is al van kracht. De hoofdlijn van de tijdlijn:",
        "2 februari 2025: de verboden praktijken (Art. 5) en de plicht tot AI-geletterdheid (Art. 4) gelden. Dit is nu dus al van kracht.",
        "2 augustus 2025: de regels voor general-purpose AI-modellen (GPAI) en het bestuurlijke kader — toezichthouders en het boeteregime — treden in werking.",
        "2 december 2026: de transparantieplichten van Art. 50 voor systemen die al op de markt zijn (nieuwe systemen voldoen direct bij introductie), plus twee nieuwe verboden praktijken — het genereren van niet-consensueel intiem beeldmateriaal en van materiaal van seksueel kindermisbruik. Deze data komen uit de Digital Omnibus, de wijzigingswet die de EU in juni 2026 heeft aangenomen.",
        "2 december 2027: de hoog-risico-eisen voor de Annex III-toepassingen (werving, krediet, onderwijs en meer). Met de Digital Omnibus is deze datum verschoven van de oorspronkelijke 2 augustus 2026 — voor de meeste organisaties is dit nu de belangrijkste deadline. En 2 augustus 2028: de laatste fase, voor hoog-risicosystemen die in gereguleerde producten zitten (Annex I, verschoven van 2 augustus 2027). De boodschap blijft: voorbereiding — een register opbouwen, documentatie maken, mensen trainen — kost tijd, dus vroeg beginnen loont."
      ]
    },
    {
      "heading": "Bereik en boetes",
      "paragraphs": [
        "De AI Act heeft een ruim, extraterritoriaal bereik (Art. 2). De wet geldt niet alleen voor bedrijven in de EU, maar ook voor aanbieders en gebruiksverantwoordelijken búiten de EU wanneer de output van het systeem in de EU wordt gebruikt. 'Buiten de EU' betekent dus niet 'buiten de wet': een Amerikaanse of Aziatische tool die u in Nederland inzet, valt gewoon onder de wet.",
        "Niet-naleving kan fors kosten. Voor de verboden praktijken (Art. 5) gelden boetes tot € 35 miljoen of 7% van de wereldwijde jaaromzet — het hoogste van de twee. Voor de meeste andere overtredingen tot € 15 miljoen of 3%, en voor het verstrekken van onjuiste of misleidende informatie aan toezichthouders tot € 7,5 miljoen of 1%.",
        "Voor het mkb en start-ups voorziet de wet in verhoudingsgewijs lagere maxima, zodat een boete proportioneel blijft. Maar de kern verandert niet: naleving is geen vrijblijvende papieroefening. Naast de boete zelf spelen reputatieschade en aansprakelijkheid een rol als een AI-systeem iemand benadeelt.",
        "De praktische vertaling: breng in kaart welke AI u gebruikt, bepaal per systeem in welke risicocategorie het valt en welke rol u heeft, en regel de bijbehorende verplichtingen. Dat is precies waar de rest van deze training en de tools van ComplAI — de risicoscan, het register en de documentgenerator — u stap voor stap bij helpen."
      ]
    },
    {
      "heading": "Wat betekent dit concreet voor u?",
      "paragraphs": [
        "U hoeft geen jurist te worden. Voor de meeste medewerkers komt het neer op vijf gewoonten: begrijp de vier risiconiveaus, herken wanneer een toepassing hoog risico of verboden is, wees transparant over AI-gebruik, houd altijd menselijk toezicht bij beslissingen over mensen, en meld het als u twijfelt.",
        "Voor uw organisatie als geheel is de volgorde logisch: (1) breng alle AI in beeld in het register, inclusief ingebouwde en zelf-aangezette tools; (2) bepaal per systeem de risicocategorie en uw rol; (3) regel de bijbehorende verplichtingen — documentatie, menselijk toezicht, transparantie, en waar nodig een FRIA; en (4) houd het actueel, want AI verandert snel en uw register en beoordeling moeten meebewegen.",
        "In de volgende modules maken we elk onderdeel concreet: de verboden praktijken, het herkennen van hoog risico, de transparantieplichten, verantwoord dagelijks gebruik en de samenhang met privacy. Deze module gaf u het raamwerk waarmee de rest op zijn plek valt — beschouw het als de kaart voordat we de route in detail bekijken."
      ]
    }
  ],
  "quiz": [
    {
      "question": "Wat is de kernlogica van de AI Act?",
      "options": [
        "Risicogebaseerd: hoe hoger het risico, hoe meer verplichtingen",
        "Leeftijdsgebaseerd",
        "Gebaseerd op de prijs van het systeem",
        "Een vrijwillig keurmerk zonder verplichtingen"
      ],
      "correct": [
        "Risicogebaseerd: hoe hoger het risico, hoe meer verplichtingen"
      ],
      "explanation": "De wet kent vier risicoklassen: onaanvaardbaar (verboden — Art. 5), hoog (strenge eisen), beperkt (transparantie — Art. 50) en minimaal. Hoe hoger het risico, hoe zwaarder de plichten."
    },
    {
      "question": "In welke risicocategorie valt dit hoogstwaarschijnlijk?",
      "options": [
        "Minimaal risico",
        "Hoog risico",
        "Verboden",
        "Buiten de AI Act"
      ],
      "correct": [
        "Hoog risico"
      ],
      "explanation": "Werving en selectie staat in Annex III (punt 4): AI die beslist of ondersteunt bij aanname of beoordeling van mensen is hoog risico. Dan gelden extra eisen zoals menselijk toezicht (Art. 14) en logging (Art. 12).",
      "scenario": "Een HR-afdeling wil sollicitanten automatisch laten scoren en rangschikken door een AI-tool."
    },
    {
      "question": "Welke van deze toepassingen is VERBODEN onder Artikel 5?",
      "options": [
        "Een klantenservice-chatbot",
        "Emotieherkenning van werknemers op de werkvloer",
        "Een spamfilter",
        "Automatische vertaling"
      ],
      "correct": [
        "Emotieherkenning van werknemers op de werkvloer"
      ],
      "explanation": "Art. 5(1)(f) verbiedt het afleiden van emoties van mensen op het werk of in het onderwijs (behalve om medische of veiligheidsredenen). De andere voorbeelden zijn laag risico."
    },
    {
      "question": "Welke praktijken zijn verboden (Art. 5)? Selecteer alle juiste.",
      "options": [
        "Social scoring van burgers op basis van hun gedrag",
        "Ongericht gezichtsbeelden van internet schrapen voor een database",
        "Een aanbevelingssysteem voor films",
        "Manipulatieve technieken die iemand ernstige schade toebrengen"
      ],
      "correct": [
        "Social scoring van burgers op basis van hun gedrag",
        "Ongericht gezichtsbeelden van internet schrapen voor een database",
        "Manipulatieve technieken die iemand ernstige schade toebrengen"
      ],
      "explanation": "Art. 5 verbiedt o.a. social scoring (c), ongericht scrapen van gezichtsbeelden (e) en schadelijke manipulatie (a). Een filmaanbeveler is minimaal risico."
    },
    {
      "question": "Wat eist Artikel 50?",
      "options": [
        "Niets, chatbots vallen buiten de wet",
        "U moet mensen laten weten dat ze met een AI-systeem praten",
        "U heeft een vergunning nodig",
        "U moet de gesprekken publiceren"
      ],
      "correct": [
        "U moet mensen laten weten dat ze met een AI-systeem praten"
      ],
      "explanation": "Art. 50 (transparantie) verplicht u gebruikers te informeren dat zij met AI communiceren, tenzij dat overduidelijk is. Ook AI-gegenereerde content moet herkenbaar zijn.",
      "scenario": "Uw website heeft een chatbot die klantvragen beantwoordt."
    },
    {
      "question": "Wanneer gaan de hoog-risicoverplichtingen voor Annex III-systemen gelden (Art. 113, na de Digital Omnibus)?",
      "options": [
        "2 februari 2025",
        "2 augustus 2026",
        "2 december 2027",
        "Ze gelden nog niet"
      ],
      "correct": [
        "2 december 2027"
      ],
      "explanation": "Met de Digital Omnibus (in juni 2026 aangenomen) is de Annex III hoog-risicodatum verschoven van de oorspronkelijke 2 augustus 2026 naar 2 december 2027. Verboden praktijken (Art. 5) en AI-geletterdheid (Art. 4) gelden al sinds 2 februari 2025; product-gebonden hoog-risico (Annex I) volgt op 2 augustus 2028."
    },
    {
      "question": "Wat is de maximale boete voor een verboden AI-praktijk (Art. 99)?",
      "options": [
        "Een waarschuwing",
        "€ 10.000",
        "Tot € 35 miljoen of 7% van de wereldwijde jaaromzet",
        "Tot € 1 miljoen"
      ],
      "correct": [
        "Tot € 35 miljoen of 7% van de wereldwijde jaaromzet"
      ],
      "explanation": "Art. 99: overtreding van de verbodsbepalingen kan leiden tot een boete tot € 35 miljoen of 7% van de wereldwijde jaaromzet — het hoogste van de twee. Voor andere overtredingen geldt tot € 15 miljoen of 3%."
    },
    {
      "question": "Welke categorie past hier het best?",
      "options": [
        "Verboden",
        "Hoog risico",
        "Beperkt/minimaal risico — let wel op transparantie en vertrouwelijkheid",
        "Buiten de AI Act"
      ],
      "correct": [
        "Beperkt/minimaal risico — let wel op transparantie en vertrouwelijkheid"
      ],
      "explanation": "Algemeen productiviteitsgebruik van generatieve AI is doorgaans laag risico. Let wel op Art. 50 (herkenbaarheid van AI-content) en plak geen vertrouwelijke of persoonsgegevens in externe tools. Pas bij een Annex III-doel wordt het hoog risico.",
      "scenario": "Uw team gebruikt ChatGPT om conceptmails en samenvattingen te schrijven."
    },
    {
      "question": "Een niet-EU-leverancier levert AI waarvan de uitkomsten in de EU worden gebruikt. Geldt de AI Act?",
      "options": [
        "Nee, alleen EU-bedrijven vallen eronder",
        "Ja, ook buiten de EU als de output in de EU wordt gebruikt",
        "Alleen voor overheden",
        "Alleen als het bedrijf een EU-kantoor heeft"
      ],
      "correct": [
        "Ja, ook buiten de EU als de output in de EU wordt gebruikt"
      ],
      "explanation": "Art. 2 geeft de wet een extraterritoriaal bereik: ook aanbieders en gebruiksverantwoordelijken buiten de EU vallen eronder wanneer de output binnen de EU wordt gebruikt."
    }
  ]
};
