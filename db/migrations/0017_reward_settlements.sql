CREATE TABLE "rewards"."reward_settlements" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_partner_id" integer NOT NULL,
	"kind" text NOT NULL,
	"amount_piasters" bigint NOT NULL,
	"transfer_reference" text,
	"paid_at" date,
	"notes" text,
	"reason" text,
	"voids_settlement_id" integer,
	"voids_kind" text GENERATED ALWAYS AS (case when voids_settlement_id is not null then 'settlement' end) STORED,
	"idempotency_key" text,
	"actor_user_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_reward_settlements_id_kind" UNIQUE("id","kind"),
	CONSTRAINT "uq_reward_settlements_id_partner" UNIQUE("id","business_partner_id"),
	CONSTRAINT "ck_reward_settlements_kind" CHECK ("rewards"."reward_settlements"."kind" in ('settlement', 'void', 'debt-forgiveness')),
	CONSTRAINT "ck_reward_settlements_shape" CHECK (("rewards"."reward_settlements"."kind" = 'settlement'
          and "rewards"."reward_settlements"."amount_piasters" >= 1
          and length(trim(coalesce("rewards"."reward_settlements"."transfer_reference", ''))) > 0
          and "rewards"."reward_settlements"."paid_at" is not null
          and length(trim(coalesce("rewards"."reward_settlements"."idempotency_key", ''))) > 0
          and "rewards"."reward_settlements"."voids_settlement_id" is null)
        or ("rewards"."reward_settlements"."kind" = 'void'
          and "rewards"."reward_settlements"."amount_piasters" <= -1
          and length(trim(coalesce("rewards"."reward_settlements"."reason", ''))) > 0
          and "rewards"."reward_settlements"."voids_settlement_id" is not null
          and "rewards"."reward_settlements"."transfer_reference" is null
          and "rewards"."reward_settlements"."paid_at" is null)
        or ("rewards"."reward_settlements"."kind" = 'debt-forgiveness'
          and "rewards"."reward_settlements"."amount_piasters" >= 1
          and length(trim(coalesce("rewards"."reward_settlements"."reason", ''))) > 0
          and length(trim(coalesce("rewards"."reward_settlements"."idempotency_key", ''))) > 0
          and "rewards"."reward_settlements"."voids_settlement_id" is null
          and "rewards"."reward_settlements"."transfer_reference" is null
          and "rewards"."reward_settlements"."paid_at" is null))
);
--> statement-breakpoint
ALTER TABLE "rewards"."reward_settlements" ADD CONSTRAINT "reward_settlements_business_partner_id_business_partners_id_fk" FOREIGN KEY ("business_partner_id") REFERENCES "identity"."business_partners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards"."reward_settlements" ADD CONSTRAINT "reward_settlements_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "identity"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards"."reward_settlements" ADD CONSTRAINT "fk_reward_settlements_voids_settlement" FOREIGN KEY ("voids_settlement_id","voids_kind") REFERENCES "rewards"."reward_settlements"("id","kind") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards"."reward_settlements" ADD CONSTRAINT "fk_reward_settlements_voids_partner" FOREIGN KEY ("voids_settlement_id","business_partner_id") REFERENCES "rewards"."reward_settlements"("id","business_partner_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_reward_settlements_partner" ON "rewards"."reward_settlements" USING btree ("business_partner_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_reward_settlements_one_void" ON "rewards"."reward_settlements" USING btree ("voids_settlement_id") WHERE "rewards"."reward_settlements"."voids_settlement_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_reward_settlements_idempotency" ON "rewards"."reward_settlements" USING btree ("business_partner_id","idempotency_key") WHERE "rewards"."reward_settlements"."idempotency_key" is not null;--> statement-breakpoint
CREATE TRIGGER "reward_settlements_append_only"
BEFORE UPDATE OR DELETE ON "rewards"."reward_settlements"
FOR EACH ROW EXECUTE FUNCTION "rewards"."forbid_reward_mutation"();
