"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Building2, Loader2 } from "lucide-react";
import type { Company } from "@prisma/client";

import { updateCompanyProfile } from "@/app/dashboard/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SIZES = ["1-10", "11-50", "51-250", "250+"];

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfileForm({ company }: { company: Company }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const [form, setForm] = useState({
    name: company.name,
    size: company.size ?? "",
    sector: company.sector ?? "",
    country: company.country,
    logoUrl: company.logoUrl ?? "",
    kvk: company.kvk ?? "",
    address: company.address ?? "",
    legalRepName: company.legalRepName ?? "",
    legalRepRole: company.legalRepRole ?? "",
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    startTransition(async () => {
      const res = await updateCompanyProfile(form);
      if (res.ok) {
        setNotice({ ok: true, text: res.message ?? "Opgeslagen." });
        router.refresh();
      } else {
        setNotice({ ok: false, text: res.error });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-navy-900 text-xl font-bold text-brand-400">
          {form.logoUrl ? (
            <Image
              src={form.logoUrl}
              alt="Logo"
              width={64}
              height={64}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : form.name ? (
            initials(form.name)
          ) : (
            <Building2 className="h-7 w-7" />
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="logoUrl">Logo (URL)</Label>
          <Input
            id="logoUrl"
            value={form.logoUrl}
            onChange={(e) => set("logoUrl", e.target.value)}
            placeholder="https://… (of laat leeg voor initialen)"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Bedrijfsnaam</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sector">Sector</Label>
          <Input
            id="sector"
            value={form.sector}
            onChange={(e) => set("sector", e.target.value)}
            placeholder="bijv. Zakelijke dienstverlening"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Bedrijfsgrootte</Label>
          <Select value={form.size} onValueChange={(v) => set("size", v)}>
            <SelectTrigger aria-label="Bedrijfsgrootte">
              <SelectValue placeholder="Selecteer…" />
            </SelectTrigger>
            <SelectContent>
              {SIZES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s} medewerkers
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">Land</Label>
          <Input
            id="country"
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Optional legal-identity details for documents. Never required. */}
      <div className="space-y-4 rounded-lg border bg-secondary/20 p-4">
        <div>
          <p className="text-sm font-medium">Juridische gegevens voor documenten</p>
          <p className="text-xs text-muted-foreground">
            Optioneel. Vult u dit in, dan komen deze gegevens automatisch in uw
            documenten (zoals de conformiteitsverklaring). Laat u het leeg, dan
            blijft er simpelweg een invulveld staan — u kunt altijd later aanvullen.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="kvk">KvK-nummer</Label>
            <Input
              id="kvk"
              value={form.kvk}
              onChange={(e) => set("kvk", e.target.value)}
              placeholder="bijv. 12345678"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Adres</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Straat 1, 1234 AB Plaats"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="legalRepName">Tekenbevoegde — naam</Label>
            <Input
              id="legalRepName"
              value={form.legalRepName}
              onChange={(e) => set("legalRepName", e.target.value)}
              placeholder="bijv. J. de Vries"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="legalRepRole">Tekenbevoegde — functie</Label>
            <Input
              id="legalRepRole"
              value={form.legalRepRole}
              onChange={(e) => set("legalRepRole", e.target.value)}
              placeholder="bijv. Directeur"
            />
          </div>
        </div>
      </div>

      {notice && (
        <p
          className={
            notice.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"
          }
        >
          {notice.text}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Opslaan
      </Button>
    </form>
  );
}
