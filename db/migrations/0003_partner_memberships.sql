CREATE TABLE "identity"."business_partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(120) NOT NULL,
	"name_en" text NOT NULL,
	"name_ar" text NOT NULL,
	"status" text DEFAULT 'onboarding' NOT NULL,
	"authorization_version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "business_partners_code_unique" UNIQUE("code"),
	CONSTRAINT "partner_status" CHECK ("identity"."business_partners"."status" in ('onboarding', 'active', 'suspended', 'closed'))
);
--> statement-breakpoint
CREATE TABLE "identity"."partner_access_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_partner_id" integer NOT NULL,
	"actor_id" integer NOT NULL,
	"action" text NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity"."partner_invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_partner_id" integer NOT NULL,
	"email" varchar(255) NOT NULL,
	"roles" text[] NOT NULL,
	"token_digest" varchar(64) NOT NULL,
	"inviter_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "partner_invitations_token_digest_unique" UNIQUE("token_digest"),
	CONSTRAINT "invitation_status" CHECK ("identity"."partner_invitations"."status" in ('pending', 'accepted', 'revoked')),
	CONSTRAINT "invitation_roles" CHECK (cardinality("identity"."partner_invitations"."roles") > 0 and "identity"."partner_invitations"."roles" <@ ARRAY['partner-administrator', 'list-manager', 'collection-staff', 'report-viewer']::text[])
);
--> statement-breakpoint
CREATE TABLE "identity"."partner_memberships" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_partner_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"invitation_id" integer NOT NULL,
	"roles" text[] NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"authorization_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "partner_memberships_invitation_id_unique" UNIQUE("invitation_id"),
	CONSTRAINT "membership_status" CHECK ("identity"."partner_memberships"."status" in ('active', 'suspended', 'ended')),
	CONSTRAINT "membership_roles" CHECK (cardinality("identity"."partner_memberships"."roles") > 0 and "identity"."partner_memberships"."roles" <@ ARRAY['partner-administrator', 'list-manager', 'collection-staff', 'report-viewer']::text[])
);
--> statement-breakpoint
ALTER TABLE "identity"."partner_access_history" ADD CONSTRAINT "partner_access_history_business_partner_id_business_partners_id_fk" FOREIGN KEY ("business_partner_id") REFERENCES "identity"."business_partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."partner_access_history" ADD CONSTRAINT "partner_access_history_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "identity"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."partner_invitations" ADD CONSTRAINT "partner_invitations_business_partner_id_business_partners_id_fk" FOREIGN KEY ("business_partner_id") REFERENCES "identity"."business_partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."partner_invitations" ADD CONSTRAINT "partner_invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "identity"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."partner_memberships" ADD CONSTRAINT "partner_memberships_business_partner_id_business_partners_id_fk" FOREIGN KEY ("business_partner_id") REFERENCES "identity"."business_partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."partner_memberships" ADD CONSTRAINT "partner_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."partner_memberships" ADD CONSTRAINT "partner_memberships_invitation_id_partner_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "identity"."partner_invitations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "one_pending_partner_invitation" ON "identity"."partner_invitations" USING btree ("business_partner_id","email") WHERE "identity"."partner_invitations"."status" = 'pending';--> statement-breakpoint
CREATE UNIQUE INDEX "one_current_partner_membership" ON "identity"."partner_memberships" USING btree ("business_partner_id","user_id") WHERE "identity"."partner_memberships"."status" <> 'ended';