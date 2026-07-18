// Runs once at server startup (Next.js instrumentation hook). Fails the boot in
// production when a critical env var is missing, so a misconfigured deploy errors
// loudly instead of silently running in stub / no-auth mode. Not executed during
// `next build` — only at runtime — so it never blocks a build.
import { assertProductionEnv } from "@/lib/env";

export function register() {
  assertProductionEnv();
}
