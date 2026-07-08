import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";

/** Shown under a relevant update that affects training — nudges the user to
 *  refresh their e-learning / re-certify. `compact` trims it for the dashboard
 *  card. */
export function RecertPrompt({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 ${
        compact ? "mt-2 p-2.5 text-xs" : "mt-3 p-3 text-sm"
      }`}
    >
      <GraduationCap className={`mt-0.5 shrink-0 ${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
      <div>
        <p>{text}</p>
        <Link
          href="/dashboard/training"
          className="mt-1 inline-flex items-center gap-1 font-medium text-amber-900 hover:underline"
        >
          Naar e-learning <ArrowRight className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        </Link>
      </div>
    </div>
  );
}
