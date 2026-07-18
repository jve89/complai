// Runtime validation for the ONLY unauthenticated write path (anonymous scans):
// submitScan's client-posted answers. Lenient on purpose — it bounds size and
// coerces the shape without rejecting a valid wizard submission. Unknown code
// strings are ignored downstream by the classification engine, so the code arrays
// stay loose string[] (an over-strict enum here would reject legitimate scans and
// break the signup funnel). z.object strips unknown keys.
import { z } from "zod";
import type { ScanAnswers } from "@/lib/compliance/questions";

const CODES = z.array(z.string().max(120)).max(200);
const TRI = z.enum(["ja", "deels", "nee"]);
const BOOL_FLAGS = z.record(z.string().max(60), z.boolean());

export const ScanAnswersSchema = z.object({
  companyName: z.string().max(200).optional(),
  size: z.string().max(60).optional(),
  sector: z.string().max(120).optional(),
  tools: CODES.optional(),
  useCases: CODES.optional(),
  decisionsAboutPeople: TRI.optional(),
  roles: CODES.default([]),
  modifications: CODES.default([]),
  annexI_B: CODES.default([]),
  annexI_A: CODES.default([]),
  thirdPartyConformity: z.enum(["yes", "no", "unsure"]).optional(),
  annexIII_areas: CODES.default([]),
  annexIII_subareas: CODES.default([]),
  biometricUse: z.enum(["verification", "identification"]).optional(),
  art6_3_carveout: z.boolean().optional(),
  profiling: z.boolean().optional(),
  scopeCriteria: CODES.default([]),
  gpaiSystemic: CODES.default([]),
  exclusions: CODES.default([]),
  prohibited: CODES.default([]),
  prohibitedQualifiers: BOOL_FLAGS.optional(),
  transparency: CODES.default([]),
  transparencyQualifiers: BOOL_FLAGS.optional(),
  publicBodyOrService: z.boolean().optional(),
  readiness: z.record(z.string().max(40), TRI).optional(),
  email: z.string().max(320).optional(),
});

/** Validate untrusted scan input; returns a ScanAnswers or null when malformed.
 *  The cast is safe: the schema guarantees the shape, and the engine tolerates
 *  unknown code strings within the (validated) string arrays. */
export function parseScanAnswers(input: unknown): ScanAnswers | null {
  const parsed = ScanAnswersSchema.safeParse(input);
  return parsed.success ? (parsed.data as unknown as ScanAnswers) : null;
}
