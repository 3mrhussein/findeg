CREATE TABLE "school_engine"."partner_school_profiles" (
	"business_partner_id" integer PRIMARY KEY NOT NULL,
	"governorate" text,
	"area" text,
	"school_type" text,
	"academic_system" text,
	"logo_url" text
);
--> statement-breakpoint
CREATE TABLE "school_engine"."school_supply_list_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"variant_id" integer,
	"exact_item" boolean DEFAULT false NOT NULL,
	"specification" jsonb,
	"required" boolean DEFAULT true NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"localized_label" jsonb NOT NULL,
	"localized_note" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"product_name_en_snapshot" text,
	"product_name_ar_snapshot" text,
	"sku_snapshot" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ck_supply_list_item_quantity" CHECK ("school_engine"."school_supply_list_items"."quantity" between 1 and 999)
);
--> statement-breakpoint
CREATE TABLE "school_engine"."school_supply_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_partner_id" integer NOT NULL,
	"grade" text NOT NULL,
	"academic_year" text NOT NULL,
	"localized_title" jsonb NOT NULL,
	"localized_description" jsonb,
	"hero_image_url" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"public_code" text,
	"source_list_id" integer,
	"replaces_list_id" integer,
	"replaced_by_id" integer,
	"published_at" timestamp,
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "school_supply_lists_public_code_unique" UNIQUE("public_code"),
	CONSTRAINT "ck_supply_list_status" CHECK ("school_engine"."school_supply_lists"."status" in ('draft', 'published', 'archived')),
	CONSTRAINT "ck_supply_list_publication" CHECK (("school_engine"."school_supply_lists"."status" = 'draft' and "school_engine"."school_supply_lists"."public_code" is null and "school_engine"."school_supply_lists"."published_at" is null and "school_engine"."school_supply_lists"."archived_at" is null)
        or ("school_engine"."school_supply_lists"."status" = 'published' and "school_engine"."school_supply_lists"."public_code" ~ '^[0-9a-f]{32}$' and "school_engine"."school_supply_lists"."public_code" is not null and "school_engine"."school_supply_lists"."published_at" is not null and "school_engine"."school_supply_lists"."archived_at" is null)
        or ("school_engine"."school_supply_lists"."status" = 'archived' and "school_engine"."school_supply_lists"."public_code" ~ '^[0-9a-f]{32}$' and "school_engine"."school_supply_lists"."public_code" is not null and "school_engine"."school_supply_lists"."published_at" is not null and "school_engine"."school_supply_lists"."archived_at" is not null))
);
--> statement-breakpoint
ALTER TABLE "school_engine"."partner_school_profiles" ADD CONSTRAINT "partner_school_profiles_business_partner_id_business_partners_id_fk" FOREIGN KEY ("business_partner_id") REFERENCES "identity"."business_partners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_supply_list_items" ADD CONSTRAINT "school_supply_list_items_list_id_school_supply_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "school_engine"."school_supply_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_supply_list_items" ADD CONSTRAINT "school_supply_list_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_supply_lists" ADD CONSTRAINT "school_supply_lists_business_partner_id_business_partners_id_fk" FOREIGN KEY ("business_partner_id") REFERENCES "identity"."business_partners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_supply_lists" ADD CONSTRAINT "school_supply_lists_source_list_id_school_supply_lists_id_fk" FOREIGN KEY ("source_list_id") REFERENCES "school_engine"."school_supply_lists"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_supply_lists" ADD CONSTRAINT "school_supply_lists_replaces_list_id_school_supply_lists_id_fk" FOREIGN KEY ("replaces_list_id") REFERENCES "school_engine"."school_supply_lists"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_supply_lists" ADD CONSTRAINT "school_supply_lists_replaced_by_id_school_supply_lists_id_fk" FOREIGN KEY ("replaced_by_id") REFERENCES "school_engine"."school_supply_lists"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_supply_list_item_list" ON "school_engine"."school_supply_list_items" USING btree ("list_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_supply_list_published_slot" ON "school_engine"."school_supply_lists" USING btree ("business_partner_id","academic_year","grade") WHERE "school_engine"."school_supply_lists"."status" = 'published';--> statement-breakpoint
CREATE INDEX "idx_supply_list_partner" ON "school_engine"."school_supply_lists" USING btree ("business_partner_id");
--> statement-breakpoint
-- The service gives readable errors; these triggers protect every SQL writer.
CREATE FUNCTION "school_engine"."freeze_supply_list"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status = 'draft' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'A published or archived School Supply List cannot be deleted' USING ERRCODE = '23514';
  END IF;
  IF (to_jsonb(NEW) - ARRAY['status', 'replaced_by_id', 'archived_at', 'updated_at'])
      IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['status', 'replaced_by_id', 'archived_at', 'updated_at']) THEN
    RAISE EXCEPTION 'A published or archived School Supply List is frozen' USING ERRCODE = '23514';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status AND NOT (OLD.status = 'published' AND NEW.status = 'archived') THEN
    RAISE EXCEPTION 'School Supply Lists only move from published to archived' USING ERRCODE = '23514';
  END IF;
  -- Once archived, even retirement history cannot be rewritten. updated_at is harmless.
  IF OLD.status = 'archived' AND (NEW.archived_at IS DISTINCT FROM OLD.archived_at OR NEW.replaced_by_id IS DISTINCT FROM OLD.replaced_by_id) THEN
    RAISE EXCEPTION 'An archived School Supply List cannot be changed' USING ERRCODE = '23514';
  END IF;
  IF NEW.status = 'published' AND (NEW.archived_at IS NOT NULL OR NEW.replaced_by_id IS NOT NULL) THEN
    RAISE EXCEPTION 'Replacement and archival belong to the archive transition' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "freeze_supply_list" BEFORE UPDATE OR DELETE ON "school_engine"."school_supply_lists"
FOR EACH ROW EXECUTE FUNCTION "school_engine"."freeze_supply_list"();
--> statement-breakpoint
CREATE FUNCTION "school_engine"."freeze_supply_list_item"() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  old_list_id integer;
  new_list_id integer;
  parent record;
BEGIN
  IF TG_OP <> 'INSERT' THEN old_list_id := OLD.list_id; END IF;
  IF TG_OP <> 'DELETE' THEN new_list_id := NEW.list_id; END IF;
  -- Lock both parents when moving an item, so neither side can be frozen while
  -- a direct SQL write races publication. INSERT must obey the freeze as well.
  FOR parent IN
    SELECT status FROM "school_engine"."school_supply_lists"
    WHERE id IN (old_list_id, new_list_id) ORDER BY id FOR UPDATE
  LOOP
    IF parent.status <> 'draft' THEN
      RAISE EXCEPTION 'Items of a published or archived School Supply List are frozen' USING ERRCODE = '23514';
    END IF;
  END LOOP;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "freeze_supply_list_item" BEFORE INSERT OR UPDATE OR DELETE ON "school_engine"."school_supply_list_items"
FOR EACH ROW EXECUTE FUNCTION "school_engine"."freeze_supply_list_item"();
