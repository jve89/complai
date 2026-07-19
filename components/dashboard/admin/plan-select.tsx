"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";

import { setCompanyPlan } from "@/app/dashboard/admin/actions";
import { Button } from "@/components/ui/button";
import { TIER_ORDER, TIER_LABEL } from "@/lib/plan";
import type { TierId } from "@/lib/compliance/types";

export function PlanSelect({
  companyId,
  companyName,
  plan,
}: {
  companyId: string;
  companyName: string;
  plan: string;
}) {
  const [current, setCurrent] = useState(plan);
  const [staged, setStaged] = useState(plan);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dirty = staged !== current;

  function apply() {
    setError(null);
    if (
      !confirm(
        `Pakket van ${companyName} wijzigen naar ${TIER_LABEL[staged as TierId]}?`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await setCompanyPlan(companyId, staged);
      if (res.ok) {
        setCurrent(staged);
      } else {
        setError(res.error);
        setStaged(current); // revert selection
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label={`Pakket voor ${companyName}`}
        value={staged}
        onChange={(e) => setStaged(e.target.value)}
        disabled={isPending}
        className="rounded-md border bg-background px-2 py-1.5 text-sm"
      >
        {TIER_ORDER.map((t) => (
          <option key={t} value={t}>
            {TIER_LABEL[t as TierId]}
          </option>
        ))}
      </select>
      {dirty ? (
        <Button size="sm" onClick={apply} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Toepassen"}
        </Button>
      ) : (
        <Check className="h-4 w-4 text-brand-600/50" />
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
