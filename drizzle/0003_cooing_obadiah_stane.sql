CREATE TABLE "review_helpful_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"review_id" integer NOT NULL,
	"voter_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_list_access_grants" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"granted_via" varchar(20) NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "school_list_access_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"child_name" text,
	"note" text,
	"parent_name" text NOT NULL,
	"parent_email" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"reviewed_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_list_access_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"token" varchar(128) NOT NULL,
	"label" text,
	"max_uses" integer,
	"use_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "school_list_access_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "school_list_code_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "helpful_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "school_lists" ADD COLUMN "access_mode" text DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "school_lists" ADD COLUMN "access_code" text;--> statement-breakpoint
ALTER TABLE "review_helpful_votes" ADD CONSTRAINT "review_helpful_votes_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_list_access_grants" ADD CONSTRAINT "school_list_access_grants_list_id_school_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_list_access_grants" ADD CONSTRAINT "school_list_access_grants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_list_access_requests" ADD CONSTRAINT "school_list_access_requests_list_id_school_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_list_access_requests" ADD CONSTRAINT "school_list_access_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_list_access_requests" ADD CONSTRAINT "school_list_access_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_list_access_tokens" ADD CONSTRAINT "school_list_access_tokens_list_id_school_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_list_access_tokens" ADD CONSTRAINT "school_list_access_tokens_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_list_code_attempts" ADD CONSTRAINT "school_list_code_attempts_list_id_school_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_list_code_attempts" ADD CONSTRAINT "school_list_code_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_review_helpful_votes_review_voter" ON "review_helpful_votes" USING btree ("review_id","voter_key");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_school_access_grant" ON "school_list_access_grants" USING btree ("list_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_school_access_grant_user" ON "school_list_access_grants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_school_access_grant_list" ON "school_list_access_grants" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "idx_school_access_request_user" ON "school_list_access_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_school_access_request_list" ON "school_list_access_requests" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "idx_school_access_request_status" ON "school_list_access_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_school_access_token_list" ON "school_list_access_tokens" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "idx_school_access_token_str" ON "school_list_access_tokens" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_school_code_attempt" ON "school_list_code_attempts" USING btree ("list_id","user_id");