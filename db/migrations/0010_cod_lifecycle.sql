CREATE TABLE sales.order_lifecycle_events (
  order_reference text NOT NULL REFERENCES sales.accepted_orders(reference),
  event_type text NOT NULL,
  actor_id integer NOT NULL REFERENCES identity.users(id),
  amount numeric(18,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(order_reference,event_type),
  CONSTRAINT order_lifecycle_event_type CHECK (event_type IN ('delivered','paid')),
  CONSTRAINT order_lifecycle_amount CHECK ((event_type='delivered' AND amount IS NULL) OR (event_type='paid' AND amount>=0))
);
CREATE TABLE sales.order_lifecycle_outcomes (
  actor_id integer NOT NULL REFERENCES identity.users(id),
  operation text NOT NULL CHECK (operation IN ('delivery','payment')),
  key text NOT NULL,
  fingerprint text NOT NULL,
  order_reference text NOT NULL REFERENCES sales.accepted_orders(reference),
  outcome jsonb NOT NULL,
  PRIMARY KEY(actor_id,operation,key)
);
CREATE TABLE inventory.order_fulfillments (
  order_reference text PRIMARY KEY REFERENCES sales.accepted_orders(reference),
  actor_id integer NOT NULL REFERENCES identity.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE identity.partner_reward_events ADD COLUMN actor_id integer REFERENCES identity.users(id);
--> statement-breakpoint
CREATE TRIGGER preserve_order_lifecycle_events BEFORE UPDATE OR DELETE ON sales.order_lifecycle_events FOR EACH ROW EXECUTE FUNCTION identity.preserve_reward_history();
CREATE TRIGGER preserve_order_lifecycle_outcomes BEFORE UPDATE OR DELETE ON sales.order_lifecycle_outcomes FOR EACH ROW EXECUTE FUNCTION identity.preserve_reward_history();
CREATE TRIGGER preserve_order_fulfillments BEFORE UPDATE OR DELETE ON inventory.order_fulfillments FOR EACH ROW EXECUTE FUNCTION identity.preserve_reward_history();
