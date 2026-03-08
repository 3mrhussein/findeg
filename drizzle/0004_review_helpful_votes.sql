ALTER TABLE "reviews"
ADD COLUMN IF NOT EXISTS "helpful_count" integer DEFAULT 0 NOT NULL;

CREATE TABLE IF NOT EXISTS "review_helpful_votes" (
  "id" serial PRIMARY KEY NOT NULL,
  "review_id" integer NOT NULL,
  "voter_key" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  ALTER TABLE "review_helpful_votes"
  ADD CONSTRAINT "review_helpful_votes_review_id_reviews_id_fk"
  FOREIGN KEY ("review_id")
  REFERENCES "public"."reviews"("id")
  ON DELETE cascade
  ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "uq_review_helpful_votes_review_voter"
ON "review_helpful_votes" USING btree ("review_id", "voter_key");
