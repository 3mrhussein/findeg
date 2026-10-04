import { bigint, date, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { rewardsSchema } from '../schemas';

/**
 * Partner-safe views (ADR-0010). The Partner read path selects only from these, so the privacy
 * rule holds by construction: no `order_reference`, Customer, reason, note, actor or key column
 * exists here. They are created by migration SQL, hence `.existing()`.
 */
export const partnerRewardEvents = rewardsSchema
  .view('partner_reward_events', {
    businessPartnerId: integer('business_partner_id').notNull(),
    entitlementId: integer('entitlement_id'),
    eventType: text('event_type').notNull(),
    points: bigint('points', { mode: 'bigint' }).notNull(),
    egpValuePiasters: bigint('egp_value_piasters', { mode: 'bigint' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  })
  .existing();

export const partnerRewardEntitlements = rewardsSchema
  .view('partner_reward_entitlements', {
    id: integer('id').notNull(),
    businessPartnerId: integer('business_partner_id').notNull(),
    points: bigint('points', { mode: 'bigint' }).notNull(),
    egpValuePiasters: bigint('egp_value_piasters', { mode: 'bigint' }).notNull(),
  })
  .existing();

export const partnerRewardSettlements = rewardsSchema
  .view('partner_reward_settlements', {
    id: integer('id').notNull(),
    businessPartnerId: integer('business_partner_id').notNull(),
    kind: text('kind').notNull(),
    amountPiasters: bigint('amount_piasters', { mode: 'bigint' }).notNull(),
    transferReference: text('transfer_reference'),
    paidAt: date('paid_at'),
    voidsSettlementId: integer('voids_settlement_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  })
  .existing();

/** Earned (`paid`) and reversed events with their list attribution. `order_id` is internal. */
export const partnerRewardSalesEvents = rewardsSchema
  .view('partner_reward_sales_events', {
    businessPartnerId: integer('business_partner_id').notNull(),
    eventType: text('event_type').notNull(),
    points: bigint('points', { mode: 'bigint' }).notNull(),
    egpValuePiasters: bigint('egp_value_piasters', { mode: 'bigint' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    orderId: integer('order_id').notNull(),
    listId: integer('list_id'),
    listItemId: integer('list_item_id'),
    variantId: integer('variant_id'),
    productId: integer('product_id'),
    productNameSnapshot: text('product_name_snapshot'),
    variantLabelSnapshot: text('variant_label_snapshot'),
  })
  .existing();
