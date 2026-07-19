-- Add a completion marker to the webhook idempotency table. A row is CLAIMED
-- (inserted, processed_at = NULL) before the handler runs and marked done
-- (processed_at set) only after it succeeds. So a handler that crashed mid-way
-- (timeout/OOM — not a thrown error) leaves processed_at = NULL and Stripe's
-- retry re-processes it, instead of the event being skipped as a duplicate.
ALTER TABLE "stripe_events" ADD COLUMN "processed_at" TIMESTAMP(3);

-- Existing rows were written under the old claim-first logic (a surviving row
-- means it was processed), so mark them done to avoid re-processing history.
UPDATE "stripe_events" SET "processed_at" = "created_at" WHERE "processed_at" IS NULL;
