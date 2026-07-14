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
    a: "Het is de eerste omvattende Europese wet die eisen stelt aan het bouwen en inzetten van AI. De wet deelt toepassingen in naar risico — van minimaal tot verboden — en koppelt daar verplichtingen aan. Denk aan het in kaart brengen van uw AI-gebruik, het op peil brengen van AI-kennis bij medewerkers en openheid richting de mensen die ermee te maken krijgen.",
  },
  {
    q: "Raakt de wet mijn organisatie ook?",
    a: "Hoogstwaarschijnlijk wel. Gebruikt of levert u AI — een tekstassistent, een chatbot, een selectietool of een voorspelmodel — dan valt u eronder, hoe groot of klein u ook bent. Onze scan laat in een paar minuten zien welke verplichtingen specifiek voor u spelen.",
  },
  {
    q: "Tegen wanneer moet ik dit op orde hebben?",
    a: "De invoering verloopt in fasen. De regels rond verboden toepassingen (Art. 5) en AI-geletterdheid (Art. 4) zijn al van kracht. De transparantie-eisen (Art. 50) en de verplichtingen voor hoog-risico systemen volgen later. ComplAI bewaakt de voor u relevante data automatisch.",
  },
  {
    q: "Moet ik hiervoor een adviesbureau inschakelen?",
    a: "In de meeste mkb-situaties niet. ComplAI zet de wet om in concrete stappen, levert de benodigde documenten als sjablonen die u met uw eigen gegevens invult en biedt e-learning met certificaten — voor een fractie van wat een adviestraject kost.",
  },
  {
    q: "Wat gebeurt er met mijn gegevens?",
    a: "Uw data wordt binnen de EU verwerkt en versleuteld bewaard. We tekenen een verwerkersovereenkomst en geven niets door aan derden zonder uw akkoord.",
  },
  {
    q: "Is de risicoscan echt kosteloos?",
    a: "Ja. U doorloopt de volledige scan zonder account en downloadt een PDF-rapport met uw score. Met een gratis account bewaart u uw resultaten en volgt u relevante wetswijzigingen in het dashboard. Het AI-register en de documenten zitten vanaf het pakket Basis.",
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
