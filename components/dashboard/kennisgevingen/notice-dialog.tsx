"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Info } from "lucide-react";
import type { Notice } from "@prisma/client";

import { upsertNotice } from "@/app/dashboard/kennisgevingen/actions";
import {
  NOTICE_TYPES,
  NOTICE_TYPE_LABEL,
  NOTICE_TYPE_DESC,
  NOTICE_TYPE_ARTICLE,
  NOTICE_STATUSES,
  STATUS_LABEL,
  NOTICE_METHODS,
  METHOD_LABEL,
  type NoticeType,
  type NoticeStatus,
} from "@/lib/kennisgevingen/labels";
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

/** Per-type copy for the recipient + detail fields. */
const RECIPIENT_PLACEHOLDER: Record<NoticeType, string> = {
  worker: "bijv. Ondernemingsraad + betrokken werknemers",
  affected: "bijv. Sollicitanten / de betrokken persoon",
  explanation: "Naam van de betrokkene die om uitleg vroeg",
};
const DETAIL_LABEL: Record<NoticeType, string> = {
  worker: "Interne aantekening (optioneel)",
  affected: "Interne aantekening (optioneel)",
  explanation: "Hoofdelementen van het besluit en rol van het AI-systeem",
};

export function NoticeDialog({
  notice,
  systems,
  trigger,
}: {
  notice?: Notice;
  systems: { id: string; name: string }[];
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: (notice?.type as NoticeType) ?? "worker",
    aiSystemId: notice?.aiSystemId ?? "none",
    recipient: notice?.recipient ?? "",
    method: notice?.method || "none",
    detail: notice?.detail ?? "",
    status: (notice?.status as NoticeStatus) ?? "draft",
    issuedAt: toInput(notice?.issuedAt),
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await upsertNotice({
        id: notice?.id,
        ...form,
        aiSystemId: form.aiSystemId === "none" ? null : form.aiSystemId,
        method: form.method === "none" ? "" : form.method,
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
            {notice ? "Kennisgeving bewerken" : "Kennisgeving vastleggen"}
          </DialogTitle>
          <DialogDescription>
            Leg vast wie u informeert over de inzet van hoog-risico AI, en genereer de
            bijbehorende kennisgeving (Art. 26 / 86).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Soort kennisgeving</Label>
            <Select value={form.type} onValueChange={(v) => set("type", v as NoticeType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NOTICE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {NOTICE_TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                {NOTICE_TYPE_DESC[form.type]} ({NOTICE_TYPE_ARTICLE[form.type]})
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Wie informeert u? *</Label>
            <Input
              id="recipient"
              value={form.recipient}
              onChange={(e) => set("recipient", e.target.value)}
              placeholder={RECIPIENT_PLACEHOLDER[form.type]}
              required
            />
          </div>

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
            <Label htmlFor="detail">{DETAIL_LABEL[form.type]}</Label>
            <Textarea
              id="detail"
              value={form.detail}
              onChange={(e) => set("detail", e.target.value)}
              placeholder={
                form.type === "explanation"
                  ? "Beschrijf de belangrijkste factoren en de rol van het AI-systeem — dit verschijnt in de uitleg."
                  : "Alleen voor uw eigen administratie; verschijnt niet in de kennisgeving."
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as NoticeStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTICE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issuedAt">Verstrekt op (optioneel)</Label>
              <Input
                id="issuedAt"
                type="date"
                value={form.issuedAt}
                onChange={(e) => set("issuedAt", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hoe verstrekt (optioneel)</Label>
            <Select value={form.method} onValueChange={(v) => set("method", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Kies een methode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {NOTICE_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {METHOD_LABEL[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {notice ? "Opslaan" : "Vastleggen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
