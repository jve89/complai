import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";

import { dismissOnboarding } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  text: string;
  done: boolean;
  optional?: boolean;
  cta?: { label: string; href: string };
}

/**
 * "Aan de slag" — the three steps every klant doorloopt (account, risicoscan,
 * pakket), in welke volgorde dan ook. Rendered until everything is done or the
 * user hides it; both are persisted, so it disappears forever after that.
 */
export function OnboardingChecklist({
  scanDone,
  planDone,
  planLabel,
}: {
  scanDone: boolean;
  planDone: boolean;
  planLabel: string;
}) {
  const steps: Step[] = [
    {
      title: "Account aangemaakt",
      text: "Uw eigen omgeving staat klaar.",
      done: true,
    },
    {
      title: "Doe de risicoscan",
      text: "Ontdek in vijf minuten welke AI Act-verplichtingen voor uw organisatie gelden.",
      done: scanDone,
      cta: { label: "Start de scan", href: "/scan" },
    },
    {
      title: planDone ? `Pakket gekozen: ${planLabel}` : "Kies uw pakket",
      text: planDone
        ? "Uw documenten zijn ontgrendeld."
        : "Ontgrendel de documenten die bij uw verplichtingen horen.",
      done: planDone,
      optional: true,
      cta: { label: "Bekijk pakketten", href: "/pricing" },
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <Card className="mb-8 border-brand-100 bg-brand-50/50">
      <CardContent className="py-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold">Aan de slag</h2>
            <p className="text-sm text-muted-foreground">
              Drie stappen, u kiest de volgorde — {doneCount} van {steps.length} afgerond.
            </p>
          </div>
          <form action={dismissOnboarding}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              Niet meer tonen
            </Button>
          </form>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className={cn(
                "flex flex-col gap-2 rounded-lg border bg-card p-4",
                step.done && "border-brand-200"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                {step.done ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                )}
                {step.optional && !step.done && (
                  <Badge variant="secondary" className="font-normal">
                    Optioneel
                  </Badge>
                )}
              </div>
              <div className="flex-1">
                <p className={cn("font-medium", step.done && "text-muted-foreground line-through decoration-brand-300")}>
                  {step.title}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{step.text}</p>
              </div>
              {!step.done && step.cta && (
                <Button asChild size="sm" className="mt-1 w-fit">
                  <Link href={step.cta.href}>
                    {step.cta.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
