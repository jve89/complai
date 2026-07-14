"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { upsertConformityAssessment } from "@/app/dashboard/conformiteit/actions";
import {
  CONFORMITY_STEPS,
  CONFORMITY_ROUTES,
  ROUTE_LABEL,
  STEP_STATUSES,
  STATUS_LABEL,
  ROUTE_NOTE,
  type ConformityRoute,
  type StepKey,
  type StepStatus,
  type StepsMap,
} from "@/lib/conformiteit/labels";
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

export interface ConformityDialogSystem {
  id: string;
  name: string;
  route: string | null;
  steps: StepsMap | null;
  notes: string | null;
  reviewedAt: Date | string | null;
}

export function ConformityDialog({
  system,
  trigger,
}: {
  system: ConformityDialogSystem;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [route, setRoute] = useState<ConformityRoute>(
    (system.route as ConformityRoute) || "internal"
  );
  const [steps, setSteps] = useState<StepsMap>({ ...(system.steps ?? {}) });
  const [notes, setNotes] = useState(system.notes ?? "");
  const [reviewedAt, setReviewedAt] = useState(toInput(system.reviewedAt));

  function setStep(key: StepKey, value: StepStatus) {
    setSteps((s) => ({ ...s, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await upsertConformityAssessment({
        aiSystemId: system.id,
        route,
        steps,
        notes,
        reviewedAt,
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
          <DialogTitle>Conformiteitsbeoordeling — {system.name}</DialogTitle>
          <DialogDescription>
            Leg de route en de status van elke stap vast (Art. 43 en volgende).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Route (Art. 43)</Label>
            <Select value={route} onValueChange={(v) => setRoute(v as ConformityRoute)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONFORMITY_ROUTES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROUTE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{ROUTE_NOTE}</p>
          </div>

          <div className="space-y-2">
            <Label>Stappen</Label>
            <div className="space-y-2">
              {CONFORMITY_STEPS.map((s) => (
                <div key={s.key} className="grid grid-cols-[1fr,auto] items-center gap-3">
                  <span className="text-sm">{s.label}</span>
                  <Select
                    value={steps[s.key] ?? "todo"}
                    onValueChange={(v) => setStep(s.key, v as StepStatus)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STEP_STATUSES.map((st) => (
                        <SelectItem key={st} value={st}>
                          {STATUS_LABEL[st]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reviewedAt">Laatst herzien op (optioneel)</Label>
              <Input
                id="reviewedAt"
                type="date"
                value={reviewedAt}
                onChange={(e) => setReviewedAt(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Aantekeningen (optioneel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="bijv. aangemelde instantie, certificaatnummer (Art. 44), of openstaande punten"
            />
          </div>

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
