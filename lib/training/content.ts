// E-learning content: role-based paths over the EU AI Act. Each module has
// reading + a question bank; answers are checked server-side on completion.
//
// Module CONTENT lives in two data files that share one "authored" shape:
//   - modules.generated.ts — authored + adversarially verified by the workflow
//   - ai-act.data.ts       — the hand-authored risk-model module
// Both are adapted to TrainingModule here (correct answers given as option
// TEXTS are converted to indices, which removes off-by-one answer-key bugs).

import { AUTHORED_MODULES } from "./modules.generated";
import { AI_ACT_MODULE } from "./ai-act.data";

export interface QuizQuestion {
  question: string;
  options: string[];
  /** Correct option index for a single-answer question (omit when `answers` is set). */
  answer?: number;
  /** Correct option indices for a multi-select question. Presence ⇒ multi-select. */
  answers?: number[];
  /** Shown after the learner answers — the explanation is where the learning
   *  happens. References the relevant AI Act article. */
  explanation?: string;
  /** Optional case/scenario framing rendered above the question. */
  scenario?: string;
}

export interface LessonSection {
  heading: string;
  paragraphs: string[];
}

export interface TrainingModule {
  id: string;
  title: string;
  minutes: number;
  intro: string;
  /** Reading content shown (paged) before the quiz. */
  lessons?: LessonSection[];
  /** Question bank. Each attempt asks `drawCount` of these (all if unset). */
  quiz: QuizQuestion[];
  /** If set and smaller than the bank, an attempt draws this many at random. */
  drawCount?: number;
}

/** Pass mark as a fraction of the questions asked (0.8 = the classic 4/5). */
export const PASS_FRACTION = 0.8;

/** How many questions an attempt asks for a module (the completion denominator). */
export function askCount(module: TrainingModule): number {
  return module.drawCount && module.drawCount < module.quiz.length
    ? module.drawCount
    : module.quiz.length;
}

/** The correct option indices for a question (single or multi). */
export function correctKey(q: QuizQuestion): number[] {
  return (q.answers ?? (q.answer === undefined ? [] : [q.answer]))
    .slice()
    .sort((a, b) => a - b);
}

/** True when `selected` option indices match the question's correct answer(s).
 *  Fails safe: a question with no defined answer can never be marked correct. */
export function isCorrect(q: QuizQuestion, selected: number[]): boolean {
  const key = correctKey(q);
  const sel = Array.from(new Set(selected)).sort((a, b) => a - b);
  return key.length > 0 && sel.length === key.length && sel.every((v, i) => v === key[i]);
}

export type PathId = "employee" | "manager" | "admin";

export interface LearningPath {
  id: PathId;
  label: string;
  audience: string;
}

export const PATHS: LearningPath[] = [
  {
    id: "employee",
    label: "Medewerker",
    audience: "Voor iedereen die in het dagelijks werk met AI-tools werkt.",
  },
  {
    id: "manager",
    label: "Manager",
    audience: "Voor leidinggevenden die verantwoordelijk zijn voor AI-gebruik in hun team.",
  },
  {
    id: "admin",
    label: "Beheerder",
    audience: "Voor beheerders en technische rollen die AI-systemen inrichten en beheren.",
  },
];

// ── Authored content → runtime modules ──────────────────────────────────────
// The authoring shape: correct answers are exact option TEXTS. We convert them
// to indices here so a mismatch is impossible to introduce by miscounting.

export interface AuthoredQuestion {
  scenario?: string;
  question: string;
  options: string[];
  correct: string[];
  explanation: string;
}

export interface AuthoredModule {
  id: string;
  title: string;
  role?: string;
  drawCount?: number;
  intro: string;
  minutes: number;
  lessons: LessonSection[];
  quiz: AuthoredQuestion[];
}

function adapt(m: AuthoredModule): TrainingModule {
  return {
    id: m.id,
    title: m.title,
    minutes: m.minutes,
    intro: m.intro,
    drawCount: m.drawCount,
    lessons: m.lessons,
    quiz: m.quiz.map((q, qi) => {
      const idx = q.correct.map((c) => q.options.indexOf(c)).sort((a, b) => a - b);
      if (idx.some((i) => i < 0)) {
        throw new Error(`Module ${m.id} q${qi + 1}: a 'correct' value is not among its options`);
      }
      const base = {
        question: q.question,
        options: q.options,
        explanation: q.explanation,
        ...(q.scenario ? { scenario: q.scenario } : {}),
      };
      return idx.length > 1 ? { ...base, answers: idx } : { ...base, answer: idx[0] };
    }),
  };
}

const AUTHORED = [AI_ACT_MODULE, ...AUTHORED_MODULES] as unknown as AuthoredModule[];

export const MODULES: TrainingModule[] = AUTHORED.map(adapt);

// Which modules make up each learning path. Everyone does the core seven;
// managers and beheerders add role-specific modules on top (Art. 4 proportionality).
const CORE_IDS = [
  "what-is-ai",
  "ai-act-15",
  "prohibited-practices",
  "high-risk",
  "responsible-use",
  "recognising-risks",
  "privacy-ai",
];
export const PATH_MODULES: Record<PathId, string[]> = {
  employee: CORE_IDS,
  manager: [...CORE_IDS, "human-oversight", "deployer-duties"],
  admin: [...CORE_IDS, "risk-management", "technical-docs", "platform-beheer"],
};

export function getModule(id: string): TrainingModule | undefined {
  return MODULES.find((m) => m.id === id);
}

export function getPath(id: string): LearningPath | undefined {
  return PATHS.find((p) => p.id === id);
}

/** The ordered modules for a learning path (falls back to the core set). */
export function modulesForPath(pathId: string): TrainingModule[] {
  const ids = PATH_MODULES[pathId as PathId] ?? CORE_IDS;
  return ids
    .map((id) => getModule(id))
    .filter((m): m is TrainingModule => Boolean(m));
}

/** How many modules a learning path requires (its completion denominator). */
export function moduleCountForPath(pathId: string): number {
  return (PATH_MODULES[pathId as PathId] ?? CORE_IDS).length;
}
