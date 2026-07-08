import Link from "next/link";
import { ArrowRight, BellRing, CheckCircle2 } from "lucide-react";

import { formatDate } from "@/lib/utils";
import { CATEGORY_LABEL, type EvaluatedUpdate } from "@/lib/regulatory/updates";
import { RecertPrompt } from "@/components/dashboard/recert-prompt";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Compact "keep you current" card for the dashboard. Renders the recent updates
 *  that are relevant to this company; the page hides it entirely when empty. */
export function UpdatesCard({ updates }: { updates: EvaluatedUpdate[] }) {
  if (updates.length === 0) return null;
  return (
    <Card className="mb-6 border-brand-100 bg-brand-50/40">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BellRing className="h-5 w-5 text-brand-600" />
          <CardTitle className="text-base">Recente wijzigingen</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Ontwikkelingen in de EU AI Act die voor u relevant zijn — en wat wij hebben bijgewerkt.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {updates.map((u) => (
          <div key={u.id} className="border-l-2 border-brand-300 pl-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                {CATEGORY_LABEL[u.category]}
              </Badge>
              <span className="text-xs text-muted-foreground">{formatDate(new Date(u.date))}</span>
              {u.relevant && <Badge variant="warning">Voor u relevant</Badge>}
            </div>
            <p className="mt-1 font-medium">{u.title}</p>
            <p className="text-sm text-muted-foreground">{u.summary}</p>
            {u.reason && <p className="mt-0.5 text-xs font-medium text-brand-700">{u.reason}</p>}
            {u.productImpact && (
              <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>Wij hebben bijgewerkt: {u.productImpact}</span>
              </p>
            )}
            {u.relevant && u.recert && <RecertPrompt text={u.recert} compact />}
          </div>
        ))}
        <Link
          href="/dashboard/updates"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Alle wijzigingen <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
