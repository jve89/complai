"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, List } from "lucide-react";
import type { AiSystem, AiRole, RiskLevel } from "@prisma/client";

import { upsertAiSystem } from "@/app/dashboard/register/actions";
import { classifyAiSystem } from "@/lib/register/classify";
import { AI_SYSTEMS } from "@/lib/compliance/questions";
import { cn } from "@/lib/utils";
import {
  RISK_LEVELS,
  RISK_LABEL,
  ROLES,
  ROLE_LABEL,
  STATUSES,
  STATUS_LABEL,
  type SystemStatus,
} from "@/lib/register/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  system?: AiSystem;
  trigger: React.ReactNode;
  /** Company employees, for the human-oversight (Art 26(2)) assignee select. */
  employees?: { id: string; name: string; trainingCompleted: boolean }[];
}

/** Naam field as a searchable combobox over the recognised-systems catalog.
 *  Typing filters known systems; picking one fills name + vendor. A name that
 *  isn't in the list is fine too — that's just manual entry, as before. */
interface NameComboboxHandle {
  open: () => void;
}

const NameCombobox = forwardRef<
  NameComboboxHandle,
  {
    value: string;
    onType: (v: string) => void;
    onPick: (s: { name: string; vendor: string }) => void;
  }
>(({ value, onType, onPick }, ref) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = "name-combobox-listbox";

  useImperativeHandle(ref, () => ({
    open: () => {
      setOpen(true);
      inputRef.current?.focus();
    },
  }));

  const results = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return AI_SYSTEMS; // empty → browse the whole catalog (scrollable)
    return AI_SYSTEMS.filter((s) => `${s.name} ${s.vendor}`.toLowerCase().includes(q)).slice(0, 8);
  }, [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function choose(s: (typeof AI_SYSTEMS)[number]) {
    onPick({ name: s.name, vendor: s.vendor });
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <Input
        ref={inputRef}
        id="name"
        value={value}
        onChange={(e) => {
          onType(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onKeyDown={(e) => {
          if (!open || results.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            choose(results[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder="bijv. ChatGPT — of typ zelf een naam"
        autoComplete="off"
        required
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-autocomplete="list"
        aria-controls={listboxId}
      />
      {open && results.length > 0 && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border bg-card py-1 shadow-md"
        >
          {results.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(s)}
              className={cn(
                "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm",
                i === active ? "bg-secondary" : "hover:bg-secondary/60"
              )}
            >
              <span className="font-medium">{s.name}</span>
              <span className="text-xs text-muted-foreground">{s.vendor}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
NameCombobox.displayName = "NameCombobox";

export function AiSystemDialog({ system, trigger, employees = [] }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const comboRef = useRef<NameComboboxHandle>(null);

  const [form, setForm] = useState<{
    name: string;
    vendor: string;
    description: string;
    role: AiRole;
    riskLevel: RiskLevel;
    status: SystemStatus;
    oversightEmployeeId: string; // "none" sentinel = niemand toegewezen
  }>({
    name: system?.name ?? "",
    vendor: system?.vendor ?? "",
    description: system?.description ?? "",
    role: system?.role ?? "deployer",
    riskLevel: system?.riskLevel ?? "limited",
    status: (system?.status as SystemStatus) ?? "active",
    oversightEmployeeId: system?.oversightEmployeeId ?? "none",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function suggest() {
    const result = classifyAiSystem({
      name: form.name,
      description: form.description,
      vendor: form.vendor,
    });
    set("riskLevel", result.level);
    setSuggestion(result.reason);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await upsertAiSystem({
        id: system?.id,
        ...form,
        oversightEmployeeId:
          form.oversightEmployeeId === "none" ? null : form.oversightEmployeeId,
      });
      if (res.ok) {
        setOpen(false);
        setSuggestion(null);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {system ? "AI-systeem bewerken" : "AI-systeem toevoegen"}
          </DialogTitle>
          <DialogDescription>
            Leg het systeem vast in uw register en bepaal het risiconiveau.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Naam *</Label>
              <NameCombobox
                ref={comboRef}
                value={form.name}
                onType={(v) => set("name", v)}
                onPick={(s) => setForm((f) => ({ ...f, name: s.name, vendor: s.vendor }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor">Leverancier</Label>
              <Input
                id="vendor"
                value={form.vendor}
                onChange={(e) => set("vendor", e.target.value)}
                placeholder="bijv. OpenAI"
              />
            </div>
          </div>

          <div className="rounded-lg border border-dashed bg-secondary/40 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Kies een AI-systeem uit de catalogus.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => comboRef.current?.open()}
              >
                <List className="h-4 w-4" /> Toon catalogus
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Omschrijving</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Waarvoor wordt dit systeem gebruikt?"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={form.role}
                onValueChange={(v) => set("role", v as typeof form.role)}
              >
                <SelectTrigger aria-label="Rol">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Risiconiveau</Label>
              <Select
                value={form.riskLevel}
                onValueChange={(v) =>
                  set("riskLevel", v as typeof form.riskLevel)
                }
              >
                <SelectTrigger aria-label="Risiconiveau">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RISK_LEVELS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {RISK_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v as typeof form.status)}
              >
                <SelectTrigger aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Menselijk toezicht (Art. 26)</Label>
            <Select
              value={form.oversightEmployeeId}
              onValueChange={(v) => set("oversightEmployeeId", v)}
            >
              <SelectTrigger aria-label="Menselijk toezicht (Art. 26)">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Niemand toegewezen</SelectItem>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                    {e.trainingCompleted ? " — getraind" : " — nog niet getraind"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {employees.length === 0
                ? "Voeg eerst medewerkers toe (via e-learning) om een toezichthouder aan te wijzen."
                : "Hoog-risico systemen vereisen een bekwame, getrainde toezichthouder (Art. 26 lid 2)."}
            </p>
          </div>

          <div className="rounded-lg border border-dashed bg-secondary/40 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Twijfelt u over het risiconiveau? Laat ComplAI een suggestie doen
                op basis van Annex III.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={suggest}
              >
                <Sparkles className="h-4 w-4" /> Suggestie
              </Button>
            </div>
            {suggestion && (
              <p className="mt-2 text-sm text-foreground">{suggestion}</p>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Annuleren
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {system ? "Opslaan" : "Toevoegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
