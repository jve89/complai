"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

import type { Option, ScanAnswers } from "@/lib/compliance/questions";
import { EMPTY_ANSWERS, visibleSteps } from "@/lib/scan/wizard";
import { submitScan } from "@/app/scan/actions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const BOOL_OPTIONS: Option[] = [
  { value: "true", label: "Ja" },
  { value: "false", label: "Nee" },
];

export default function ScanWizard() {
  const router = useRouter();
  const [answers, setAnswers] = useState<ScanAnswers>({ ...EMPTY_ANSWERS });
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const steps = visibleSteps(answers);
  const total = steps.length;
  const step = steps[Math.min(index, total - 1)];
  const current = (answers as unknown as Record<string, unknown>)[step.field];
  const isLast = index >= total - 1;
  const progress = ((index + 1) / total) * 100;

  function update(field: string, value: unknown) {
    setAnswers((a) => ({ ...a, [field]: value }));
  }

  function selectSingle(value: string) {
    if (step.type === "boolean") update(step.field, value === "true");
    else update(step.field, value);
  }

  function toggleMulti(value: string) {
    const arr = Array.isArray(current) ? (current as string[]) : [];
    let next: string[];
    if (value === "none") next = arr.includes("none") ? [] : ["none"];
    else
      next = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr.filter((v) => v !== "none"), value];
    update(step.field, next);
  }

  function isSelected(value: string): boolean {
    if (step.type === "boolean") return current === (value === "true");
    if (step.type === "multi")
      return Array.isArray(current) && (current as string[]).includes(value);
    return current === value;
  }

  function isAnswered(): boolean {
    if (step.optional) return true;
    if (step.type === "multi")
      return Array.isArray(current) && current.length > 0;
    if (step.type === "boolean") return current === true || current === false;
    return current !== undefined && current !== "";
  }

  function next() {
    setError(null);
    if (!isAnswered()) {
      setError("Maak een keuze om verder te gaan.");
      return;
    }
    if (isLast) {
      startTransition(async () => {
        try {
          const { id } = await submitScan(answers);
          router.push(`/scan/results/${id}`);
        } catch {
          setError("Er ging iets mis bij het verwerken. Probeer het opnieuw.");
        }
      });
      return;
    }
    setIndex((i) => Math.min(total - 1, i + 1));
  }

  function back() {
    setError(null);
    setIndex((i) => Math.max(0, i - 1));
  }

  const options = step.type === "boolean" ? BOOL_OPTIONS : step.options ?? [];

  return (
    <div className="container max-w-2xl py-10 sm:py-14">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {step.section} · vraag {index + 1} van {total}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <div key={step.field} className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {step.title}
        </h1>
        {step.help && <p className="mt-2 text-muted-foreground">{step.help}</p>}

        <div
          className={cn(
            "mt-6 grid gap-3",
            step.type === "boolean" && "grid-cols-2"
          )}
        >
          {options.map((opt) => {
            const selected = isSelected(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  step.type === "multi"
                    ? toggleMulti(opt.value)
                    : selectSingle(opt.value)
                }
                className={cn(
                  "flex items-start justify-between gap-3 rounded-xl border-2 bg-card px-5 py-4 text-left text-sm font-medium transition-all hover:border-brand-400",
                  selected
                    ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                    : "border-border"
                )}
              >
                <span>
                  {opt.label}
                  {opt.help && (
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                      {opt.help}
                    </span>
                  )}
                </span>
                {selected && <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />}
              </button>
            );
          })}
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={index === 0 || isPending}>
            <ArrowLeft className="h-4 w-4" /> Vorige
          </Button>
          <Button onClick={next} size="lg" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Verwerken…
              </>
            ) : isLast ? (
              <>Bekijk resultaat</>
            ) : (
              <>
                Volgende <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
