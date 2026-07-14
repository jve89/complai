import { ChevronDown } from "lucide-react";

/**
 * A module info-box: a plain-language lead sentence always visible, with the
 * legal detail (article/annex references) tucked behind a native "Meer over de
 * regels" disclosure. Keeps the page readable for a non-lawyer while the exact
 * grounding stays one click away. Server component — no client JS.
 */
export function RuleNote({
  summary,
  children,
}: {
  summary: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 rounded-lg border bg-secondary/30 px-4 py-3 text-sm">
      <p className="text-muted-foreground">{summary}</p>
      <details className="group mt-1.5">
        <summary className="flex w-fit cursor-pointer list-none items-center gap-1 text-xs font-medium text-brand-700 [&::-webkit-details-marker]:hidden">
          <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
          Meer over de regels
        </summary>
        <div className="mt-2 space-y-1 text-muted-foreground">{children}</div>
      </details>
    </div>
  );
}
