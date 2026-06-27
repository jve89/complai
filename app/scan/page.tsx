"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

import { QUESTIONS, type ScanAnswers } from "@/lib/scan/questions";
import { submitScan } from "@/app/scan/actions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const BOOLEAN_OPTIONS = [
  { value: "true", label: "Ja" },
  { value: "false", label: "Nee" },
];

export default function ScanWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ScanAnswers>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = QUESTIONS.length;
  const question = QUESTIONS[step];
  const progress = ((step + 1) / total) * 100;
  const isLast = step === total - 1;

  const current = answers[question.id];

  function isAnswered(): boolean {
    if (question.type === "multi") {
      return Array.isArray(current) && current.length > 0;
    }
    return current !== undefined && current !== "";
  }

  function selectSingle(value: string) {
    setAnswers((a) => ({
      ...a,
      [question.id]: question.type === "boolean" ? value === "true" : value,
    }));
  }

  function toggleMulti(value: string) {
    setAnswers((a) => {
      const existing = Array.isArray(a[question.id])
        ? (a[question.id] as string[])
        : [];
      // "geen" is exclusive
      let next: string[];
      if (value === "geen") {
        next = existing.includes("geen") ? [] : ["geen"];
      } else {
        next = existing.includes(value)
          ? existing.filter((v) => v !== value)
          : [...existing.filter((v) => v !== "geen"), value];
      }
      return { ...a, [question.id]: next };
    });
  }

  function isSelected(value: string): boolean {
    if (question.type === "boolean") {
      return current === (value === "true");
    }
    if (question.type === "multi") {
      return Array.isArray(current) && current.includes(value);
    }
    return current === value;
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
    setStep((s) => Math.min(total - 1, s + 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  const options =
    question.type === "boolean" ? BOOLEAN_OPTIONS : question.options ?? [];

  return (
    <div className="container max-w-2xl py-10 sm:py-14">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Vraag {step + 1} van {total}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Question */}
      <div key={question.id} className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {question.title}
        </h1>
        {question.help && (
          <p className="mt-2 text-muted-foreground">{question.help}</p>
        )}

        <div
          className={cn(
            "mt-6 grid gap-3",
            question.type === "boolean" && "grid-cols-2"
          )}
        >
          {options.map((opt) => {
            const selected = isSelected(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  question.type === "multi"
                    ? toggleMulti(opt.value)
                    : selectSingle(opt.value)
                }
                className={cn(
                  "flex items-center justify-between rounded-xl border-2 bg-card px-5 py-4 text-left text-sm font-medium transition-all hover:border-brand-400",
                  selected
                    ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                    : "border-border"
                )}
              >
                <span>{opt.label}</span>
                {selected && <Check className="h-5 w-5 text-brand-600" />}
              </button>
            );
          })}
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={back}
            disabled={step === 0 || isPending}
          >
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
