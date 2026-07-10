import Link from "next/link";
import { ArrowRight, BellRing, CheckCircle2, Lock } from "lucide-react";

import { formatDate } from "@/lib/utils";
import { CATEGORY_LABEL, type EvaluatedUpdate } from "@/lib/regulatory/updates";
import { RecertPrompt } from "@/components/dashboard/recert-prompt";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

/** Collapsible "keep you current" card for the dashboard. Renders the recent
 *  updates that are relevant to this company; the page hides it entirely when
 *  empty. Open by default (this drives retention — don't hide it by default),
 *  but collapsible so a returning user can tuck it away after reading.
 *
 *  On the free (Scan) tier `unlocked` is false: it shows a locked teaser with
 *  the relevant count + an upgrade link instead of the update content. */
export function UpdatesCard({
  updates,
  unlocked = true,
}: {
  updates: EvaluatedUpdate[];
  unlocked?: boolean;
}) {
  if (updates.length === 0) return null;

  if (!unlocked) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50/40 px-5 py-4">
        <div className="flex items-start gap-2">
          <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <div>
            <div className="flex items-center gap-2 font-semibold">
              Recente wijzigingen
              <Badge variant="warning" className="font-normal">
                {updates.length} relevant voor u
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              De EU AI Act is veranderd op punten die u raken. Upgrade om te lezen wat en waarom.
            </p>
          </div>
        </div>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Lock className="h-4 w-4" /> Ontgrendel updates
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-brand-100 bg-brand-50/40">
      <Accordion type="single" collapsible defaultValue="updates">
        <AccordionItem value="updates" className="border-0">
          <AccordionTrigger className="px-5 py-4 hover:no-underline">
            <span className="flex items-start gap-2 text-left">
              <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <span>
                <span className="block text-base font-semibold text-foreground">
                  Recente wijzigingen
                </span>
                <span className="mt-0.5 block text-sm font-normal text-muted-foreground">
                  {updates.length} {updates.length === 1 ? "wijziging" : "wijzigingen"} relevant
                  voor u — en wat wij hebben bijgewerkt.
                </span>
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 px-5">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
