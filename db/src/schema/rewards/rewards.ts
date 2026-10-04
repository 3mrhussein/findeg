import { relations, sql } from 'drizzle-orm';
import {
  bigint,
  check,
  foreignKey,
  index,
  integer,
  numeric,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { rewardsSchema } from '../schemas';
import { businessPartners } from '../identity/partners';
import { users } from '../identity/users';
import { orderItems } from '../sales/orders';

export const REWARD_EVENT_TYPES = [
  'accepted',
  'paid',
  'cancellation',
  'reversal',
  'adjustment',
] as const;
export type RewardEventType = (typeof REWARD_EVENT_TYPES)[number];

/** Append-only Reward Rate history. The greatest id for a Business Partner is current. */
export const rewardRates = rewardsSchema.table(
  'reward_rates',
  {
    id: serial('id').primaryKey(),
    businessPartnerId: integer('business_partner_id')
      .notNull()
      .references(() => businessPartners.id, { onDelete: 'restrict' }),
    pointsPerEgp: numeric('points_per_egp', { precision: 12, scale: 6 }).notNull(),
    egpPerPoint: numeric('egp_per_point', { precision: 12, scale: 4 }).notNull(),
    createdByUserId: integer('created_by_user_id').references(() => users.id, {
      onDelete: 'restrict',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('uq_reward_rates_id_partner').on(table.id, table.businessPartnerId),
    index('idx_reward_rates_current').on(table.businessPartnerId, table.id.desc()),
    check('ck_reward_rates_points_per_egp_positive', sql`${table.pointsPerEgp} > 0`),
    check('ck_reward_rates_egp_per_point_positive', sql`${table.egpPerPoint} > 0`),
  ],
);

/** The immutable Partner Points and EGP value fixed for one attributed Order line. */
export const rewardEntitlements = rewardsSchema.table(
  'reward_entitlements',
  {
    id: serial('id').primaryKey(),
    businessPartnerId: integer('business_partner_id')
      .notNull()
      .references(() => businessPartners.id, { onDelete: 'restrict' }),
    orderItemId: integer('order_item_id')
      .notNull()
      .references(() => orderItems.id, { onDelete: 'restrict' }),
    rewardRateId: integer('reward_rate_id').notNull(),
    chargedLineTotalPiasters: bigint('charged_line_total_piasters', { mode: 'bigint' }).notNull(),
    points: bigint('points', { mode: 'bigint' }).notNull(),
    egpValuePiasters: bigint('egp_value_piasters', { mode: 'bigint' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('uq_reward_entitlements_order_item').on(table.orderItemId),
    unique('uq_reward_entitlements_id_partner').on(table.id, table.businessPartnerId),
    foreignKey({
      name: 'fk_reward_entitlements_rate_partner',
      columns: [table.rewardRateId, table.businessPartnerId],
      foreignColumns: [rewardRates.id, rewardRates.businessPartnerId],
    }).onDelete('restrict'),
    index('idx_reward_entitlements_partner').on(table.businessPartnerId, table.id),
    check('ck_reward_entitlements_charged_line_total', sql`${table.chargedLineTotalPiasters} >= 0`),
    check('ck_reward_entitlements_points', sql`${table.points} > 0`),
    check('ck_reward_entitlements_egp_value', sql`${table.egpValuePiasters} >= 0`),
  ],
);

/** Immutable ledger entries. Balances are derived from these events, never stored. */
export const rewardEvents = rewardsSchema.table(
  'reward_events',
  {
    id: serial('id').primaryKey(),
    businessPartnerId: integer('business_partner_id')
      .notNull()
      .references(() => businessPartners.id, { onDelete: 'restrict' }),
    entitlementId: integer('entitlement_id'),
    eventType: text('event_type').$type<RewardEventType>().notNull(),
    points: bigint('points', { mode: 'bigint' }).notNull(),
    egpValuePiasters: bigint('egp_value_piasters', { mode: 'bigint' }).notNull(),
    reason: text('reason'),
    idempotencyKey: text('idempotency_key'),
    actorUserId: integer('actor_user_id').references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check(
      'ck_reward_events_type',
      sql`${table.eventType} in ('accepted', 'paid', 'cancellation', 'reversal', 'adjustment')`,
    ),
    check(
      'ck_reward_events_entitlement_shape',
      sql`(${table.eventType} = 'adjustment' and ${table.entitlementId} is null)
        or (${table.eventType} <> 'adjustment' and ${table.entitlementId} is not null)`,
    ),
    check(
      'ck_reward_events_adjustment_audit',
      sql`${table.eventType} <> 'adjustment'
        or (length(trim(coalesce(${table.reason}, ''))) > 0
          and length(trim(coalesce(${table.idempotencyKey}, ''))) > 0)`,
    ),
    foreignKey({
      name: 'fk_reward_events_entitlement_partner',
      columns: [table.entitlementId, table.businessPartnerId],
      foreignColumns: [rewardEntitlements.id, rewardEntitlements.businessPartnerId],
    }).onDelete('restrict'),
    index('idx_reward_events_partner').on(table.businessPartnerId, table.id),
    uniqueIndex('uq_reward_events_accepted')
      .on(table.entitlementId)
      .where(sql`${table.entitlementId} is not null and ${table.eventType} = 'accepted'`),
    uniqueIndex('uq_reward_events_paid')
      .on(table.entitlementId)
      .where(sql`${table.entitlementId} is not null and ${table.eventType} = 'paid'`),
    uniqueIndex('uq_reward_events_reversal_or_cancellation')
      .on(table.entitlementId)
      .where(
        sql`${table.entitlementId} is not null and ${table.eventType} in ('reversal', 'cancellation')`,
      ),
    uniqueIndex('uq_reward_events_adjustment_idempotency')
      .on(table.businessPartnerId, table.idempotencyKey)
      .where(sql`${table.eventType} = 'adjustment'`),
  ],
);

export const rewardRatesRelations = relations(rewardRates, ({ one, many }) => ({
  businessPartner: one(businessPartners, {
    fields: [rewardRates.businessPartnerId],
    references: [businessPartners.id],
  }),
  entitlements: many(rewardEntitlements),
}));

export const rewardEntitlementsRelations = relations(rewardEntitlements, ({ one, many }) => ({
  businessPartner: one(businessPartners, {
    fields: [rewardEntitlements.businessPartnerId],
    references: [businessPartners.id],
  }),
  orderItem: one(orderItems, {
    fields: [rewardEntitlements.orderItemId],
    references: [orderItems.id],
  }),
  rewardRate: one(rewardRates, {
    fields: [rewardEntitlements.rewardRateId],
    references: [rewardRates.id],
  }),
  events: many(rewardEvents),
}));

export const rewardEventsRelations = relations(rewardEvents, ({ one }) => ({
  businessPartner: one(businessPartners, {
    fields: [rewardEvents.businessPartnerId],
    references: [businessPartners.id],
  }),
  entitlement: one(rewardEntitlements, {
    fields: [rewardEvents.entitlementId],
    references: [rewardEntitlements.id],
  }),
}));

export type RewardRateRow = typeof rewardRates.$inferSelect;
export type NewRewardRate = typeof rewardRates.$inferInsert;
export type RewardEntitlementRow = typeof rewardEntitlements.$inferSelect;
export type NewRewardEntitlement = typeof rewardEntitlements.$inferInsert;
export type RewardEventRow = typeof rewardEvents.$inferSelect;
export type NewRewardEvent = typeof rewardEvents.$inferInsert;
