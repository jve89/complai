"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import type { Incident } from "@prisma/client";

import { upsertIncident } from "@/app/dashboard/meldingen/actions";
import {
  INCIDENT_CATEGORIES,
  CATEGORY_LABEL,
  CATEGORY_ARTICLE,
  INCIDENT_STATUSES,
  STATUS_LABEL,
  reportDeadline,
  reportDeadlineDays,
  IMMEDIATE_NOTE,
  type IncidentCategory,
  type IncidentStatus,
} from "@/lib/meldingen/labels";
import { formatDate } from "@/lib/utils";
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

export function IncidentDialog({
  incident,
  trigger,
}: {
  incident?: Incident;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: incident?.title ?? "",
    description: incident?.description ?? "",
    category: (incident?.category as IncidentCategory) ?? "health",
    involvesDeath: incident?.involvesDeath ?? false,
    widespread: incident?.widespread ?? false,
    awareAt: toInput(incident?.awareAt) || new Date().toISOString().slice(0, 10),
    occurredAt: toInput(incident?.occurredAt),
    status: (incident?.status as IncidentStatus) ?? "open",
    reportedAt: toInput(incident?.reportedAt),
    reference: incident?.reference ?? "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Live Art 73 deadline preview.
  const cap = reportDeadlineDays({
    category: form.category,
    involvesDeath: form.involvesDeath,
    widespread: form.widespread,
  });
  const deadline = form.awareAt
    ? reportDeadline(new Date(form.awareAt), {
        category: form.category,
        involvesDeath: form.involvesDeath,
        widespread: form.widespread,
      })
    : null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await upsertIncident({ id: incident?.id, ...form });
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
          <DialogTitle>{incident ? "Melding bewerken" : "Incident melden"}</DialogTitle>
          <DialogDescription>
            Leg een ernstig incident vast (Art. 73). Categorie en aard bepalen de
            meldtermijn.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="bijv. Onterechte afwijzing door cv-selectie"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Wat is er gebeurd?</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Beschrijf het incident, het betrokken AI-systeem en de gevolgen."
            />
          </div>

          <div className="space-y-2">
            <Label>Categorie (Art. 3(49))</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v as IncidentCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INCIDENT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABEL[c]} ({CATEGORY_ARTICLE[c]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-start gap-2 rounded-md border p-3 text-sm">
              <input
                type="checkbox"
                checked={form.involvesDeath}
                onChange={(e) => set("involvesDeath", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-input"
              />
              <span>Er is een persoon overleden <span className="text-muted-foreground">(Art. 73(4) — 10 dagen)</span></span>
            </label>
            <label className="flex items-start gap-2 rounded-md border p-3 text-sm">
              <input
                type="checkbox"
                checked={form.widespread}
                onChange={(e) => set("widespread", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-input"
              />
              <span>Wijdverspreide inbreuk <span className="text-muted-foreground">(Art. 73(3) — 2 dagen)</span></span>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="awareAt">Bekend geworden op *</Label>
              <Input
                id="awareAt"
                type="date"
                value={form.awareAt}
                onChange={(e) => set("awareAt", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occurredAt">Voorval op (optioneel)</Label>
              <Input
                id="occurredAt"
                type="date"
                value={form.occurredAt}
                onChange={(e) => set("occurredAt", e.target.value)}
              />
            </div>
          </div>

          {/* Live deadline preview */}
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">
                Uiterste meldtermijn: {cap.days} dagen ({cap.basis})
                {deadline && <> — {formatDate(deadline)}</>}
              </p>
              <p className="mt-0.5 text-xs">{IMMEDIATE_NOTE}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as IncidentStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportedAt">Gemeld op (optioneel)</Label>
              <Input
                id="reportedAt"
                type="date"
                value={form.reportedAt}
                onChange={(e) => set("reportedAt", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Kenmerk toezichthouder (optioneel)</Label>
            <Input
              id="reference"
              value={form.reference}
              onChange={(e) => set("reference", e.target.value)}
              placeholder="bijv. ontvangstbevestiging / dossiernummer"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {incident ? "Opslaan" : "Melding vastleggen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
