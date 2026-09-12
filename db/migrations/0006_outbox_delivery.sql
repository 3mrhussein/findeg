ALTER TABLE system.checkout_outbox
  ADD COLUMN status text NOT NULL DEFAULT 'pending',
  ADD COLUMN attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN next_attempt_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN lease_token uuid,
  ADD COLUMN lease_until timestamptz,
  ADD COLUMN last_error text,
  ADD COLUMN delivered_at timestamptz,
  ADD CONSTRAINT checkout_outbox_status CHECK (status IN ('pending', 'processing', 'delivered', 'exhausted')),
  ADD CONSTRAINT checkout_outbox_attempts CHECK (attempts >= 0);
--> statement-breakpoint
CREATE INDEX checkout_outbox_due ON system.checkout_outbox(status, next_attempt_at, lease_until);
--> statement-breakpoint
CREATE TABLE system.notification_sink (
  id text PRIMARY KEY,
  kind text NOT NULL,
  payload jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);
