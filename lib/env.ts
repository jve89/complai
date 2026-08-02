/**
 * Centralised environment access. Values are read lazily so the app builds and
 * runs in "stub" mode when external services (Stripe, Resend) are not yet
 * configured. Each integration checks its own key and no-ops when absent.
 */
export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  // Turns on Stripe Tax + BTW/address collection at checkout (reverse-charge
  // VAT invoices). Kept behind a flag so the code can ship before Stripe Tax is
  // activated in the dashboard — enabling automatic_tax before that errors the
  // checkout. Set STRIPE_TAX_ENABLED=1 in Vercel once the dashboard is ready.
  stripeTaxEnabled: process.env.STRIPE_TAX_ENABLED === "1",
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM ?? "ComplAI <onboarding@resend.dev>",
  // Where contact-form notifications are delivered. Must be a mailbox that can
  // RECEIVE (the EMAIL_FROM sender address often can't), else inbound leads are
  // lost. Falls back to emailFrom only if unset.
  contactTo: process.env.CONTACT_TO,
  // Shared secret for the regulatory-updates cron. Vercel Cron sends it as
  // `Authorization: Bearer $CRON_SECRET`. Unset = the endpoint stays dormant.
  cronSecret: process.env.CRON_SECRET,
  // Search-engine indexing is OFF until launch. Flip by setting ALLOW_INDEXING=true
  // in Vercel (then redeploy) once the copy + legal pages are launch-ready.
  allowIndexing: process.env.ALLOW_INDEXING === "true",
  // ComplAI staff who may manage all client companies (comma-separated emails).
  superAdminEmails: (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
};

/** Bootstrap allowlist: emails that are always super-admins (from env), so the
 * first staff member is never locked out. Promotion of others is DB-backed
 * (User.superAdmin); getCurrentUser() combines both into user.superAdmin. */
export function isSuperAdminEmail(email?: string | null): boolean {
  return Boolean(email && env.superAdminEmails.includes(email.toLowerCase()));
}

export const isStripeConfigured = Boolean(env.stripeSecretKey);
export const isResendConfigured = Boolean(env.resendApiKey);
export const isSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseAnonKey
);

/**
 * Fail-fast in production: throw at server startup if a critical env var is
 * missing, so a misconfigured deploy errors loudly instead of silently
 * degrading — a blank Supabase URL/key disables auth entirely (middleware passes
 * through, getActiveCompany falls back to the demo company), and a missing
 * DATABASE_URL breaks every query. Called from instrumentation.ts.
 *
 * Stripe/Resend are deliberately NOT required: they degrade to a documented stub
 * until billing and email go live, which is a valid pre-launch state.
 */
export function assertProductionEnv(): void {
  if (process.env.NODE_ENV !== "production") return;
  const missing: string[] = [];
  if (!env.databaseUrl) missing.push("DATABASE_URL");
  if (!env.supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!env.supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}. ` +
        `Set them in the deployment environment before serving traffic.`
    );
  }
}
