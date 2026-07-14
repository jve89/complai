"use client";

import { useState } from "react";
import { ChevronDown, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { TIER_LABEL } from "@/lib/plan";
import type { TierId } from "@/lib/compliance/types";

/**
 * A collapsed disclosure that surfaces what the scan marks NOT applicable —
 * "Toon ook wat nu niet van toepassing lijkt". Nothing is hidden: the count is
 * named in the header, so this is disclosure, not concealment (a self-declared
 * scan must never silently drop a real duty). Renders nothing when count is 0.
 */
export function RelevanceReveal({
  count,
  label = "Toon ook wat nu niet van toepassing lijkt",
  children,
}: {
  count: number;
  label?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  if (count <= 0) return null;
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        {label} ({count})
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

/** Small "vanaf {pakket}" lock pill — a relevant surface the current plan doesn't
 *  yet unlock. Visual only; the surface stays reachable and shows its own upsell. */
export function LockBadge({ tier, className }: { tier: TierId; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700",
        className
      )}
    >
      <Lock className="h-3 w-3" /> Vanaf {TIER_LABEL[tier]}
    </span>
  );
}
