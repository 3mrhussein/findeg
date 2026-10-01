DO $$
DECLARE
  remaining integer;
BEGIN
  SELECT count(*) INTO remaining FROM "identity"."users" WHERE "portal_role" = 'school_staff';
  IF remaining > 0 THEN
    RAISE EXCEPTION 'Cannot retire portal_role school_staff: % identity.users row(s) still have it. Reassign them to customer or staff (partner access comes from Partner Membership) and re-run the migration.', remaining;
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "identity"."users" ALTER COLUMN "portal_role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "identity"."users" ALTER COLUMN "portal_role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "identity"."portal_role";--> statement-breakpoint
CREATE TYPE "identity"."portal_role" AS ENUM('customer', 'staff');--> statement-breakpoint
ALTER TABLE "identity"."users" ALTER COLUMN "portal_role" SET DATA TYPE "identity"."portal_role" USING "portal_role"::"identity"."portal_role";--> statement-breakpoint
ALTER TABLE "identity"."users" ALTER COLUMN "portal_role" SET DEFAULT 'customer';
