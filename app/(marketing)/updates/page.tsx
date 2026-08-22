import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BellRing, CheckCircle2, ExternalLink } from "lucide-react";

import { CATEGORY_LABEL, daysSince } from "@/lib/regulatory/updates";
import { getPublishedUpdates } from "@/lib/regulatory/updates-data";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Updates — wijzigingen in de EU AI Act",
  description:
    "De actuele tijdlijn van de EU AI Act (Verordening (EU) 2024/1689): nieuwe deadlines, verboden praktijken, GPAI en handhaving — met de primaire bron bij elke wijziging.",
  alternates: { canonical: "/updates" },
};

// Rendered per request (not prerendered at build): the update feed is DB-backed
// and published self-serve, so it must reflect new entries immediately — and the
// build must never depend on the database being reachable.
export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
  const now = new Date();
  const updates = await getPublishedUpdates();

  return (
    <div className="container max-w-4xl py-16 sm:py-20">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <Badge variant="secondary" className="bg-accent text-accent-foreground">
          Updates
        </Badge>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Wijzigingen in de EU AI Act
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          De EU AI Act verandert. Hier houden we de tijdlijn bij — met de primaire
          bron bij elke wijziging. In het platform ziet u bovendien wat elke
          wijziging voor úw organisatie betekent.
        </p>
      </div>

      <div className="space-y-4">
        {updates.map((u) => {
          const isNew = daysSince(u.date, now) <= 30;
          return (
            <Card key={u.id}>
              <CardContent className="py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="font-normal">
                    {CATEGORY_LABEL[u.category]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(new Date(u.date))}
                  </span>
                  {isNew && <Badge variant="success">Nieuw</Badge>}
                </div>

                <div className="mt-2 flex items-start gap-2">
                  <BellRing className="mt-1 h-4 w-4 shrink-0 text-brand-600" />
                  <div>
                    <p className="font-semibold">{u.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{u.summary}</p>
                  </div>
                </div>

                {u.detail && u.detail.length > 0 && (
                  <div className="mt-3 space-y-2 pl-6">
                    {u.detail.map((d, i) => (
                      <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                        {d}
                      </p>
                    ))}
                  </div>
                )}

                {u.productImpact && (
                  <p className="mt-3 flex items-start gap-1.5 pl-6 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Wij hebben bijgewerkt: {u.productImpact}</span>
                  </p>
                )}

                <a
                  href={u.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 pl-6 text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  Bron: {u.source.label} <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Wij houden deze tijdlijn actueel op basis van primaire bronnen (Europese
        Commissie, Raad, Parlement en het Publicatieblad). Dit is
        beslissingsondersteuning, geen juridisch advies.
      </p>

      <Card className="mt-16 overflow-hidden border-0 bg-navy-900 text-white">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <h2 className="text-2xl font-bold">Wat betekent dit voor úw organisatie?</h2>
          <p className="max-w-lg text-white/70">
            Doe de gratis scan — daarna markeren we elke wijziging die uw
            organisatie raakt, en houden we uw deadlines en documenten actueel.
          </p>
          <Button asChild size="lg">
            <Link href="/scan">
              Start de gratis scan <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="text-xs text-white/50">
            Algemene informatie, geen juridisch advies.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
