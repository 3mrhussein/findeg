-- ADR-0013: Partner Rewards leave Order processing. The ledger, its Partner-safe views and the
-- reward permissions other than report access go; Order attribution on sales.orders and
-- sales.order_items stays as it is.
DROP VIEW "rewards"."partner_reward_sales_events";--> statement-breakpoint
DROP VIEW "rewards"."partner_reward_settlements";--> statement-breakpoint
DROP VIEW "rewards"."partner_reward_entitlements";--> statement-breakpoint
DROP VIEW "rewards"."partner_reward_events";--> statement-breakpoint
DROP TABLE "rewards"."reward_events" CASCADE;--> statement-breakpoint
DROP TABLE "rewards"."reward_entitlements" CASCADE;--> statement-breakpoint
DROP TABLE "rewards"."reward_settlements" CASCADE;--> statement-breakpoint
DROP TABLE "rewards"."reward_rates" CASCADE;--> statement-breakpoint
DROP FUNCTION "rewards"."forbid_reward_mutation"();--> statement-breakpoint
DROP SCHEMA "rewards";--> statement-breakpoint
DELETE FROM "identity"."permissions"
WHERE "code" IN ('rewards.rates.manage', 'rewards.adjust', 'rewards.settle');--> statement-breakpoint
UPDATE "identity"."permissions"
SET "code" = 'partner-reports.view', "name" = 'View Partner Reports', "updated_at" = now()
WHERE "code" = 'rewards.view';
