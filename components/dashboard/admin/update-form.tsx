"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Send, Trash2 } from "lucide-react";

import { CATEGORY_LABEL, type UpdateCategory } from "@/lib/regulatory/updates";
import {
  saveRegulatoryUpdate,
  deleteRegulatoryUpdate,
} from "@/app/dashboard/admin/updates/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface UpdateFormValues {
  id?: string;
  date: string;
  title: string;
  summary: string;
  detail: string; // newline-separated paragraphs (one per line)
  category: UpdateCategory;
  sourceLabel: string;
  sourceUrl: string;
  affectsEveryone: boolean;
  affectsHighRisk: boolean;
  affectsProhibited: boolean;
  affectsLimited: boolean;
  affectsProvider: boolean;
  productImpact: string;
  recert: string;
  status: "draft" | "published";
}

const AFFECTS: { key: keyof UpdateFormValues; label: string }[] = [
  { key: "affectsEveryone", label: "Iedereen die AI gebruikt" },
  { key: "affectsHighRisk", label: "Hoog-risico AI" },
  { key: "affectsProhibited", label: "Mogelijk verboden praktijk" },
  { key: "affectsLimited", label: "Transparantieplicht (Art. 50)" },
  { key: "affectsProvider", label: "Aanbieder (provider)" },
];

export function UpdateForm({ initial }: { initial: UpdateFormValues }) {
  const router = useRouter();
  const [v, setV] = useState<UpdateFormValues>(initial);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof UpdateFormValues>(k: K, val: UpdateFormValues[K]) =>
    setV((s) => ({ ...s, [k]: val }));

  function save(status: "draft" | "published") {
    setError(null);
    const payload = {
      ...v,
      status,
      detail: v.detail.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    startTransition(async () => {
      const res = await saveRegulatoryUpdate(payload);
      if (res.ok) {
        router.push("/dashboard/admin/updates");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function remove() {
    if (!v.id || !window.confirm("Deze update definitief verwijderen?")) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteRegulatoryUpdate(v.id!);
      if (res.ok) {
        router.push("/dashboard/admin/updates");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="date">Datum (besluit/publicatie)</Label>
          <Input id="date" type="date" value={v.date} onChange={(e) => set("date", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Categorie</Label>
          <select
            id="category"
            value={v.category}
            onChange={(e) => set("category", e.target.value as UpdateCategory)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {(Object.keys(CATEGORY_LABEL) as UpdateCategory[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Titel</Label>
        <Input id="title" value={v.title} onChange={(e) => set("title", e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="summary">Samenvatting (1–2 zinnen)</Label>
        <Textarea id="summary" rows={3} value={v.summary} onChange={(e) => set("summary", e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="detail">Detail (optioneel — één alinea per regel)</Label>
        <Textarea id="detail" rows={5} value={v.detail} onChange={(e) => set("detail", e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="sourceLabel">Bron — label</Label>
          <Input id="sourceLabel" value={v.sourceLabel} onChange={(e) => set("sourceLabel", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sourceUrl">Bron — URL (primaire bron, verplicht)</Label>
          <Input
            id="sourceUrl"
            type="url"
            placeholder="https://…"
            value={v.sourceUrl}
            onChange={(e) => set("sourceUrl", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Relevant voor (minstens één)</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {AFFECTS.map((a) => (
            <label key={a.key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={v[a.key] as boolean}
                onChange={(e) => set(a.key, e.target.checked as never)}
                className="h-4 w-4 rounded border-input"
              />
              {a.label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="productImpact">Wat wij bijwerkten (optioneel)</Label>
        <Textarea id="productImpact" rows={2} value={v.productImpact} onChange={(e) => set("productImpact", e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="recert">Re-certificering-prompt (optioneel — toont een e-learning-nudge)</Label>
        <Textarea id="recert" rows={2} value={v.recert} onChange={(e) => set("recert", e.target.value)} />
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        <Button onClick={() => save("published")} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Publiceren
        </Button>
        <Button variant="outline" onClick={() => save("draft")} disabled={isPending}>
          <Save className="h-4 w-4" /> Als concept opslaan
        </Button>
        <span className="text-xs text-muted-foreground">
          Huidige status: {v.status === "published" ? "Gepubliceerd" : "Concept"}
        </span>
        {v.id && (
          <Button
            variant="ghost"
            onClick={remove}
            disabled={isPending}
            className="ml-auto text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Verwijderen
          </Button>
        )}
      </div>
    </div>
  );
}
