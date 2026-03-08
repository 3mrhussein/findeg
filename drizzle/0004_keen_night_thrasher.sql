CREATE TABLE "school_list_parent_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"user_id" integer,
	"session_token" text,
	"item_selections" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"optional_inclusions" integer[] DEFAULT '{}' NOT NULL,
	"optional_exclusions" integer[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_kits" (
	"id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer NOT NULL,
	"school_list_id" integer NOT NULL,
	"parent_session_id" integer,
	"display_name" text NOT NULL,
	"school_name" text NOT NULL,
	"grade_label" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "cart_kit_id" integer;--> statement-breakpoint
ALTER TABLE "school_list_parent_sessions" ADD CONSTRAINT "school_list_parent_sessions_list_id_school_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_list_parent_sessions" ADD CONSTRAINT "school_list_parent_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_kits" ADD CONSTRAINT "cart_kits_school_list_id_school_lists_id_fk" FOREIGN KEY ("school_list_id") REFERENCES "public"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_kits" ADD CONSTRAINT "cart_kits_parent_session_id_school_list_parent_sessions_id_fk" FOREIGN KEY ("parent_session_id") REFERENCES "public"."school_list_parent_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_school_parent_user_session" ON "school_list_parent_sessions" USING btree ("list_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_school_parent_guest_session" ON "school_list_parent_sessions" USING btree ("list_id","session_token");--> statement-breakpoint
CREATE INDEX "idx_school_parent_session_user" ON "school_list_parent_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_school_parent_session_token" ON "school_list_parent_sessions" USING btree ("session_token");--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_cart_kit_id_cart_kits_id_fk" FOREIGN KEY ("cart_kit_id") REFERENCES "public"."cart_kits"("id") ON DELETE set null ON UPDATE no action;