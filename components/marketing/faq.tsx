"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Wat is de EU AI Act precies?",
    a: "De EU AI Act is de eerste brede Europese wet die regels stelt aan het ontwikkelen en gebruiken van AI. De wet werkt met risicocategorieën: van minimaal risico tot verboden toepassingen. Organisaties moeten onder meer hun AI-gebruik in kaart brengen, zorgen voor AI-geletterdheid en transparant zijn richting gebruikers.",
  },
  {
    q: "Geldt de AI Act ook voor mijn organisatie?",
    a: "Vrijwel zeker. Zodra u AI-systemen gebruikt of aanbiedt — denk aan ChatGPT, een chatbot, een wervingstool of een voorspelmodel — valt u onder de wet, ongeacht uw omvang. ComplAI bepaalt op basis van een korte scan welke verplichtingen voor u gelden.",
  },
  {
    q: "Wanneer moet ik compliant zijn?",
    a: "De verplichtingen worden gefaseerd ingevoerd. Verboden praktijken (Art. 5) en AI-geletterdheid (Art. 4) gelden al. Transparantieverplichtingen (Art. 50) en de regels voor hoog-risico systemen volgen daarna. ComplAI houdt de relevante deadlines voor u bij.",
  },
  {
    q: "Heb ik een consultant nodig?",
    a: "Voor de meeste mkb-organisaties niet. ComplAI vertaalt de wet naar concrete acties, genereert de benodigde documenten en biedt e-learning met certificaten — tegen een fractie van de kosten van een adviestraject.",
  },
  {
    q: "Hoe veilig zijn mijn gegevens?",
    a: "Uw gegevens worden binnen de EU verwerkt en versleuteld opgeslagen. We sluiten een verwerkersovereenkomst en delen niets met derden zonder uw toestemming.",
  },
  {
    q: "Is de risicoscan echt gratis?",
    a: "Ja. U kunt zonder account de volledige scan doen en een PDF-rapport met uw compliance-score downloaden. Een gratis account bewaart uw resultaten en geeft toegang tot een basis AI-register.",
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
