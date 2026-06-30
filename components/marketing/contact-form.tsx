"use client";

import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { submitContact, type ContactState } from "@/app/(marketing)/contact/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Versturen…" : "Verstuur bericht"}
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useFormState<ContactState, FormData>(
    submitContact,
    undefined
  );

  if (state?.ok) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" />
        <div>
          <p className="font-semibold">Bedankt voor uw bericht!</p>
          <p className="mt-1 text-sm">
            We hebben het ontvangen en reageren doorgaans binnen één werkdag.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Naam</Label>
          <Input id="name" name="name" placeholder="Voor- en achternaam" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mailadres</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="naam@organisatie.nl"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">Organisatie (optioneel)</Label>
          <Input id="company" name="company" placeholder="Bedrijfsnaam" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Onderwerp (optioneel)</Label>
          <Input id="subject" name="subject" placeholder="Waar gaat het over?" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Bericht</Label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="Stel uw vraag of beschrijf uw situatie…"
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {state?.error && (
        <div className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <SubmitButton />
      <p className="text-xs text-muted-foreground">
        Door dit formulier te versturen gaat u akkoord met onze privacyverklaring.
        We gebruiken uw gegevens alleen om uw vraag te beantwoorden.
      </p>
    </form>
  );
}
