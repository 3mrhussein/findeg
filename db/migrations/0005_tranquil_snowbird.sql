CREATE TABLE "identity"."partner_memberships" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_partner_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"invitation_id" integer NOT NULL,
	"roles" text[] NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"authorization_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_memberships_invitation_id_unique" UNIQUE("invitation_id"),
	CONSTRAINT "ck_partner_memberships_status" CHECK ("identity"."partner_memberships"."status" in ('active', 'suspended', 'ended')),
	CONSTRAINT "ck_partner_memberships_roles" CHECK (cardinality("identity"."partner_memberships"."roles") > 0 and "identity"."partner_memberships"."roles" <@ array['partner-administrator', 'list-manager', 'collection-staff', 'report-viewer']::text[])
);
--> statement-breakpoint
ALTER TABLE "identity"."partner_memberships" ADD CONSTRAINT "partner_memberships_business_partner_id_business_partners_id_fk" FOREIGN KEY ("business_partner_id") REFERENCES "identity"."business_partners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."partner_memberships" ADD CONSTRAINT "partner_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."partner_memberships" ADD CONSTRAINT "partner_memberships_invitation_id_partner_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "identity"."partner_invitations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_partner_memberships_current" ON "identity"."partner_memberships" USING btree ("business_partner_id","user_id") WHERE "identity"."partner_memberships"."status" <> 'ended';--> statement-breakpoint
ALTER TABLE "identity"."partner_access_history" ADD CONSTRAINT "partner_access_history_membership_id_partner_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "identity"."partner_memberships"("id") ON DELETE restrict ON UPDATE no action;