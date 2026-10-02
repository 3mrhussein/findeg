CREATE TABLE "identity"."partner_invitation_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"invitation_id" integer NOT NULL,
	"token_digest" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_invitation_tokens_token_digest_unique" UNIQUE("token_digest")
);
--> statement-breakpoint
CREATE TABLE "identity"."partner_invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_partner_id" integer NOT NULL,
	"email" varchar(255) NOT NULL,
	"roles" text[] NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"invited_by_user_id" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ck_partner_invitations_status" CHECK ("identity"."partner_invitations"."status" in ('pending', 'accepted', 'revoked')),
	CONSTRAINT "ck_partner_invitations_roles" CHECK (cardinality("identity"."partner_invitations"."roles") > 0 and "identity"."partner_invitations"."roles" <@ array['partner-administrator', 'list-manager', 'collection-staff', 'report-viewer']::text[])
);
--> statement-breakpoint
ALTER TABLE "identity"."partner_invitation_tokens" ADD CONSTRAINT "partner_invitation_tokens_invitation_id_partner_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "identity"."partner_invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."partner_invitations" ADD CONSTRAINT "partner_invitations_business_partner_id_business_partners_id_fk" FOREIGN KEY ("business_partner_id") REFERENCES "identity"."business_partners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."partner_invitations" ADD CONSTRAINT "partner_invitations_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "identity"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_partner_invitations_pending" ON "identity"."partner_invitations" USING btree ("business_partner_id","email") WHERE "identity"."partner_invitations"."status" = 'pending';--> statement-breakpoint
ALTER TABLE "identity"."partner_access_history" ADD CONSTRAINT "partner_access_history_invitation_id_partner_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "identity"."partner_invitations"("id") ON DELETE restrict ON UPDATE no action;