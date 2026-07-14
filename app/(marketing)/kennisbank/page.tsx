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
    "De EU AI Act (Verordening (EU) 2024/1689) in gewone taal: hoe de risiconiveaus werken, welke deadlines er lopen, wie welke rol heeft en hoe hoog de boetes zijn.",
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
          Een beknopt overzicht van de AI Act (Verordening (EU) 2024/1689): hoe de risiconiveaus in elkaar zitten, welke datum wanneer ingaat, welke rol welke plichten meebrengt en hoe hoog de boetes kunnen oplopen.
        </p>
      </div>

      <KennisbankContent />

      <Card className="mt-16 overflow-hidden border-0 bg-navy-900 text-white">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <h2 className="text-2xl font-bold">Wat geldt er voor úw organisatie?</h2>
          <p className="max-w-lg text-white/70">
            Doorloop de gratis scan en u weet binnen enkele minuten welke risicocategorie en rol voor u gelden, welke deadlines daarbij horen en welke stappen u kunt zetten.
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
