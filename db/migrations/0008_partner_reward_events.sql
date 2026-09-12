CREATE TABLE "identity"."partner_reward_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_partner_id" integer NOT NULL,
	"order_reference" text NOT NULL,
	"event_type" text NOT NULL,
	"points" integer NOT NULL,
	"pending_points" integer,
	"earned_points" integer,
	"conversion_rate" numeric(12, 4),
	"fulfillment" text,
	"fulfillment_completed" boolean,
	"verified_bank_account_id" text,
	"settlement_reference" text,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "partner_reward_event_type" CHECK ("identity"."partner_reward_events"."event_type" in ('accepted', 'paid', 'refund', 'cancellation', 'reversal', 'adjustment', 'settlement')),
	CONSTRAINT "partner_reward_fulfillment" CHECK ("identity"."partner_reward_events"."fulfillment" is null or "identity"."partner_reward_events"."fulfillment" in ('delivery', 'collection'))
);