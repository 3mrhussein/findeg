CREATE TABLE "identity"."sessions" (
	"token_digest" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"authorization_version" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity"."staff_role_grants" (
	"user_id" integer NOT NULL,
	"role" varchar(40) NOT NULL,
	CONSTRAINT "staff_role_grants_user_id_role_pk" PRIMARY KEY("user_id","role"),
	CONSTRAINT "staff_role_fixed" CHECK ("identity"."staff_role_grants"."role" in ('access-administrator', 'catalog-manager', 'fulfillment-operator', 'finance-manager'))
);
--> statement-breakpoint
ALTER TABLE "identity"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."staff_role_grants" ADD CONSTRAINT "staff_role_grants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_sessions_user" ON "identity"."sessions" USING btree ("user_id");
--> statement-breakpoint
-- Every access writer, including operational SQL, advances the authoritative version.
CREATE FUNCTION identity.staff_grants_changed() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP <> 'INSERT' THEN
    UPDATE identity.users SET authorization_version = authorization_version + 1 WHERE id = OLD.user_id;
  END IF;
  IF TG_OP <> 'DELETE' THEN
    UPDATE identity.users SET authorization_version = authorization_version + 1 WHERE id = NEW.user_id;
  END IF;
  RETURN NULL;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER staff_grants_changed AFTER INSERT OR UPDATE OR DELETE ON identity.staff_role_grants
FOR EACH ROW EXECUTE FUNCTION identity.staff_grants_changed();
--> statement-breakpoint
CREATE FUNCTION identity.user_access_changed() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.is_active IS DISTINCT FROM NEW.is_active OR OLD.email_verified IS DISTINCT FROM NEW.email_verified THEN
    NEW.authorization_version := OLD.authorization_version + 1;
  END IF;
  IF OLD.is_active AND NOT NEW.is_active THEN
    DELETE FROM identity.sessions WHERE user_id = OLD.id;
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER user_access_changed BEFORE UPDATE ON identity.users
FOR EACH ROW EXECUTE FUNCTION identity.user_access_changed();
--> statement-breakpoint
CREATE FUNCTION identity.credentials_changed() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.password_hash = NEW.password_hash AND OLD.hash_strategy = NEW.hash_strategy AND OLD.user_id = NEW.user_id THEN
    RETURN NULL;
  END IF;
  DELETE FROM identity.sessions WHERE user_id = OLD.user_id;
  RETURN NULL;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER credentials_changed AFTER UPDATE OR DELETE ON identity.password_credentials
FOR EACH ROW EXECUTE FUNCTION identity.credentials_changed();
