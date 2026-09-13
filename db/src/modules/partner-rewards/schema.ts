import {
  boolean,
  integer,
  serial,
  text,
  timestamp,
  decimal,
  check,
  index,
  unique,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { identitySchema } from '../../schema/schemas.js';

export const partnerRewardEvents = identitySchema.table(
  'partner_reward_events',
  {
    id: serial('id').primaryKey(),
    businessPartnerId: integer('business_partner_id').notNull(),
    orderReference: text('order_reference').notNull(),
    eventType: text('event_type').notNull(),
    actorId: integer('actor_id').references(() => users.id),
    entitlementId: integer('entitlement_id').references(() => partnerRewardEntitlements.id),
    points: integer('points').notNull(),
    pendingPoints: integer('pending_points'),
    earnedPoints: integer('earned_points'),
    conversionRate: decimal('conversion_rate', { precision: 12, scale: 4 }),
    fulfillment: text('fulfillment'),
    fulfillmentCompleted: boolean('fulfillment_completed'),
    verifiedBankAccountId: text('verified_bank_account_id'),
    settlementReference: text('settlement_reference'),
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'partner_reward_event_type',
      sql`${table.eventType} in ('accepted', 'paid', 'refund', 'cancellation', 'reversal', 'adjustment', 'settlement')`,
    ),
    check(
      'partner_reward_fulfillment',
      sql`${table.fulfillment} is null or ${table.fulfillment} in ('delivery', 'collection')`,
    ),
    uniqueIndex('partner_reward_entitlement_once')
      .on(table.entitlementId, table.eventType)
      .where(
        sql`${table.entitlementId} IS NOT NULL AND ${table.eventType} IN ('accepted', 'paid')`,
      ),
    index('partner_reward_events_partner_order').on(table.businessPartnerId, table.orderReference),
  ],
);

export const partnerRewardRates = identitySchema.table(
  'partner_reward_rates',
  {
    id: serial('id').primaryKey(),
    businessPartnerId: integer('business_partner_id').notNull(),
    pointsPerEgp: decimal('points_per_egp', { precision: 16, scale: 6 }).notNull(),
    egpPerPoint: decimal('egp_per_point', { precision: 12, scale: 4 }).notNull(),
    actorId: integer('actor_id').notNull(),
    requestKey: text('request_key').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('partner_reward_rates_actor_id_request_key_key').on(table.actorId, table.requestKey),
    unique('partner_reward_rates_id_business_partner_id_key').on(table.id, table.businessPartnerId),
    index('partner_reward_rates_latest').on(table.businessPartnerId, table.id.desc()),
    check('partner_reward_rates_points_per_egp_check', sql`${table.pointsPerEgp} > 0`),
    check('partner_reward_rates_egp_per_point_check', sql`${table.egpPerPoint} > 0`),
  ],
);

export const partnerRewardEntitlements = identitySchema.table(
  'partner_reward_entitlements',
  {
    id: serial('id').primaryKey(),
    businessPartnerId: integer('business_partner_id').notNull(),
    orderReference: text('order_reference').notNull(),
    lineIndex: integer('line_index').notNull(),
    rateId: integer('rate_id').notNull(),
    eligibleSubtotal: decimal('eligible_subtotal', { precision: 18, scale: 2 }).notNull(),
    points: integer('points').notNull(),
    rewardValue: decimal('reward_value', { precision: 18, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('partner_reward_entitlements_order_reference_line_index_key').on(
      table.orderReference,
      table.lineIndex,
    ),
    check('partner_reward_entitlements_line_index_check', sql`${table.lineIndex} >= 0`),
    check(
      'partner_reward_entitlements_eligible_subtotal_check',
      sql`${table.eligibleSubtotal} >= 0`,
    ),
    check('partner_reward_entitlements_points_check', sql`${table.points} >= 0`),
    check('partner_reward_entitlements_reward_value_check', sql`${table.rewardValue} >= 0`),
  ],
);
