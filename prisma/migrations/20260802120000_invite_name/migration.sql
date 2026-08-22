-- Optional display name captured on an invite (admin may prefill it). Nullable,
-- no backfill: existing invites keep NULL and simply don't prefill the signup form.
ALTER TABLE "invites" ADD COLUMN "name" TEXT;
