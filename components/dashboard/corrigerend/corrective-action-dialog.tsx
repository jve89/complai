"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { CorrectiveAction } from "@prisma/client";

import { upsertCorrectiveAction } from "@/app/dashboard/corrigerend/actions";
import {
  ACTION_TYPES,
  ACTION_LABEL,
  CORRECTIVE_STATUSES,
  STATUS_LABEL,
  RISK_NOTE,
  type ActionType,
  type CorrectiveStatus,
} from "@/lib/corrigerend/labels";
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

function toInput(d?: Date | string | null): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  return Number.isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
}

export function CorrectiveActionDialog({
  action,
  systems,
  trigger,
}: {
  action?: CorrectiveAction;
  systems: { id: string; name: string }[];
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: action?.title ?? "",
    nonConformity: action?.nonConformity ?? "",
    aiSystemId: action?.aiSystemId ?? "none",
    actionType: (action?.actionType as ActionType) ?? "bring_into_conformity",
    actionTaken: action?.actionTaken ?? "",
    informed: action?.informed ?? "",
    presentsRisk: action?.presentsRisk ?? false,
    authorityInformed: action?.authorityInformed ?? false,
    status: (action?.status as CorrectiveStatus) ?? "open",
    identifiedAt: toInput(action?.identifiedAt) || new Date().toISOString().slice(0, 10),
    resolvedAt: toInput(action?.resolvedAt),
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await upsertCorrectiveAction({
        id: action?.id,
        ...form,
        aiSystemId: form.aiSystemId === "none" ? null : form.aiSystemId,
      });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {action ? "Maatregel bewerken" : "Corrigerende maatregel vastleggen"}
          </DialogTitle>
          <DialogDescription>
            Leg vast welke corrigerende maatregel u neemt bij een non-conform hoog-risico
            systeem (Art. 20).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Onderwerp *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="bijv. Model wijkt af van technische documentatie"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nonConformity">Aard van de non-conformiteit</Label>
            <Textarea
              id="nonConformity"
              value={form.nonConformity}
              onChange={(e) => set("nonConformity", e.target.value)}
              placeholder="Wat is er niet conform, en hoe is dat vastgesteld (monitoring, klacht, incident, audit)?"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Betreft AI-systeem (optioneel)</Label>
              <Select value={form.aiSystemId} onValueChange={(v) => set("aiSystemId", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Geen specifiek systeem</SelectItem>
                  {systems.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Maatregel (Art. 20)</Label>
              <Select value={form.actionType} onValueChange={(v) => set("actionType", v as ActionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((a) => (
                    <SelectItem key={a} value={a}>
                      {ACTION_LABEL[a]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="actionTaken">Genomen maatregel</Label>
            <Textarea
              id="actionTaken"
              value={form.actionTaken}
              onChange={(e) => set("actionTaken", e.target.value)}
              placeholder="Wat heeft u concreet gedaan?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="informed">Wie geïnformeerd</Label>
            <Input
              id="informed"
              value={form.informed}
              onChange={(e) => set("informed", e.target.value)}
              placeholder="bijv. distributeurs, gebruiksverantwoordelijken, gemachtigde, importeurs"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-start gap-2 rounded-md border p-3 text-sm">
              <input
                type="checkbox"
                checked={form.presentsRisk}
                onChange={(e) => set("presentsRisk", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-input"
              />
              <span>
                Levert een risico op <span className="text-muted-foreground">(Art. 79 lid 1)</span>
              </span>
            </label>
            <label className="flex items-start gap-2 rounded-md border p-3 text-sm">
              <input
                type="checkbox"
                checked={form.authorityInformed}
                onChange={(e) => set("authorityInformed", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-input"
              />
              <span>
                Markttoezichthouder geïnformeerd <span className="text-muted-foreground">(Art. 20 lid 2)</span>
              </span>
            </label>
          </div>

          {form.presentsRisk && !form.authorityInformed && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              {RISK_NOTE}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as CorrectiveStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CORRECTIVE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="identifiedAt">Vastgesteld op *</Label>
              <Input
                id="identifiedAt"
                type="date"
                value={form.identifiedAt}
                onChange={(e) => set("identifiedAt", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resolvedAt">Afgehandeld op</Label>
              <Input
                id="resolvedAt"
                type="date"
                value={form.resolvedAt}
                onChange={(e) => set("resolvedAt", e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {action ? "Opslaan" : "Vastleggen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
