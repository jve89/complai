"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import type { AiSystem, AiRole, RiskLevel } from "@prisma/client";

import { upsertAiSystem } from "@/app/dashboard/register/actions";
import { classifyAiSystem } from "@/lib/register/classify";
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
}

export function AiSystemDialog({ system, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const [form, setForm] = useState<{
    name: string;
    vendor: string;
    description: string;
    role: AiRole;
    riskLevel: RiskLevel;
    status: SystemStatus;
  }>({
    name: system?.name ?? "",
    vendor: system?.vendor ?? "",
    description: system?.description ?? "",
    role: system?.role ?? "deployer",
    riskLevel: system?.riskLevel ?? "limited",
    status: (system?.status as SystemStatus) ?? "active",
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
      const res = await upsertAiSystem({ id: system?.id, ...form });
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
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="bijv. CV-screening tool"
                required
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
                <SelectTrigger>
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
                <SelectTrigger>
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
                <SelectTrigger>
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
