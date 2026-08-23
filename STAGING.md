# Staging

This branch exists to give the `complai` Vercel project a stable Preview
deployment alias for pre-launch testing (Stripe test-mode checkout/webhooks,
Supabase auth/email, password reset) against an isolated Supabase project
(`complai-staging`), separate from production data.

Delete this file (and this branch) once staging is no longer needed.
