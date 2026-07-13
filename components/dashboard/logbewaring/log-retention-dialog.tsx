"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";

import { updateLogRetention } from "@/app/dashboard/logbewaring/actions";
import { MIN_RETENTION_MONTHS, UNDER_CONTROL_NOTE } from "@/lib/logbewaring/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function toInput(d?: Date | string | null): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  return Number.isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
}

export interface LogRetentionSystem {
  id: string;
  name: string;
  logLocation: string | null;
  logRetentionMonths: number | null;
  logRetentionOwner: string | null;
  logReviewedAt: Date | string | null;
}

export function LogRetentionDialog({
  system,
  trigger,
}: {
  system: LogRetentionSystem;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    logLocation: system.logLocation ?? "",
    logRetentionMonths:
      system.logRetentionMonths != null ? String(system.logRetentionMonths) : "",
    logRetentionOwner: system.logRetentionOwner ?? "",
    logReviewedAt: toInput(system.logReviewedAt),
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const monthsNum = form.logRetentionMonths ? Number(form.logRetentionMonths) : null;
  const underMin = monthsNum != null && !Number.isNaN(monthsNum) && monthsNum < MIN_RETENTION_MONTHS;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await updateLogRetention({ id: system.id, ...form });
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
          <DialogTitle>Logbewaring — {system.name}</DialogTitle>
          <DialogDescription>
            Leg vast hoe u de automatisch gegenereerde logs van dit hoog-risico systeem
            bewaart (Art. 26 lid 6).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logLocation">Bewaarplaats</Label>
            <Input
              id="logLocation"
              value={form.logLocation}
              onChange={(e) => set("logLocation", e.target.value)}
              placeholder="bijv. Logserver on-premise / Azure-tenant / via leverancier"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="logRetentionMonths">Bewaartermijn (maanden)</Label>
              <Input
                id="logRetentionMonths"
                type="number"
                min={0}
                value={form.logRetentionMonths}
                onChange={(e) => set("logRetentionMonths", e.target.value)}
                placeholder={String(MIN_RETENTION_MONTHS)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logReviewedAt">Laatst herzien op</Label>
              <Input
                id="logReviewedAt"
                type="date"
                value={form.logReviewedAt}
                onChange={(e) => set("logReviewedAt", e.target.value)}
              />
            </div>
          </div>

          {underMin && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Art. 26 lid 6 vraagt ten minste {MIN_RETENTION_MONTHS} maanden, tenzij
                Unie- of nationaal recht een andere termijn voorschrijft.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="logRetentionOwner">Verantwoordelijke</Label>
            <Input
              id="logRetentionOwner"
              value={form.logRetentionOwner}
              onChange={(e) => set("logRetentionOwner", e.target.value)}
              placeholder="bijv. IT-beheer / functionaris gegevensbescherming"
            />
          </div>

          <p className="rounded-lg border bg-secondary/30 p-3 text-xs text-muted-foreground">
            {UNDER_CONTROL_NOTE}
          </p>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Opslaan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
