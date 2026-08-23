"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2, Pencil } from "lucide-react";

import type { Option, ScanAnswers } from "@/lib/compliance/questions";
import {
  EMPTY_ANSWERS,
  TRI_OPTIONS,
  formatAnswer,
  scanProgress,
  visibleSteps,
  type WizardStep,
} from "@/lib/scan/wizard";
import { submitScan } from "@/app/scan/actions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const BOOL_OPTIONS: Option[] = [
  { value: "true", label: "Ja" },
  { value: "false", label: "Nee" },
];

/** Per-tab persistence of in-progress scan answers, so a refresh doesn't wipe
 * the primary conversion path. Cleared on submit. */
const SCAN_STORAGE_KEY = "complai-scan-progress";

/** Generic "is this step answered?" — used both for the active step and, on the
 * review screen, to route an edit back through any newly-revealed questions. */
function stepAnswered(s: WizardStep, ans: ScanAnswers): boolean {
  if (s.optional || s.type === "review") return true;
  const cur = s.readinessKey
    ? (ans.readiness ?? {})[s.readinessKey]
    : s.qualifierKey
      ? (ans.prohibitedQualifiers ?? {})[s.qualifierKey]
      : (ans as unknown as Record<string, unknown>)[s.field];
  if (s.type === "multi") return Array.isArray(cur) && cur.length > 0;
  if (s.type === "boolean") return cur === true || cur === false;
  return cur !== undefined && cur !== "";
}

/** Fill suggested fields only where the user hasn't chosen anything yet. */
function mergeEmpty(a: ScanAnswers, sugg: Partial<ScanAnswers>): ScanAnswers {
  const out = { ...a } as Record<string, unknown>;
  for (const [k, v] of Object.entries(sugg)) {
    const cur = out[k];
    if (cur === undefined || (Array.isArray(cur) && cur.length === 0)) out[k] = v;
  }
  return out as unknown as ScanAnswers;
}

export function ScanWizard({ initialAnswers }: { initialAnswers?: ScanAnswers }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<ScanAnswers>({
    ...EMPTY_ANSWERS,
    ...(initialAnswers ?? {}),
  });
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [returnToReview, setReturnToReview] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Restore in-progress answers on mount (survives a browser refresh). SSR-safe:
  // the initial render uses initialAnswers, then this rehydrates the real progress.
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(SCAN_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { answers?: ScanAnswers; index?: number };
        if (saved.answers) setAnswers((a) => ({ ...a, ...saved.answers }));
        if (typeof saved.index === "number") setIndex(saved.index);
      }
    } catch {
      /* ignore corrupt / unavailable storage */
    }
    setRestored(true);
  }, []);
  // Persist on change — gated on `restored` so we never overwrite saved progress
  // with the empty initial state before rehydration runs.
  useEffect(() => {
    if (!restored) return;
    try {
      window.sessionStorage.setItem(SCAN_STORAGE_KEY, JSON.stringify({ answers, index }));
    } catch {
      /* ignore */
    }
  }, [answers, index, restored]);

  const steps = visibleSteps(answers);
  const total = steps.length;
  const step = steps[Math.min(index, total - 1)];
  const isLast = index >= total - 1;
  const current = step.readinessKey
    ? (answers.readiness ?? {})[step.readinessKey]
    : step.qualifierKey
      ? (answers.prohibitedQualifiers ?? {})[step.qualifierKey]
      : (answers as unknown as Record<string, unknown>)[step.field];
  const progress = isLast ? 100 : scanProgress(step);

  function update(field: string, value: unknown) {
    setAnswers((a) => ({ ...a, [field]: value }));
  }

  function selectSingle(value: string) {
    if (step.type === "boolean" && step.qualifierKey) {
      const key = step.qualifierKey;
      setAnswers((a) => ({
        ...a,
        prohibitedQualifiers: { ...(a.prohibitedQualifiers ?? {}), [key]: value === "true" },
      }));
    } else if (step.type === "boolean") update(step.field, value === "true");
    else if (step.type === "tri" && step.readinessKey) {
      const key = step.readinessKey;
      setAnswers((a) => ({ ...a, readiness: { ...(a.readiness ?? {}), [key]: value } }));
    } else update(step.field, value);
  }

  function toggleMulti(value: string) {
    setAnswers((a) => {
      const cur = (a as unknown as Record<string, unknown>)[step.field];
      const arr = Array.isArray(cur) ? (cur as string[]) : [];
      let nextArr: string[];
      if (value === "none" || value === "geen")
        nextArr = arr.includes(value) ? [] : [value];
      else
        nextArr = arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr.filter((v) => v !== "none" && v !== "geen"), value];
      return { ...a, [step.field]: nextArr };
    });
  }

  function isSelected(value: string): boolean {
    if (step.type === "boolean") return current === (value === "true");
    if (step.type === "multi")
      return Array.isArray(current) && (current as string[]).includes(value);
    return current === value;
  }

  function isAnswered(): boolean {
    if (step.optional || step.type === "review") return true;
    if (step.type === "multi") return Array.isArray(current) && current.length > 0;
    if (step.type === "boolean") return current === true || current === false;
    return current !== undefined && current !== "";
  }

  const flatOptions =
    step.type === "boolean"
      ? BOOL_OPTIONS
      : step.type === "tri"
        ? TRI_OPTIONS
        : step.options ?? [];

  function gotoStep(target: number) {
    setError(null);
    setReturnToReview(true);
    setIndex(target);
  }

  function next() {
    setError(null);
    if (!isAnswered()) {
      setError("Maak een keuze om verder te gaan.");
      return;
    }
    if (step.onAdvance) {
      const sugg = step.onAdvance(answers);
      setAnswers((a) => mergeEmpty(a, sugg));
    }
    if (isLast) {
      startTransition(async () => {
        try {
          const { id } = await submitScan(answers);
          // Scan submitted — clear the saved progress so a completed scan doesn't
          // rehydrate on a later visit.
          try {
            window.sessionStorage.removeItem(SCAN_STORAGE_KEY);
          } catch {
            /* ignore */
          }
          router.push(`/scan/results/${id}`);
        } catch {
          setError("Er ging iets mis bij het verwerken. Probeer het opnieuw.");
        }
      });
      return;
    }
    // When editing from the review screen, jump forward only through questions
    // that still need an answer (an edit can reveal new branches), then land
    // back on the review step.
    if (returnToReview) {
      const nextUn = steps.findIndex(
        (s, i) => i > index && s.type !== "review" && !stepAnswered(s, answers)
      );
      if (nextUn === -1) {
        setReturnToReview(false);
        setIndex(total - 1);
      } else {
        setIndex(nextUn);
      }
      return;
    }
    setIndex((i) => Math.min(total - 1, i + 1));
  }

  function back() {
    setError(null);
    setReturnToReview(false);
    setIndex((i) => Math.max(0, i - 1));
  }

  function optionButton(opt: Option) {
    const selected = isSelected(opt.value);
    return (
      <button
        key={opt.value}
        type="button"
        aria-pressed={selected}
        onClick={() =>
          step.type === "multi" ? toggleMulti(opt.value) : selectSingle(opt.value)
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
  }

  function renderBody() {
    if (step.type === "review") {
      const items = steps.filter((s) => s.type !== "review");
      return (
        <div className="mt-6 divide-y divide-border overflow-hidden rounded-xl border bg-card">
          {items.map((s) => (
            <div
              key={`${s.section}-${s.field}-${s.readinessKey ?? ""}-${s.qualifierKey ?? ""}`}
              className="flex items-start justify-between gap-4 px-5 py-3.5"
            >
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{s.section}</p>
                <p className="text-sm font-medium">{s.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatAnswer(s, answers)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => gotoStep(steps.indexOf(s))}
                className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
              >
                <Pencil className="h-3.5 w-3.5" /> Aanpassen
              </button>
            </div>
          ))}
        </div>
      );
    }

    if (step.type === "text") {
      return (
        <div className="mt-6">
          <input
            type="text"
            aria-labelledby="scan-step-title"
            value={(current as string) ?? ""}
            onChange={(e) => update(step.field, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") next();
            }}
            placeholder={step.placeholder}
            autoFocus
            className="w-full rounded-xl border-2 border-border bg-card px-5 py-4 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
      );
    }

    if (step.groups) {
      return (
        <div className="mt-6 space-y-6">
          {step.groups.map((g) => (
            <div key={g.label}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {g.label}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {g.options.map((opt) => optionButton(opt))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={cn("mt-6 grid gap-3", step.type === "boolean" && "grid-cols-2")}>
        {flatOptions.map((opt) => optionButton(opt))}
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10 sm:py-14">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>{step.section}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <div
        key={`${step.section}-${step.field}-${step.readinessKey ?? ""}-${step.qualifierKey ?? ""}`}
        className="animate-fade-up"
      >
        <h1 id="scan-step-title" className="text-2xl font-bold tracking-tight sm:text-3xl">{step.title}</h1>
        {step.help && <p className="mt-2 text-muted-foreground">{step.help}</p>}

        {renderBody()}

        <div aria-live="polite">
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        </div>

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
            ) : returnToReview ? (
              <>Terug naar controle</>
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
