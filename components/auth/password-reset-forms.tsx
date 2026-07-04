"use client";

import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import {
  requestPasswordReset,
  updatePassword,
  type AuthState,
  type ResetState,
} from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? "Even geduld…" : label}
    </Button>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/** Step 1 — request a recovery email. */
export function RequestResetForm() {
  const [state, formAction] = useFormState<ResetState, FormData>(
    requestPasswordReset,
    undefined
  );

  if (state?.sent) {
    return (
      <div className="flex items-start gap-2 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Als er een account bij dit e-mailadres hoort, sturen we een herstel-link.
          Controleer uw inbox (en spam).
        </span>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mailadres</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="naam@organisatie.nl"
          required
        />
      </div>
      {state?.error && <ErrorNote message={state.error} />}
      <SubmitButton label="Stuur herstel-link" />
    </form>
  );
}

/** Step 2 — set a new password (recovery session established by /auth/confirm). */
export function UpdatePasswordForm() {
  const [state, formAction] = useFormState<AuthState, FormData>(
    updatePassword,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Nieuw wachtwoord</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Minimaal 8 tekens"
          required
        />
      </div>
      {state?.error && <ErrorNote message={state.error} />}
      <SubmitButton label="Wachtwoord opslaan" />
    </form>
  );
}
