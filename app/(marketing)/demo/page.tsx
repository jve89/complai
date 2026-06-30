import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Circle,
  Database,
  GraduationCap,
  ListChecks,
} from "lucide-react";

import { buildProfile } from "@/lib/compliance/profile";
import { evidenceFromAnswers } from "@/lib/compliance/evidence-from-answers";
import type { ScanAnswers } from "@/lib/compliance/questions";
import { ScoreRing } from "@/components/score-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Demo — bekijk het dashboard",
  description:
    "Een interactieve demo met voorbeelddata: zie hoe uw AI Act-dashboard, score en verplichtingen eruitzien.",
};

// Representative demo case: a mid-size HR team deploying AI candidate screening
// (Annex III, hoog risico) with some readiness already in place.
const DEMO_ANSWERS = {
  roles: ["deployer"],
  modifications: ["none"],
  annexI_B: ["none"],
  annexI_A: [],
  annexIII_areas: ["4"],
  annexIII_subareas: [],
  scopeCriteria: ["established_eu"],
  gpaiSystemic: [],
  exclusions: [],
  prohibited: [],
  transparency: ["chatbot"],
  size: "51-250",
  sector: "hr",
  companyName: "Demo Recruitment B.V.",
  readiness: { training: "ja", policy: "deels", register: "ja", oversight: "deels", riskAssessment: "nee" },
} as ScanAnswers;

const MODULES = [
  "Overzicht",
  "AI-register",
  "Schaduw-AI",
  "Documenten",
  "E-learning",
  "Governance",
  "Kennisbank",
];

const HEADLINE_LABEL: Record<string, { label: string; variant: "success" | "info" | "warning" | "danger" | "secondary" }> = {
  prohibited: { label: "Verboden praktijk", variant: "danger" },
  high_risk: { label: "Hoog risico", variant: "warning" },
  limited_risk: { label: "Beperkt risico", variant: "info" },
  out_of_scope: { label: "Buiten de reikwijdte", variant: "secondary" },
  excluded: { label: "Uitgesloten", variant: "secondary" },
  minimal: { label: "Minimaal risico", variant: "success" },
};

function statusBadge(status: string) {
  if (status === "done") return <Badge variant="success">Op orde</Badge>;
  if (status === "in_progress") return <Badge variant="warning">Bezig</Badge>;
  return <Badge variant="secondary">Te doen</Badge>;
}

export default function DemoPage() {
  const profile = buildProfile(DEMO_ANSWERS, evidenceFromAnswers(DEMO_ANSWERS));
  const required = profile.obligations.filter((o) => o.required);
  const open = required.filter((o) => o.status !== "done");
  const headline = HEADLINE_LABEL[profile.headline];

  const stats = [
    { label: "AI-systemen", value: 3, icon: Database },
    { label: "Getrainde medewerkers", value: "8/12", icon: GraduationCap },
    { label: "Open verplichtingen", value: open.length, icon: ListChecks },
    { label: "Aankomende deadlines", value: required.filter((o) => o.deadline).length, icon: CalendarClock },
  ];

  return (
    <div className="container max-w-5xl py-12 sm:py-16">
      {/* Demo banner */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-xl border-2 border-brand-200 bg-brand-50 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold text-brand-900">U bekijkt een demo met voorbeelddata</p>
          <p className="text-sm text-brand-800/80">
            Dit is het dashboard van een fictief bedrijf. Doe de gratis scan om uw
            eigen omgeving te vullen.
          </p>
        </div>
        <Button asChild>
          <Link href="/scan">
            Start uw eigen scan <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Module tabs preview */}
      <div className="mb-8 flex flex-wrap gap-2">
        {MODULES.map((m, i) => (
          <span
            key={m}
            className={
              i === 0
                ? "rounded-lg bg-navy-900 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-lg border bg-card px-3 py-1.5 text-sm text-muted-foreground"
            }
          >
            {m}
          </span>
        ))}
      </div>

      <div className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight">Welkom bij {DEMO_ANSWERS.companyName}</h1>
        <p className="text-muted-foreground">Uw AI Act-status op basis van de scan.</p>
      </div>

      {/* Score + stats */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Gereedheid</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <ScoreRing score={profile.score} label="gereedheid" />
            <Badge variant={headline.variant}>{headline.label}</Badge>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex h-full flex-col justify-between gap-4 py-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-3xl font-bold tabular-nums">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Obligations */}
      <h2 className="mb-4 mt-10 text-lg font-semibold">Uw verplichtingen</h2>
      <div className="grid gap-3">
        {required.map((o) => (
          <Card key={o.code}>
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3">
                {o.status === "done" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                )}
                <div>
                  <p className="font-medium">{o.title}</p>
                  <p className="text-xs text-muted-foreground">{o.article}</p>
                </div>
              </div>
              {statusBadge(o.status)}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <Card className="mt-10 overflow-hidden border-0 bg-navy-900 text-white">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <h2 className="text-2xl font-bold">Klaar om uw eigen omgeving te bouwen?</h2>
          <p className="max-w-lg text-white/70">
            De scan is gratis en duurt vijf minuten. Daarna staat dit dashboard
            klaar met úw verplichtingen, documenten en deadlines.
          </p>
          <Button asChild size="lg">
            <Link href="/scan">
              Start de gratis scan <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
