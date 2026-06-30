import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  Download,
  Sparkles,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import type { ComplianceProfile, EntityRole, ObligationItem } from "@/lib/compliance/types";
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

const ROLE_NL: Record<EntityRole, string> = {
  provider: "Aanbieder",
  deployer: "Gebruiksverantwoordelijke",
  importer: "Importeur",
  distributor: "Distributeur",
  product_manufacturer: "Productfabrikant",
  authorised_representative: "Gemachtigde",
};

const TIER_REASON: Record<string, string> = {
  prohibited: "Een toepassing lijkt onder een verboden praktijk te vallen (Art. 5).",
  high: "Uw AI valt onder een hoog-risico categorie — een Annex III-gebied of een gereguleerd product (Art. 6).",
  high_notify: "Annex III-gebied, maar u beroept zich op de Art. 6(3)-uitzondering: documentatie- en registratieplicht in plaats van de volledige hoog-risico set.",
  limited: "Een transparantieverplichting onder Art. 50 is van toepassing (bv. chatbot of AI-gegenereerde content).",
  minimal: "Geen hoog-risico- of transparantie-trigger gevonden — vooral AI-geletterdheid (Art. 4) geldt.",
  out_of_scope: "U valt (grotendeels) buiten de territoriale reikwijdte van de AI Act (Art. 2).",
  excluded: "Uw gebruik lijkt te zijn uitgesloten (bv. militair, nationale veiligheid of onderzoek).",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "compliant" || status === "done")
    return <Badge variant="success">Op orde</Badge>;
  if (status === "in_progress") return <Badge variant="warning">Bezig</Badge>;
  return <Badge variant="secondary">Te doen</Badge>;
}

function formatNlDate(iso: string): string {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const DAY = 1000 * 60 * 60 * 24;

/** Group required obligations by their application date (Art. 113 timeline). */
function bucketObligations(obligations: ObligationItem[]) {
  const now = Date.now();
  const groups = new Map<
    string,
    { order: number; future: boolean; daysUntil: number; items: ObligationItem[] }
  >();
  for (const o of obligations) {
    const future = o.deadline ? new Date(o.deadline).getTime() > now : false;
    const label = future ? `Vanaf ${formatNlDate(o.deadline!)}` : "Nu van kracht";
    const order = future ? new Date(o.deadline!).getTime() : -1;
    const daysUntil = o.deadline ? Math.round((new Date(o.deadline).getTime() - now) / DAY) : 0;
    if (!groups.has(label)) groups.set(label, { order, future, daysUntil, items: [] });
    groups.get(label)!.items.push(o);
  }
  return Array.from(groups.entries()).sort((a, b) => a[1].order - b[1].order);
}

function ObligationRow({ o }: { o: ObligationItem }) {
  return (
    <Card>
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
  );
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

  // Score math (the "why this number" the competitor doesn't show).
  const total = requiredObligations.length;
  const done = requiredObligations.filter((o) => o.status === "done").length;
  const prog = requiredObligations.filter((o) => o.status === "in_progress").length;
  const open = total - done - prog;

  const buckets = bucketObligations(requiredObligations);
  const hasFuture = buckets.some(([, g]) => g.future);

  // "Why this result" — plain-language drivers from the classification.
  const drivers: string[] = [];
  if (profile.entityRoles.length)
    drivers.push(`Uw rol: ${profile.entityRoles.map((r) => ROLE_NL[r] ?? r).join(", ")}.`);
  const seenTier = new Set<string>();
  for (const t of profile.riskTiers) {
    if (TIER_REASON[t] && !seenTier.has(t)) {
      drivers.push(TIER_REASON[t]);
      seenTier.add(t);
    }
  }
  if (profile.systemFlags.gpaiModelProvider)
    drivers.push("U levert een AI-model voor algemene doeleinden (GPAI, Hoofdstuk V).");
  if (profile.systemFlags.profiling)
    drivers.push("Uw systeem profileert personen — dit versterkt de hoog-risico classificatie (Art. 6(3)).");

  return (
    <div className="container max-w-4xl py-10 sm:py-14">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Uw compliance-rapport</h1>
        <p className="mt-2 text-muted-foreground">
          Op basis van uw antwoorden. Beslissingsondersteuning, geen juridisch advies.
        </p>
      </div>

      {/* Score + headline */}
      <Card className="mb-4">
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

      {/* Score breakdown — show the math */}
      <div className="mb-4 rounded-xl border bg-secondary/40 px-5 py-4 text-sm text-muted-foreground">
        {profile.headline === "prohibited" ? (
          <p>
            Een mogelijk <strong className="text-foreground">verboden praktijk</strong> weegt zwaar:
            uw gereedheidsscore is gemaximeerd op 20 totdat dit is opgelost.
          </p>
        ) : profile.headline === "out_of_scope" || profile.headline === "excluded" ? (
          <p>
            U heeft op dit moment geen verplichtingen onder de AI Act, dus uw score staat op{" "}
            <strong className="text-foreground">100</strong>. Houd dit actueel als uw AI-gebruik
            verandert.
          </p>
        ) : total === 0 ? (
          <p>
            Er zijn geen verplichte acties gevonden — uw score weerspiegelt vooral de basis
            (AI-geletterdheid).
          </p>
        ) : (
          <p>
            Uw score van <strong className="text-foreground">{profile.score}</strong> is opgebouwd
            uit een basisscore plus uw voortgang op{" "}
            <strong className="text-foreground">{total}</strong> verplichte{" "}
            {total === 1 ? "actie" : "acties"}:{" "}
            <span className="text-brand-700">{done} op orde</span>
            {prog > 0 && <>, <span className="text-amber-700">{prog} mee bezig</span></>},{" "}
            {open} nog te doen. Eerlijke readiness-antwoorden bewegen dit getal.
          </p>
        )}
      </div>

      {/* Why this result — expander */}
      {drivers.length > 0 && (
        <details className="group mb-6 rounded-xl border bg-card [&::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-6 py-4 font-medium">
            Waarom deze classificatie?
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-3 border-t px-6 py-5 text-sm">
            <ul className="space-y-2">
              {drivers.map((d, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
            {profile.applicableArticles.length > 0 && (
              <div className="pt-1">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Toepasselijke artikelen
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.applicableArticles.map((a) => (
                    <span
                      key={a}
                      className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </details>
      )}

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

      {/* Required obligations, grouped by deadline */}
      <h2 className="mb-4 text-xl font-semibold">Wat u moet doen ({requiredObligations.length})</h2>
      {requiredObligations.length === 0 ? (
        <Card className="mb-8">
          <CardContent className="py-6 text-muted-foreground">
            Geen verplichte acties gevonden op basis van uw antwoorden.
          </CardContent>
        </Card>
      ) : (
        <div className="mb-8 space-y-6">
          {buckets.map(([label, group]) => (
            <div key={label}>
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">{label}</h3>
                {group.future && group.daysUntil <= 90 && (
                  <Badge variant="warning">
                    nog {group.daysUntil} {group.daysUntil === 1 ? "dag" : "dagen"}
                  </Badge>
                )}
              </div>
              <div className="space-y-3">
                {group.items.map((o) => (
                  <ObligationRow key={o.code} o={o} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Omnibus dual-date note */}
      {hasFuture && (
        <p className="mb-8 rounded-lg border border-dashed px-4 py-3 text-xs text-muted-foreground">
          De grote verplichtingen voor hoog-risico AI gelden vanaf 2 augustus 2026 (Annex III) en 2
          augustus 2027 (Annex I als product). Een Digital Omnibus-voorstel kan deze data uitstellen;
          tot het is aangenomen blijven de huidige data leidend.
        </p>
      )}

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
            <span className="font-semibold">{TIER_LABEL[profile.recommendedTier]}</span>-plan
            {profile.recommendedTier !== "gratis" && " (eerste maand gratis)"}.
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
