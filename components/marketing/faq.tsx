"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Wat houdt de EU AI Act in?",
    a: "Het is de eerste brede Europese wet met regels voor zowel het bouwen als het inzetten van AI. Toepassingen worden ingedeeld op risico — van minimaal tot verboden — en aan elk niveau hangen eigen plichten. Praktisch komt het bijvoorbeeld neer op het in kaart brengen van uw AI-gebruik, het bijspijkeren van AI-kennis bij uw medewerkers en openheid naar iedereen die met de AI te maken krijgt.",
  },
  {
    q: "Raakt de wet mijn organisatie ook?",
    a: "Vrijwel zeker wel. Gebruikt of levert u AI — een tekstassistent, een chatbot, een selectietool of een voorspelmodel — dan valt u onder de wet, hoe groot of klein uw organisatie ook is. De scan toont u in enkele minuten welke plichten juist voor u van toepassing zijn.",
  },
  {
    q: "Tegen wanneer moet ik dit op orde hebben?",
    a: "De invoering gebeurt gefaseerd. De regels voor verboden toepassingen (Art. 5) en AI-geletterdheid (Art. 4) gelden inmiddels. De transparantie-eisen (Art. 50) en de plichten voor hoog-risico systemen volgen daarna. ComplAI houdt de voor u relevante data automatisch bij.",
  },
  {
    q: "Moet ik hiervoor een adviesbureau inschakelen?",
    a: "Voor de meeste mkb-bedrijven is dat niet nodig. ComplAI vertaalt de wet naar concrete stappen, levert de vereiste documenten als sjablonen die u met uw eigen gegevens invult, en biedt e-learning met certificaten — tegen een fractie van de kosten van een adviestraject.",
  },
  {
    q: "Wat gebeurt er met mijn gegevens?",
    a: "Uw scans, documenten en accountgegevens bewaren wij versleuteld en binnen de EU (Supabase, regio eu-west-1). Wij werken uitsluitend met zorgvuldig gekozen subverwerkers onder een verwerkersovereenkomst en geven uw gegevens niet aan derden voor hún eigen doeleinden. De volledige details vindt u in ons privacybeleid en onze verwerkersovereenkomst.",
  },
  {
    q: "Is de risicoscan echt kosteloos?",
    a: "Ja. U doorloopt de volledige scan zonder account en downloadt daarna een PDF-rapport met uw score. Met een gratis account bewaart u die resultaten en volgt u relevante wetswijzigingen in het dashboard. Het AI-register en de documenten zijn beschikbaar vanaf het pakket Basis.",
  },
];

export function Faq() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, i) => (
        <AccordionItem key={i} value={`item-${i}`}>
          <AccordionTrigger>{faq.q}</AccordionTrigger>
          <AccordionContent>{faq.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
