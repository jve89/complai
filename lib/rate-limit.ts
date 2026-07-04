import { prisma } from "@/lib/prisma";
import { currentClientIp } from "@/lib/request-url";

/**
 * Fixed-window rate limiter backed by the `rate_limits` table, so counters are
 * shared across serverless instances (an in-memory limiter is useless on
 * Vercel). Best-effort: any DB error fails OPEN (allows the request) so the
 * limiter can never take the app down.
 *
 * Not perfectly atomic under a burst — good enough to blunt brute-force,
 * scraping and spam. For stricter guarantees, swap the store for Upstash later.
 */
export async function checkRateLimit(
  action: string,
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ ok: boolean; retryAfter?: number }> {
  const key = `${action}:${identifier}`;
  const now = new Date();

  try {
    const row = await prisma.rateLimit.findUnique({ where: { key } });

    // Fresh window: no row yet, or the previous window has elapsed.
    if (!row || row.resetAt <= now) {
      const resetAt = new Date(now.getTime() + windowSeconds * 1000);
      await prisma.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      });
      return { ok: true };
    }

    if (row.count >= limit) {
      return { ok: false, retryAfter: Math.ceil((row.resetAt.getTime() - now.getTime()) / 1000) };
    }

    await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
    return { ok: true };
  } catch (e) {
    console.error("Rate-limit check failed (allowing request):", e);
    return { ok: true };
  }
}

/**
 * Convenience wrapper keyed by the caller's IP. Returns a ready-made Dutch error
 * message when the limit is hit, so actions can early-return it directly.
 */
export async function rateLimitByIp(
  action: string,
  limit: number,
  windowSeconds: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { ok } = await checkRateLimit(action, currentClientIp(), limit, windowSeconds);
  if (ok) return { ok: true };
  return {
    ok: false,
    error: "Te veel pogingen. Wacht een paar minuten en probeer het opnieuw.",
  };
}
