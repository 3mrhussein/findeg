-- Partner-safe views (ADR-0010). The Partner read path selects only from these, by convention in
-- db/src/queries/rewards/partner-report.ts: there is no restricted database role, so no GRANT
-- enforces it. The sales view's inner joins drop no `paid` or `reversal` event: those events
-- require an entitlement, which requires an order item, which requires an order (all NOT NULL FKs).
CREATE VIEW "rewards"."partner_reward_events" AS
  SELECT "business_partner_id", "entitlement_id", "event_type", "points", "egp_value_piasters", "created_at"
  FROM "rewards"."reward_events";
--> statement-breakpoint
CREATE VIEW "rewards"."partner_reward_entitlements" AS
  SELECT "id", "business_partner_id", "points", "egp_value_piasters"
  FROM "rewards"."reward_entitlements";
--> statement-breakpoint
CREATE VIEW "rewards"."partner_reward_settlements" AS
  SELECT "id", "business_partner_id", "kind", "amount_piasters", "transfer_reference", "paid_at", "voids_settlement_id", "created_at"
  FROM "rewards"."reward_settlements";
--> statement-breakpoint
CREATE VIEW "rewards"."partner_reward_sales_events" AS
  SELECT
    e."business_partner_id",
    e."event_type",
    e."points",
    e."egp_value_piasters",
    e."created_at",
    oi."order_id",
    o."school_supply_list_id" AS "list_id",
    oi."school_supply_list_item_id" AS "list_item_id",
    oi."variant_id",
    oi."product_id",
    oi."product_name_snapshot",
    oi."variant_snapshot"->>'label' AS "variant_label_snapshot"
  FROM "rewards"."reward_events" e
  INNER JOIN "rewards"."reward_entitlements" en ON en."id" = e."entitlement_id"
  INNER JOIN "sales"."order_items" oi ON oi."id" = en."order_item_id"
  INNER JOIN "sales"."orders" o ON o."id" = oi."order_id"
  WHERE e."event_type" IN ('paid', 'reversal');
