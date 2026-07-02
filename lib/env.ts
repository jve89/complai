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
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM ?? "ComplAI <onboarding@resend.dev>",
  // ComplAI staff who may manage all client companies (comma-separated emails).
  superAdminEmails: (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
};

/** Whether an email belongs to a ComplAI super-admin. */
export function isSuperAdmin(email?: string | null): boolean {
  return Boolean(email && env.superAdminEmails.includes(email.toLowerCase()));
}

export const isStripeConfigured = Boolean(env.stripeSecretKey);
export const isResendConfigured = Boolean(env.resendApiKey);
export const isSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseAnonKey
);
