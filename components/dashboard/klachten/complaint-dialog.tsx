"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Complaint } from "@prisma/client";

import { upsertComplaint } from "@/app/dashboard/klachten/actions";
import {
  COMPLAINT_STATUSES,
  STATUS_LABEL,
  COMPLAINT_CHANNELS,
  CHANNEL_LABEL,
  type ComplaintStatus,
} from "@/lib/klachten/labels";
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

export function ComplaintDialog({
  complaint,
  systems,
  trigger,
}: {
  complaint?: Complaint;
  systems: { id: string; name: string }[];
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    subject: complaint?.subject ?? "",
    description: complaint?.description ?? "",
    aiSystemId: complaint?.aiSystemId ?? "none",
    complainant: complaint?.complainant ?? "",
    channel: complaint?.channel || "none",
    status: (complaint?.status as ComplaintStatus) ?? "open",
    receivedAt: toInput(complaint?.receivedAt) || new Date().toISOString().slice(0, 10),
    resolution: complaint?.resolution ?? "",
    resolvedAt: toInput(complaint?.resolvedAt),
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await upsertComplaint({
        id: complaint?.id,
        ...form,
        aiSystemId: form.aiSystemId === "none" ? null : form.aiSystemId,
        channel: form.channel === "none" ? "" : form.channel,
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
          <DialogTitle>{complaint ? "Klacht bewerken" : "Klacht registreren"}</DialogTitle>
          <DialogDescription>
            Leg een klacht over de inzet van een AI-systeem vast en volg de afhandeling
            (Art. 85 / 27 lid 1(f)).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Onderwerp *</Label>
            <Input
              id="subject"
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
              placeholder="bijv. Bezwaar tegen automatische afwijzing"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Omschrijving</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Waar gaat de klacht over? Wat is er gebeurd?"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Betreft AI-systeem (optioneel)</Label>
              <Select value={form.aiSystemId} onValueChange={(v) => set("aiSystemId", v)}>
                <SelectTrigger aria-label="Betreft AI-systeem (optioneel)">
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
              <Label htmlFor="complainant">Klager (optioneel)</Label>
              <Input
                id="complainant"
                value={form.complainant}
                onChange={(e) => set("complainant", e.target.value)}
                placeholder="naam / rol (mag anoniem)"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Binnengekomen via (optioneel)</Label>
              <Select value={form.channel} onValueChange={(v) => set("channel", v)}>
                <SelectTrigger aria-label="Binnengekomen via (optioneel)">
                  <SelectValue placeholder="Kies een kanaal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {COMPLAINT_CHANNELS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CHANNEL_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="receivedAt">Ontvangen op *</Label>
              <Input
                id="receivedAt"
                type="date"
                value={form.receivedAt}
                onChange={(e) => set("receivedAt", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as ComplaintStatus)}>
                <SelectTrigger aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPLAINT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resolvedAt">Afgehandeld op (optioneel)</Label>
              <Input
                id="resolvedAt"
                type="date"
                value={form.resolvedAt}
                onChange={(e) => set("resolvedAt", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution">Uitkomst / afhandeling (optioneel)</Label>
            <Textarea
              id="resolution"
              value={form.resolution}
              onChange={(e) => set("resolution", e.target.value)}
              placeholder="Hoe is de klacht afgehandeld?"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {complaint ? "Opslaan" : "Registreren"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
