CREATE TABLE identity.partner_reward_verified_bank_accounts (
  id serial PRIMARY KEY,
  business_partner_id integer NOT NULL REFERENCES identity.business_partners(id),
  bank_account_id text NOT NULL,
  verified_by integer NOT NULL REFERENCES identity.users(id),
  verified_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_partner_id, bank_account_id)
);
CREATE TABLE identity.partner_reward_outcomes (
  actor_id integer NOT NULL REFERENCES identity.users(id),
  operation text NOT NULL,
  key text NOT NULL,
  fingerprint text NOT NULL,
  outcome jsonb NOT NULL,
  PRIMARY KEY(actor_id, operation, key)
);
CREATE TRIGGER preserve_reward_verified_bank_accounts BEFORE UPDATE OR DELETE ON identity.partner_reward_verified_bank_accounts FOR EACH ROW EXECUTE FUNCTION identity.preserve_reward_history();
CREATE TRIGGER preserve_reward_outcomes BEFORE UPDATE OR DELETE ON identity.partner_reward_outcomes FOR EACH ROW EXECUTE FUNCTION identity.preserve_reward_history();
