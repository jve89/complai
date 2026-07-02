"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";

import { setCompanyPlan } from "@/app/dashboard/admin/actions";
import { TIER_ORDER, TIER_LABEL } from "@/lib/plan";
import type { TierId } from "@/lib/compliance/types";

export function PlanSelect({
  companyId,
  plan,
}: {
  companyId: string;
  plan: string;
}) {
  const [value, setValue] = useState(plan);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function change(next: string) {
    setValue(next);
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const res = await setCompanyPlan(companyId, next);
      if (res.ok) {
        setSaved(true);
      } else {
        setError(res.error);
        setValue(plan); // revert
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => change(e.target.value)}
        disabled={isPending}
        className="rounded-md border bg-background px-2 py-1.5 text-sm"
      >
        {TIER_ORDER.map((t) => (
          <option key={t} value={t}>
            {TIER_LABEL[t as TierId]}
          </option>
        ))}
      </select>
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : saved ? (
        <Check className="h-4 w-4 text-brand-600" />
      ) : null}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
