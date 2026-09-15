-- New events carry their exact value; accepted history is never rewritten.
ALTER TABLE identity.partner_reward_events ADD COLUMN value numeric(30,2);
--> statement-breakpoint
CREATE OR REPLACE VIEW identity.partner_report_events AS
SELECT DISTINCT e.id, e.business_partner_id, e.order_reference, e.event_type,
  e.points, e.pending_points, e.earned_points, e.created_at,
  COALESCE(e.value,
    CASE WHEN e.entitlement_id IS NOT NULL AND e.event_type IN ('accepted','paid') THEN t.reward_value
         WHEN e.conversion_rate IS NOT NULL THEN round(e.points * e.conversion_rate,2)
         ELSE NULL END) AS value
FROM identity.partner_reward_events e
LEFT JOIN identity.partner_reward_entitlements t ON t.id=e.entitlement_id;
