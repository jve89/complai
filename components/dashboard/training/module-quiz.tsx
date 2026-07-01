"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Check, Loader2, RotateCcw, Trophy, XCircle } from "lucide-react";

import { completeModule, type CompleteResult } from "@/app/dashboard/training/actions";
import type { TrainingModule } from "@/lib/training/content";
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
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<CompleteResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = module.quiz.length;
  const question = module.quiz[current];
  const selected = answers[current];
  const lessons = module.lessons ?? [];
  const lessonCount = lessons.length;

  function reset() {
    setPhase("intro");
    setLessonPage(0);
    setCurrent(0);
    setAnswers([]);
    setResult(null);
  }

  function choose(i: number) {
    setAnswers((a) => {
      const next = [...a];
      next[current] = i;
      return next;
    });
  }

  function next() {
    if (current < total - 1) {
      setCurrent((c) => c + 1);
      return;
    }
    startTransition(async () => {
      const res = await completeModule(module.id, answers);
      setResult(res);
      setPhase("result");
      if (res.ok && res.passed) router.refresh();
    });
  }

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
              ? `Vraag ${current + 1} van ${total}`
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
                ? `Eerst ${lessonCount} korte leesonderdelen, daarna ${total} vragen. U slaagt met minimaal 4 goede antwoorden.`
                : `Beantwoord ${total} vragen. U slaagt met minimaal 4 goede antwoorden.`}
            </p>
            <Button
              className="w-full"
              onClick={() => setPhase(lessonCount ? "lesson" : "quiz")}
            >
              {lessonCount ? "Start module" : "Start quiz"}
            </Button>
          </div>
        )}

        {phase === "lesson" && lessonCount > 0 && (
          <div className="space-y-5">
            <Progress value={((lessonPage + 1) / lessonCount) * 100} />
            <div>
              <p className="font-semibold">{lessons[lessonPage].heading}</p>
              {lessons[lessonPage].paragraphs.map((p, i) => (
                <p key={i} className="mt-2 text-sm text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
            {lessonPage === lessonCount - 1 && (
              <div className="rounded-lg bg-secondary/50 p-4 text-center">
                <p className="text-sm font-medium">Bent u klaar voor de quiz?</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {total} korte vragen · minimaal 4 goed om te slagen.
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
                <Button className="flex-1" onClick={() => setPhase("quiz")}>
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

        {phase === "quiz" && (
          <div className="space-y-5">
            <Progress value={((current + 1) / total) * 100} />
            <p className="font-medium">{question.question}</p>
            <div className="space-y-2">
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => choose(i)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border-2 px-4 py-3 text-left text-sm transition-all hover:border-brand-400",
                    selected === i
                      ? "border-brand-500 bg-brand-50"
                      : "border-border"
                  )}
                >
                  <span>{opt}</span>
                  {selected === i && (
                    <Check className="h-4 w-4 text-brand-600" />
                  )}
                </button>
              ))}
            </div>
            <Button
              className="w-full"
              onClick={next}
              disabled={selected === undefined || isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : current < total - 1 ? (
                "Volgende"
              ) : (
                "Afronden"
              )}
            </Button>
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
                    {result.score}/{result.total} goed. U heeft minimaal 4 goede
                    antwoorden nodig.
                  </p>
                </div>
                <Button className="w-full" variant="outline" onClick={reset}>
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
