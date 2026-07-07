"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { updateOwnName, updateOwnPassword } from "@/app/dashboard/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Notice = { ok: boolean; text: string } | null;

/** Self-service account settings — available to every user regardless of role. */
export function AccountForm({
  email,
  name,
  roleLabel,
}: {
  email: string;
  name: string;
  roleLabel: string;
}) {
  const router = useRouter();

  const [nameValue, setNameValue] = useState(name);
  const [namePending, startName] = useTransition();
  const [nameNotice, setNameNotice] = useState<Notice>(null);

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwPending, startPw] = useTransition();
  const [pwNotice, setPwNotice] = useState<Notice>(null);

  function onSaveName(e: React.FormEvent) {
    e.preventDefault();
    setNameNotice(null);
    startName(async () => {
      const res = await updateOwnName(nameValue);
      if (res.ok) {
        setNameNotice({ ok: true, text: res.message ?? "Opgeslagen." });
        router.refresh();
      } else {
        setNameNotice({ ok: false, text: res.error });
      }
    });
  }

  function onSavePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwNotice(null);
    if (pw !== pw2) {
      setPwNotice({ ok: false, text: "De wachtwoorden komen niet overeen." });
      return;
    }
    startPw(async () => {
      const res = await updateOwnPassword(pw);
      if (res.ok) {
        setPwNotice({ ok: true, text: res.message ?? "Bijgewerkt." });
        setPw("");
        setPw2("");
      } else {
        setPwNotice({ ok: false, text: res.error });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Read-only identity */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="account-email">E-mailadres</Label>
          <Input id="account-email" value={email} disabled />
        </div>
        <div className="space-y-1.5">
          <Label>Rol</Label>
          <Input value={roleLabel} disabled />
        </div>
      </div>

      {/* Name */}
      <form onSubmit={onSaveName} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="account-name">Naam</Label>
          <Input
            id="account-name"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            required
          />
        </div>
        {nameNotice && (
          <p className={nameNotice.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>
            {nameNotice.text}
          </p>
        )}
        <Button type="submit" disabled={namePending}>
          {namePending && <Loader2 className="h-4 w-4 animate-spin" />}
          Naam opslaan
        </Button>
      </form>

      {/* Password */}
      <div className="border-t pt-6">
        <form onSubmit={onSavePassword} className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="account-pw">Nieuw wachtwoord</Label>
              <Input
                id="account-pw"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Minstens 8 tekens"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="account-pw2">Herhaal wachtwoord</Label>
              <Input
                id="account-pw2"
                type="password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>
          {pwNotice && (
            <p className={pwNotice.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>
              {pwNotice.text}
            </p>
          )}
          <Button type="submit" variant="outline" disabled={pwPending || !pw}>
            {pwPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Wachtwoord wijzigen
          </Button>
        </form>
      </div>
    </div>
  );
}
