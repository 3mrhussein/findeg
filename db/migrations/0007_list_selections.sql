CREATE TABLE sales.list_selections (
  owner_digest text NOT NULL,
  list_id integer NOT NULL REFERENCES school_engine.school_supply_lists(id),
  selection jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_digest, list_id)
);
--> statement-breakpoint
CREATE TABLE sales.list_offers (
  list_id integer PRIMARY KEY REFERENCES school_engine.school_supply_lists(id),
  basis_points integer NOT NULL DEFAULT 0 CHECK (basis_points BETWEEN 0 AND 10000),
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  CHECK (ends_at IS NULL OR ends_at > starts_at)
);
--> statement-breakpoint
ALTER TABLE school_engine.school_supply_list_items ADD COLUMN required boolean NOT NULL DEFAULT true;
--> statement-breakpoint
ALTER TABLE school_engine.school_supply_list_items ADD COLUMN specification jsonb;
--> statement-breakpoint
CREATE FUNCTION school_engine.freeze_supply_list_item() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE source_id integer; source_status text;
BEGIN
  source_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.list_id ELSE NEW.list_id END;
  SELECT status INTO source_status FROM school_engine.school_supply_lists WHERE id = source_id FOR UPDATE;
  IF source_status <> 'draft' THEN RAISE EXCEPTION 'Published School Supply List Items are immutable'; END IF;
  IF TG_OP = 'UPDATE' AND OLD.list_id <> NEW.list_id THEN
    SELECT status INTO source_status FROM school_engine.school_supply_lists WHERE id = OLD.list_id FOR UPDATE;
    IF source_status <> 'draft' THEN RAISE EXCEPTION 'Published School Supply List Items are immutable'; END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END; $$;
--> statement-breakpoint
CREATE TRIGGER freeze_supply_list_item BEFORE INSERT OR UPDATE OR DELETE ON school_engine.school_supply_list_items FOR EACH ROW EXECUTE FUNCTION school_engine.freeze_supply_list_item();
--> statement-breakpoint
CREATE FUNCTION school_engine.freeze_supply_list() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status <> 'draft' THEN
    IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Published School Supply Lists are immutable'; END IF;
    IF NEW.status NOT IN ('published', 'archived') OR (OLD.status = 'archived' AND NEW.status <> 'archived') OR
       (to_jsonb(OLD) - ARRAY['status', 'replaced_by_id', 'archived_at', 'updated_at']) IS DISTINCT FROM
       (to_jsonb(NEW) - ARRAY['status', 'replaced_by_id', 'archived_at', 'updated_at']) THEN
      RAISE EXCEPTION 'Published School Supply Lists are immutable';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END; $$;
--> statement-breakpoint
CREATE TRIGGER freeze_supply_list BEFORE UPDATE OR DELETE ON school_engine.school_supply_lists FOR EACH ROW EXECUTE FUNCTION school_engine.freeze_supply_list();
