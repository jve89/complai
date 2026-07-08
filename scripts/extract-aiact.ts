/** One-off: extract the hand-authored risk-model module into the same authored
 *  data shape as the workflow output, so content.ts can adapt every module
 *  through one path. Run once: npx tsx scripts/extract-aiact.ts */
import * as fs from "fs";
import { MODULES } from "../lib/training/content";

const m = MODULES.find((x) => x.id === "ai-act-15");
if (!m) throw new Error("ai-act-15 not found");

const authored = {
  id: m.id,
  title: m.title,
  role: "core",
  drawCount: m.drawCount,
  intro: m.intro,
  minutes: m.minutes,
  lessons: m.lessons ?? [],
  quiz: m.quiz.map((q) => {
    const idx = q.answers ?? (q.answer === undefined ? [] : [q.answer]);
    const out: Record<string, unknown> = {
      question: q.question,
      options: q.options,
      correct: idx.map((i) => q.options[i]),
      explanation: q.explanation ?? "",
    };
    if (q.scenario) out.scenario = q.scenario;
    return out;
  }),
};

fs.writeFileSync(
  "lib/training/ai-act.data.ts",
  "// Extracted from the hand-authored risk-model module (same shape as modules.generated.ts).\n" +
    "export const AI_ACT_MODULE = " +
    JSON.stringify(authored, null, 2) +
    ";\n"
);
console.log("wrote lib/training/ai-act.data.ts");
