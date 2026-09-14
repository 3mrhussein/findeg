-- Approved read-only projection. DISTINCT prevents automatic updates through the event view.
CREATE VIEW identity.partner_report_events AS
SELECT DISTINCT e.id, e.business_partner_id, e.order_reference, e.event_type,
  e.points, e.pending_points, e.earned_points, e.created_at,
  CASE WHEN e.entitlement_id IS NOT NULL AND e.event_type IN ('accepted','paid') THEN t.reward_value
       WHEN e.conversion_rate IS NOT NULL THEN round(e.points * e.conversion_rate,2)
       ELSE NULL END AS value
FROM identity.partner_reward_events e
LEFT JOIN identity.partner_reward_entitlements t ON t.id=e.entitlement_id;
--> statement-breakpoint
-- Qualifying sales only. Aggregates are non-updatable and contain no customer columns.
CREATE VIEW identity.partner_report_sales AS
WITH lines AS (
  SELECT t.business_partner_id, t.order_reference, t.eligible_subtotal,
    (p.created_at AT TIME ZONE 'UTC')::date::text AS day,
    (a.snapshot->'items'->t.line_index->'attribution'->>'listId')::integer AS list_id,
    (a.snapshot->'items'->t.line_index->'attribution'->>'listItemId')::integer AS list_item_id,
    (a.snapshot->'items'->t.line_index->>'variantId')::integer AS variant_id
  FROM identity.partner_reward_entitlements t
  JOIN sales.accepted_orders a ON a.reference=t.order_reference
  JOIN sales.order_lifecycle_events p ON p.order_reference=t.order_reference AND p.event_type='paid'
)
SELECT business_partner_id, day, list_id, list_item_id, variant_id,
  count(DISTINCT order_reference)::integer AS count, sum(eligible_subtotal)::numeric AS subtotal
FROM lines GROUP BY business_partner_id,day,list_id,list_item_id,variant_id;
