"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";

import { login, signup, type AuthState } from "@/app/(auth)/actions";
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

export function AuthForm({
  mode,
  redirectTo,
  scanId,
  inviteToken,
  inviteEmail,
  plan,
  interval,
}: {
  mode: "login" | "signup";
  redirectTo?: string;
  scanId?: string;
  inviteToken?: string;
  inviteEmail?: string;
  plan?: string;
  interval?: string;
}) {
  const isInvite = Boolean(inviteToken);
  const action = mode === "login" ? login : signup;
  const [state, formAction] = useFormState<AuthState, FormData>(
    action,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      {mode === "signup" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Naam</Label>
            <Input id="name" name="name" placeholder="Voor- en achternaam" required />
          </div>
          {!isInvite && (
            <div className="space-y-2">
              <Label htmlFor="companyName">Organisatie</Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="Bedrijfsnaam"
                required
              />
            </div>
          )}
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">E-mailadres</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="naam@organisatie.nl"
          defaultValue={inviteEmail}
          readOnly={Boolean(inviteEmail)}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Wachtwoord</Label>
          {mode === "login" && (
            <Link
              href="/wachtwoord-vergeten"
              className="text-sm font-medium text-primary hover:underline"
            >
              Wachtwoord vergeten?
            </Link>
          )}
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder={mode === "signup" ? "Minimaal 8 tekens" : "••••••••"}
          required
        />
      </div>

      {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}
      {scanId && <input type="hidden" name="scan" value={scanId} />}
      {inviteToken && <input type="hidden" name="invite" value={inviteToken} />}
      {plan && <input type="hidden" name="plan" value={plan} />}
      {interval && <input type="hidden" name="interval" value={interval} />}

      {state?.error && (
        <div className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <SubmitButton label={mode === "login" ? "Inloggen" : "Account aanmaken"} />
    </form>
  );
}
