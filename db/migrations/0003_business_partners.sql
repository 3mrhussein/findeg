CREATE TABLE "identity"."business_partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(120) NOT NULL,
	"name_en" text NOT NULL,
	"name_ar" text NOT NULL,
	"status" varchar(20) DEFAULT 'onboarding' NOT NULL,
	"authorization_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "business_partners_code_unique" UNIQUE("code"),
	CONSTRAINT "ck_business_partners_status" CHECK ("identity"."business_partners"."status" in ('onboarding', 'active', 'suspended', 'closed'))
);
--> statement-breakpoint
CREATE TABLE "identity"."partner_access_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_partner_id" integer NOT NULL,
	"membership_id" integer,
	"invitation_id" integer,
	"actor_user_id" integer NOT NULL,
	"actor_kind" varchar(20) NOT NULL,
	"action" varchar(40) NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ck_partner_access_history_actor_kind" CHECK ("identity"."partner_access_history"."actor_kind" in ('staff', 'partner', 'self')),
	CONSTRAINT "ck_partner_access_history_action" CHECK ("identity"."partner_access_history"."action" in ('partner.created', 'partner.updated', 'partner.status_changed', 'invitation.issued', 'invitation.resent', 'invitation.revoked', 'membership.accepted', 'membership.roles_changed', 'membership.suspended', 'membership.reactivated', 'membership.ended', 'membership.left'))
);
--> statement-breakpoint
ALTER TABLE "identity"."partner_access_history" ADD CONSTRAINT "partner_access_history_business_partner_id_business_partners_id_fk" FOREIGN KEY ("business_partner_id") REFERENCES "identity"."business_partners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."partner_access_history" ADD CONSTRAINT "partner_access_history_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "identity"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_partner_access_history_partner" ON "identity"."partner_access_history" USING btree ("business_partner_id","created_at");--> statement-breakpoint
CREATE FUNCTION "identity"."reject_partner_access_history_change"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'identity.partner_access_history is append-only';
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER "partner_access_history_append_only"
  BEFORE UPDATE OR DELETE ON "identity"."partner_access_history"
  FOR EACH ROW EXECUTE FUNCTION "identity"."reject_partner_access_history_change"();
