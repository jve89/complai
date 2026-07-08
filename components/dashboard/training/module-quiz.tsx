"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Check, Loader2, RotateCcw, Trophy, X, XCircle } from "lucide-react";

import { completeModule, type CompleteResult } from "@/app/dashboard/training/actions";
import { askCount, isCorrect, type TrainingModule } from "@/lib/training/content";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Phase = "intro" | "lesson" | "quiz" | "result";

/** Fisher–Yates shuffle (returns a new array). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** One presented question: `q` indexes the module bank; `opts` is the shuffled
 *  order of that question's option indices. */
type Planned = { q: number; opts: number[] };

function buildPlan(module: TrainingModule): Planned[] {
  const n = askCount(module);
  const drawn = shuffle(module.quiz.map((_, i) => i)).slice(0, n);
  return drawn.map((q) => ({
    q,
    opts: shuffle(module.quiz[q].options.map((_, i) => i)),
  }));
}

export function ModuleQuiz({
  module,
  trigger,
}: {
  module: TrainingModule;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [lessonPage, setLessonPage] = useState(0);
  const [plan, setPlan] = useState<Planned[]>([]);
  const [current, setCurrent] = useState(0);
  const [selections, setSelections] = useState<Record<number, number[]>>({});
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<CompleteResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = askCount(module);
  const lessons = module.lessons ?? [];
  const lessonCount = lessons.length;

  const planned = plan[current];
  const question = planned ? module.quiz[planned.q] : undefined;
  const isMulti = Boolean(question?.answers);
  const selected = planned ? selections[planned.q] ?? [] : [];

  function reset() {
    setPhase("intro");
    setLessonPage(0);
    setPlan([]);
    setCurrent(0);
    setSelections({});
    setChecked(false);
    setResult(null);
  }

  function startQuiz() {
    setPlan(buildPlan(module));
    setCurrent(0);
    setSelections({});
    setChecked(false);
    setPhase("quiz");
  }

  function choose(optIdx: number) {
    if (checked || !planned) return;
    setSelections((s) => {
      const cur = s[planned.q] ?? [];
      if (isMulti) {
        const next = cur.includes(optIdx)
          ? cur.filter((o) => o !== optIdx)
          : [...cur, optIdx];
        return { ...s, [planned.q]: next };
      }
      return { ...s, [planned.q]: [optIdx] };
    });
  }

  function advance() {
    if (current < plan.length - 1) {
      setCurrent((c) => c + 1);
      setChecked(false);
      return;
    }
    // Last question — submit the whole attempt for server-side scoring.
    const attempts = plan.map((p) => ({ q: p.q, selected: selections[p.q] ?? [] }));
    startTransition(async () => {
      const res = await completeModule(module.id, attempts);
      setResult(res);
      setPhase("result");
      if (res.ok && res.passed) router.refresh();
    });
  }

  const correctNow = question ? isCorrect(question, selected) : false;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{module.title}</DialogTitle>
          <DialogDescription>
            {phase === "quiz"
              ? `Vraag ${current + 1} van ${plan.length}`
              : phase === "lesson"
                ? `Onderdeel ${lessonPage + 1} van ${lessonCount}`
                : `${module.minutes} min · ${total} vragen`}
          </DialogDescription>
        </DialogHeader>

        {phase === "intro" && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-4">
              <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <p className="text-sm text-muted-foreground">{module.intro}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {lessonCount
                ? `Eerst ${lessonCount} korte leesonderdelen, daarna ${total} vragen. U slaagt met 80% goed.`
                : `Beantwoord ${total} vragen. U slaagt met 80% goed.`}
            </p>
            <Button
              className="w-full"
              onClick={() => (lessonCount ? setPhase("lesson") : startQuiz())}
            >
              {lessonCount ? "Start module" : "Start quiz"}
            </Button>
          </div>
        )}

        {phase === "lesson" && lessonCount > 0 && (
          <div className="space-y-5">
            <Progress value={((lessonPage + 1) / lessonCount) * 100} />
            <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
              <p className="font-semibold">{lessons[lessonPage].heading}</p>
              {lessons[lessonPage].paragraphs.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
            {lessonPage === lessonCount - 1 && (
              <div className="rounded-lg bg-secondary/50 p-4 text-center">
                <p className="text-sm font-medium">Bent u klaar voor de quiz?</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {total} vragen · 80% goed om te slagen.
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() =>
                  lessonPage > 0 ? setLessonPage((p) => p - 1) : setPhase("intro")
                }
              >
                Vorige
              </Button>
              {lessonPage === lessonCount - 1 ? (
                <Button className="flex-1" onClick={startQuiz}>
                  Start de quiz
                </Button>
              ) : (
                <Button className="flex-1" onClick={() => setLessonPage((p) => p + 1)}>
                  Volgende
                </Button>
              )}
            </div>
          </div>
        )}

        {phase === "quiz" && planned && question && (
          <div className="space-y-4">
            <Progress value={((current + 1) / plan.length) * 100} />
            {question.scenario && (
              <div className="rounded-lg border-l-2 border-brand-400 bg-secondary/40 p-3 text-sm text-muted-foreground">
                {question.scenario}
              </div>
            )}
            <div>
              <p className="font-medium">{question.question}</p>
              {isMulti && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Meerdere antwoorden mogelijk — selecteer alles wat klopt.
                </p>
              )}
            </div>
            <div className="space-y-2">
              {planned.opts.map((oi) => {
                const isSel = selected.includes(oi);
                const isKey = (question.answers ?? [question.answer]).includes(oi);
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => choose(oi)}
                    disabled={checked}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border-2 px-4 py-3 text-left text-sm transition-all",
                      !checked && "hover:border-brand-400",
                      checked && isKey && "border-emerald-500 bg-emerald-50",
                      checked && isSel && !isKey && "border-red-400 bg-red-50",
                      !checked && isSel && "border-brand-500 bg-brand-50",
                      !checked && !isSel && "border-border",
                      checked && !isKey && !isSel && "border-border opacity-70"
                    )}
                  >
                    <span>{question.options[oi]}</span>
                    {checked && isKey && <Check className="h-4 w-4 text-emerald-600" />}
                    {checked && isSel && !isKey && <X className="h-4 w-4 text-red-500" />}
                    {!checked && isSel && <Check className="h-4 w-4 text-brand-600" />}
                  </button>
                );
              })}
            </div>

            {checked && (
              <div
                className={cn(
                  "rounded-lg p-3 text-sm",
                  correctNow ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"
                )}
              >
                <p className="font-medium">{correctNow ? "Goed!" : "Niet helemaal."}</p>
                {question.explanation && (
                  <p className="mt-1 text-muted-foreground">{question.explanation}</p>
                )}
              </div>
            )}

            {!checked ? (
              <Button
                className="w-full"
                onClick={() => setChecked(true)}
                disabled={selected.length === 0}
              >
                Controleer
              </Button>
            ) : (
              <Button className="w-full" onClick={advance} disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : current < plan.length - 1 ? (
                  "Volgende vraag"
                ) : (
                  "Afronden"
                )}
              </Button>
            )}
          </div>
        )}

        {phase === "result" && result?.ok && (
          <div className="space-y-5 text-center">
            {result.passed ? (
              <>
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Trophy className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Module afgerond!</p>
                  <p className="text-sm text-muted-foreground">
                    {result.score}/{result.total} goed.{" "}
                    {result.allDone
                      ? "U heeft het volledige leerpad afgerond — uw certificaat staat klaar."
                      : "Goed bezig!"}
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setOpen(false);
                    reset();
                  }}
                >
                  Sluiten
                </Button>
              </>
            ) : (
              <>
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <XCircle className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Net niet</p>
                  <p className="text-sm text-muted-foreground">
                    {result.score}/{result.total} goed. U heeft 80% nodig om te
                    slagen. Bij een nieuwe poging krijgt u andere vragen.
                  </p>
                </div>
                <Button className="w-full" variant="outline" onClick={startQuiz}>
                  <RotateCcw className="h-4 w-4" /> Opnieuw proberen
                </Button>
              </>
            )}
          </div>
        )}

        {phase === "result" && result && !result.ok && (
          <p className="text-sm text-destructive">{result.error}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
