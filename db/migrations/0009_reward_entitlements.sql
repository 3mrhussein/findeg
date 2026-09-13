CREATE TABLE identity.partner_reward_rates (
  id serial PRIMARY KEY,
  business_partner_id integer NOT NULL REFERENCES identity.business_partners(id),
  points_per_egp numeric(16,6) NOT NULL CHECK (points_per_egp > 0),
  egp_per_point numeric(12,4) NOT NULL CHECK (egp_per_point > 0),
  actor_id integer NOT NULL REFERENCES identity.users(id),
  request_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(actor_id, request_key),
  UNIQUE(id, business_partner_id)
);
CREATE INDEX partner_reward_rates_latest ON identity.partner_reward_rates(business_partner_id, id DESC);
--> statement-breakpoint
CREATE TABLE identity.partner_reward_entitlements (
  id serial PRIMARY KEY,
  business_partner_id integer NOT NULL REFERENCES identity.business_partners(id),
  order_reference text NOT NULL REFERENCES sales.accepted_orders(reference),
  line_index integer NOT NULL CHECK (line_index >= 0),
  rate_id integer NOT NULL,
  eligible_subtotal numeric(18,2) NOT NULL CHECK (eligible_subtotal >= 0),
  points integer NOT NULL CHECK (points >= 0),
  reward_value numeric(18,2) NOT NULL CHECK (reward_value >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(rate_id, business_partner_id) REFERENCES identity.partner_reward_rates(id, business_partner_id),
  UNIQUE(order_reference, line_index)
);
ALTER TABLE identity.partner_reward_events ADD COLUMN entitlement_id integer REFERENCES identity.partner_reward_entitlements(id);
CREATE UNIQUE INDEX partner_reward_entitlement_once ON identity.partner_reward_events(entitlement_id, event_type) WHERE entitlement_id IS NOT NULL AND event_type IN ('accepted', 'paid');
CREATE INDEX partner_reward_events_partner_order ON identity.partner_reward_events(business_partner_id, order_reference);
--> statement-breakpoint
CREATE FUNCTION identity.preserve_reward_history() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Reward history is append-only';
END;
$$;
CREATE TRIGGER preserve_reward_rates BEFORE UPDATE OR DELETE ON identity.partner_reward_rates FOR EACH ROW EXECUTE FUNCTION identity.preserve_reward_history();
CREATE TRIGGER preserve_reward_entitlements BEFORE UPDATE OR DELETE ON identity.partner_reward_entitlements FOR EACH ROW EXECUTE FUNCTION identity.preserve_reward_history();
CREATE TRIGGER preserve_reward_events BEFORE UPDATE OR DELETE ON identity.partner_reward_events FOR EACH ROW EXECUTE FUNCTION identity.preserve_reward_history();
