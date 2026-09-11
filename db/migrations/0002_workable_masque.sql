ALTER TABLE "identity"."users" ADD COLUMN "authorization_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "identity"."organizations" DROP COLUMN "authorization_version";