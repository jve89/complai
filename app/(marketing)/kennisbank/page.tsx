import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { KennisbankContent } from "@/components/kennisbank-content";

export const metadata: Metadata = {
  title: "Kennisbank — de EU AI-wet in begrijpelijk Nederlands",
  description:
    "Risiconiveaus, deadlines, rollen en boetes van de EU AI Act (Verordening (EU) 2024/1689) — helder uitgelegd.",
  alternates: { canonical: "/kennisbank" },
};

export default function KennisbankPage() {
  return (
    <div className="container max-w-5xl py-16 sm:py-20">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <Badge variant="secondary" className="bg-accent text-accent-foreground">
          Kennisbank
        </Badge>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          De EU AI-wet in begrijpelijk Nederlands
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          De AI Act (Verordening (EU) 2024/1689) in het kort: welke risiconiveaus
          er zijn, wanneer wat ingaat, wie wat moet doen en wat de boetes zijn.
        </p>
      </div>

      <KennisbankContent />

      <Card className="mt-16 overflow-hidden border-0 bg-navy-900 text-white">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <h2 className="text-2xl font-bold">Wat geldt er voor úw organisatie?</h2>
          <p className="max-w-lg text-white/70">
            Doe de gratis scan en ontdek binnen vijf minuten uw risicocategorie,
            rol en deadlines — met een stappenplan op maat.
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
