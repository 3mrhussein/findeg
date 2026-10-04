CREATE SCHEMA "rewards";
--> statement-breakpoint
CREATE TABLE "rewards"."reward_entitlements" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_partner_id" integer NOT NULL,
	"order_item_id" integer NOT NULL,
	"reward_rate_id" integer NOT NULL,
	"charged_line_total_piasters" bigint NOT NULL,
	"points" bigint NOT NULL,
	"egp_value_piasters" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_reward_entitlements_order_item" UNIQUE("order_item_id"),
	CONSTRAINT "uq_reward_entitlements_id_partner" UNIQUE("id","business_partner_id"),
	CONSTRAINT "ck_reward_entitlements_charged_line_total" CHECK ("rewards"."reward_entitlements"."charged_line_total_piasters" >= 0),
	CONSTRAINT "ck_reward_entitlements_points" CHECK ("rewards"."reward_entitlements"."points" > 0),
	CONSTRAINT "ck_reward_entitlements_egp_value" CHECK ("rewards"."reward_entitlements"."egp_value_piasters" >= 0)
);
--> statement-breakpoint
CREATE TABLE "rewards"."reward_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_partner_id" integer NOT NULL,
	"entitlement_id" integer,
	"event_type" text NOT NULL,
	"points" bigint NOT NULL,
	"egp_value_piasters" bigint NOT NULL,
	"reason" text,
	"idempotency_key" text,
	"actor_user_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_reward_events_type" CHECK ("rewards"."reward_events"."event_type" in ('accepted', 'paid', 'cancellation', 'reversal', 'adjustment')),
	CONSTRAINT "ck_reward_events_entitlement_shape" CHECK (("rewards"."reward_events"."event_type" = 'adjustment' and "rewards"."reward_events"."entitlement_id" is null)
        or ("rewards"."reward_events"."event_type" <> 'adjustment' and "rewards"."reward_events"."entitlement_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "rewards"."reward_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_partner_id" integer NOT NULL,
	"points_per_egp" numeric(12, 6) NOT NULL,
	"egp_per_point" numeric(12, 4) NOT NULL,
	"created_by_user_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_reward_rates_id_partner" UNIQUE("id","business_partner_id"),
	CONSTRAINT "ck_reward_rates_points_per_egp_positive" CHECK ("rewards"."reward_rates"."points_per_egp" > 0),
	CONSTRAINT "ck_reward_rates_egp_per_point_positive" CHECK ("rewards"."reward_rates"."egp_per_point" > 0)
);
--> statement-breakpoint
ALTER TABLE "rewards"."reward_entitlements" ADD CONSTRAINT "reward_entitlements_business_partner_id_business_partners_id_fk" FOREIGN KEY ("business_partner_id") REFERENCES "identity"."business_partners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards"."reward_entitlements" ADD CONSTRAINT "reward_entitlements_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "sales"."order_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards"."reward_entitlements" ADD CONSTRAINT "fk_reward_entitlements_rate_partner" FOREIGN KEY ("reward_rate_id","business_partner_id") REFERENCES "rewards"."reward_rates"("id","business_partner_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards"."reward_events" ADD CONSTRAINT "reward_events_business_partner_id_business_partners_id_fk" FOREIGN KEY ("business_partner_id") REFERENCES "identity"."business_partners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards"."reward_events" ADD CONSTRAINT "reward_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "identity"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards"."reward_events" ADD CONSTRAINT "fk_reward_events_entitlement_partner" FOREIGN KEY ("entitlement_id","business_partner_id") REFERENCES "rewards"."reward_entitlements"("id","business_partner_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards"."reward_rates" ADD CONSTRAINT "reward_rates_business_partner_id_business_partners_id_fk" FOREIGN KEY ("business_partner_id") REFERENCES "identity"."business_partners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards"."reward_rates" ADD CONSTRAINT "reward_rates_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "identity"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_reward_entitlements_partner" ON "rewards"."reward_entitlements" USING btree ("business_partner_id","id");--> statement-breakpoint
CREATE INDEX "idx_reward_events_partner" ON "rewards"."reward_events" USING btree ("business_partner_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_reward_events_accepted" ON "rewards"."reward_events" USING btree ("entitlement_id") WHERE "rewards"."reward_events"."entitlement_id" is not null and "rewards"."reward_events"."event_type" = 'accepted';--> statement-breakpoint
CREATE UNIQUE INDEX "uq_reward_events_paid" ON "rewards"."reward_events" USING btree ("entitlement_id") WHERE "rewards"."reward_events"."entitlement_id" is not null and "rewards"."reward_events"."event_type" = 'paid';--> statement-breakpoint
CREATE UNIQUE INDEX "uq_reward_events_reversal_or_cancellation" ON "rewards"."reward_events" USING btree ("entitlement_id") WHERE "rewards"."reward_events"."entitlement_id" is not null and "rewards"."reward_events"."event_type" in ('reversal', 'cancellation');--> statement-breakpoint
CREATE INDEX "idx_reward_rates_current" ON "rewards"."reward_rates" USING btree ("business_partner_id","id" DESC NULLS LAST);--> statement-breakpoint
CREATE FUNCTION "rewards"."forbid_reward_mutation"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	RAISE EXCEPTION 'Reward ledger records are append-only';
END;
$$;--> statement-breakpoint
CREATE TRIGGER "reward_rates_append_only"
BEFORE UPDATE OR DELETE ON "rewards"."reward_rates"
FOR EACH ROW EXECUTE FUNCTION "rewards"."forbid_reward_mutation"();--> statement-breakpoint
CREATE TRIGGER "reward_entitlements_append_only"
BEFORE UPDATE OR DELETE ON "rewards"."reward_entitlements"
FOR EACH ROW EXECUTE FUNCTION "rewards"."forbid_reward_mutation"();--> statement-breakpoint
CREATE TRIGGER "reward_events_append_only"
BEFORE UPDATE OR DELETE ON "rewards"."reward_events"
FOR EACH ROW EXECUTE FUNCTION "rewards"."forbid_reward_mutation"();
