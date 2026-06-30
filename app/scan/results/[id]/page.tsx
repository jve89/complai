import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AlertTriangle, ArrowRight, CheckCircle2, Circle, Download, Sparkles } from "lucide-react";

import { prisma } from "@/lib/prisma";
import type { ComplianceProfile } from "@/lib/compliance/types";
import { ScoreRing } from "@/components/score-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Uw scanresultaat" };

const HEADLINE: Record<
  ComplianceProfile["headline"],
  { label: string; variant: "success" | "info" | "warning" | "danger" | "secondary"; note: string }
> = {
  prohibited: { label: "Verboden praktijk", variant: "danger", note: "Eén of meer toepassingen lijken verboden onder Art. 5. Staak het gebruik en laat dit met spoed toetsen." },
  high_risk: { label: "Hoog risico", variant: "warning", note: "U gebruikt hoog-risico AI. Daar horen stevige verplichtingen bij — zie hieronder." },
  limited_risk: { label: "Beperkt risico", variant: "info", note: "Vooral transparantieverplichtingen (Art. 50) zijn van toepassing." },
  out_of_scope: { label: "Buiten de reikwijdte", variant: "secondary", note: "Op basis van uw antwoorden valt u (grotendeels) buiten de AI Act. Houd dit actueel." },
  excluded: { label: "Uitgesloten", variant: "secondary", note: "Uw gebruik lijkt te zijn uitgesloten van de AI Act." },
  minimal: { label: "Minimaal risico", variant: "success", note: "Weinig verplichtingen — borg wel de basis zoals AI-geletterdheid." },
};

const TIER_LABEL: Record<string, string> = {
  gratis: "Inzicht",
  starter: "Actief",
  groei: "Compliance-klaar",
  schaal: "Audit-klaar",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "compliant" || status === "done")
    return <Badge variant="success">Op orde</Badge>;
  if (status === "in_progress") return <Badge variant="warning">Bezig</Badge>;
  return <Badge variant="secondary">Te doen</Badge>;
}

export default async function ScanResultsPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await prisma.scanResult.findUnique({ where: { id: params.id } });
  if (!result || !result.profile) notFound();

  const profile = result.profile as unknown as ComplianceProfile;
  const headline = HEADLINE[profile.headline];
  const requiredObligations = profile.obligations.filter((o) => o.required);
  const advisoryObligations = profile.obligations.filter((o) => !o.required);

  return (
    <div className="container max-w-4xl py-10 sm:py-14">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Uw compliance-rapport</h1>
        <p className="mt-2 text-muted-foreground">
          Op basis van uw antwoorden. Beslissingsondersteuning, geen juridisch advies.
        </p>
      </div>

      {/* Score + headline */}
      <Card className="mb-6">
        <CardContent className="flex flex-col items-center gap-6 py-8 sm:flex-row sm:gap-10">
          <ScoreRing score={profile.score} label="gereedheid" />
          <div className="text-center sm:text-left">
            <Badge variant={headline.variant}>{headline.label}</Badge>
            <p className="mt-3 text-lg">{headline.note}</p>
            <div className="mt-5">
              <Button asChild variant="outline">
                <a href={`/api/pdf/scan/${result.id}`} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" /> Download PDF-rapport
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prohibited banner */}
      {profile.headline === "prohibited" && (
        <div className="mb-8 flex items-start gap-3 rounded-xl border-2 border-red-300 bg-red-50 p-5 text-red-800">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0" />
          <div>
            <p className="font-semibold">Mogelijk verboden AI-praktijk</p>
            <p className="mt-1 text-sm">
              Staak het gebruik van het betreffende systeem en laat dit met spoed juridisch toetsen.
            </p>
          </div>
        </div>
      )}

      {/* Required obligations */}
      <h2 className="mb-4 text-xl font-semibold">Wat u moet doen ({requiredObligations.length})</h2>
      <div className="mb-8 space-y-3">
        {requiredObligations.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-muted-foreground">
              Geen verplichte acties gevonden op basis van uw antwoorden.
            </CardContent>
          </Card>
        ) : (
          requiredObligations.map((o) => (
            <Card key={o.code}>
              <CardContent className="flex items-start justify-between gap-4 py-5">
                <div className="flex items-start gap-3">
                  {o.status === "done" ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/40" />
                  )}
                  <div>
                    <p className="font-medium">
                      {o.title}{" "}
                      <span className="font-normal text-muted-foreground">({o.article})</span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{o.description}</p>
                  </div>
                </div>
                <StatusBadge status={o.status} />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Advisory */}
      {advisoryObligations.length > 0 && (
        <>
          <h2 className="mb-4 text-xl font-semibold">Aanbevolen ({advisoryObligations.length})</h2>
          <div className="mb-8 space-y-3">
            {advisoryObligations.map((o) => (
              <Card key={o.code}>
                <CardContent className="py-4">
                  <p className="font-medium">
                    {o.title}{" "}
                    <span className="font-normal text-muted-foreground">({o.article})</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{o.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Recommended plan */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Aanbevolen plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            Op basis van uw profiel adviseren wij het{" "}
            <span className="font-semibold">{TIER_LABEL[profile.recommendedTier]}</span>-plan.
          </p>
          {profile.advisoryUpsell && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {profile.advisoryUpsell.reason}
            </p>
          )}
          <Button asChild variant="outline" className="mt-2">
            <Link href="/pricing">Bekijk plannen</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Caveats */}
      {profile.caveats.length > 0 && (
        <Card className="mb-8 border-dashed">
          <CardContent className="space-y-1 py-5 text-sm text-muted-foreground">
            {profile.caveats.map((c, i) => (
              <p key={i}>• {c}</p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <Card className="overflow-hidden border-0 bg-navy-900 text-white">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <Sparkles className="h-8 w-8 text-brand-400" />
          <h2 className="text-2xl font-bold">Zet uw resultaat om in actie</h2>
          <p className="max-w-lg text-white/70">
            Maak een gratis account aan om uw profiel te bewaren, documenten te genereren en uw
            verplichtingen af te vinken.
          </p>
          <Button asChild size="lg">
            <Link href="/signup">
              Gratis account aanmaken <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
