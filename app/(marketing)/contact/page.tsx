import type { Metadata } from "next";
import { Clock, Mail, MessageSquare, ShieldCheck } from "lucide-react";

import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Vragen over de EU AI Act of over ComplAI? Neem contact op — we reageren doorgaans binnen één werkdag.",
};

const points = [
  {
    icon: MessageSquare,
    title: "Inhoudelijke vraag?",
    text: "Twijfelt u over uw risicocategorie of een verplichting? Stel uw vraag, dan denken we mee.",
  },
  {
    icon: Clock,
    title: "Snel antwoord",
    text: "We reageren doorgaans binnen één werkdag op uw bericht.",
  },
  {
    icon: ShieldCheck,
    title: "Geen verkooppraatje",
    text: "Begin gerust met de gratis scan. We helpen u verder, ook zonder abonnement.",
  },
];

export default function ContactPage() {
  return (
    <div className="container max-w-5xl py-16 sm:py-20">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Neem contact op</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Vragen over de AI Act, over uw scanresultaat of over een plan? Laat het
          ons weten — we helpen u graag op weg.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border bg-card p-6 sm:p-8">
          <ContactForm />
        </div>

        <div className="space-y-6">
          <a
            href="mailto:hallo@complai.nl"
            className="flex items-center gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-brand-500/50"
          >
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Liever direct mailen?</p>
              <p className="font-medium">hallo@complai.nl</p>
            </div>
          </a>

          {points.map((p) => (
            <div key={p.title} className="flex items-start gap-3">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-navy-900">
                <p.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{p.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
