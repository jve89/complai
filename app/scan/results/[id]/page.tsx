import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Download, Sparkles } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { scoreScan } from "@/lib/scan/scoring";
import type { ScanAnswers } from "@/lib/scan/questions";
import { STATUS_BADGE, STATUS_LABEL } from "@/lib/scan/status";
import { ScoreRing } from "@/components/score-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Uw scanresultaat" };

export default async function ScanResultsPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await prisma.scanResult.findUnique({
    where: { id: params.id },
  });
  if (!result) notFound();

  const report = scoreScan(result.answers as ScanAnswers);

  const levelLabel =
    report.level === "laag"
      ? "Laag risico"
      : report.level === "gemiddeld"
        ? "Gemiddeld risico"
        : "Hoog risico";

  return (
    <div className="container max-w-4xl py-10 sm:py-14">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Uw compliance-score
        </h1>
        <p className="mt-2 text-muted-foreground">
          Op basis van uw antwoorden. Een indicatie, geen juridisch advies.
        </p>
      </div>

      {/* Score + summary */}
      <Card className="mb-8">
        <CardContent className="flex flex-col items-center gap-6 py-8 sm:flex-row sm:gap-10">
          <ScoreRing score={report.score} />
          <div className="text-center sm:text-left">
            <Badge
              variant={
                report.level === "laag"
                  ? "success"
                  : report.level === "gemiddeld"
                    ? "warning"
                    : "danger"
              }
            >
              {levelLabel}
            </Badge>
            <p className="mt-3 text-lg">{report.summary}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline">
                <a
                  href={`/api/pdf/scan/${result.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" /> Download PDF-rapport
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-article status */}
      <h2 className="mb-4 text-xl font-semibold">Status per AI Act-artikel</h2>
      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        {report.articles.map((article) => (
          <Card key={article.article}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">
                <span className="text-muted-foreground">{article.article}</span>{" "}
                · {article.title}
              </CardTitle>
              <Badge variant={STATUS_BADGE[article.status]}>
                {STATUS_LABEL[article.status]}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{article.summary}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Priority actions */}
      <h2 className="mb-4 text-xl font-semibold">
        Uw belangrijkste vervolgstappen
      </h2>
      <div className="mb-10 space-y-3">
        {report.priorityActions.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-muted-foreground">
              U heeft de belangrijkste verplichtingen op orde. Houd uw compliance
              actueel met het governance-dashboard.
            </CardContent>
          </Card>
        ) : (
          report.priorityActions.map((action, i) => (
            <Card key={i}>
              <CardContent className="flex gap-4 py-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">
                    {action.title}{" "}
                    <span className="font-normal text-muted-foreground">
                      ({action.article})
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* CTA */}
      <Card className="overflow-hidden border-0 bg-navy-900 text-white">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <Sparkles className="h-8 w-8 text-brand-400" />
          <h2 className="text-2xl font-bold">
            Zet uw resultaat om in actie
          </h2>
          <p className="max-w-lg text-white/70">
            Maak een gratis account aan om uw resultaat te bewaren, uw
            AI-register op te bouwen en direct met de vervolgstappen aan de slag
            te gaan.
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
