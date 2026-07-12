import { AlertCircle } from "lucide-react";

import { PENDING_PUBLICATION_NOTE, hasPendingPublication } from "@/lib/compliance/timeline";
import { cn } from "@/lib/utils";

/**
 * Provenance qualifier for dates that come from the Digital Omnibus but are not
 * yet published in the Official Journal. Rendered wherever a `pending_publication`
 * date is shown (scan results, stamped deadlines, kennisbank, marketing,
 * e-learning). Renders nothing once every application date is in force — flip the
 * four timeline `status` flags on OJ publication and this disappears from every
 * surface at once. Plain server component, so it works in any tree.
 */
export function PendingPublicationNote({ className }: { className?: string }) {
  if (!hasPendingPublication()) return null;
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800",
        className
      )}
    >
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <p>{PENDING_PUBLICATION_NOTE}</p>
    </div>
  );
}
