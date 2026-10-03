CREATE TABLE "system"."outbox" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"lease_token" text,
	"lease_until" timestamp with time zone,
	"last_error" text,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_outbox_status" CHECK ("system"."outbox"."status" in ('pending', 'processing', 'delivered', 'exhausted', 'expired'))
);
--> statement-breakpoint
CREATE INDEX "idx_outbox_due" ON "system"."outbox" USING btree ("status","next_attempt_at");