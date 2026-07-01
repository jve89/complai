import { env } from "@/lib/env";

/**
 * Absolute base URL for building redirect targets, derived from the incoming
 * request so we always return to the SAME host the user is on (production, a
 * preview deploy, or localhost). Using a hard-coded env value here is fragile —
 * e.g. an unset NEXT_PUBLIC_APP_URL made Stripe's success_url fall back to
 * localhost, sending paying users to the local dev server.
 */
export function baseUrlFrom(req: Request): string {
  const origin = req.headers.get("origin");
  if (origin) return origin.replace(/\/+$/, "");

  const host = req.headers.get("host");
  if (host) {
    const local = host.startsWith("localhost") || host.startsWith("127.");
    return `${local ? "http" : "https"}://${host}`;
  }

  return env.appUrl;
}
