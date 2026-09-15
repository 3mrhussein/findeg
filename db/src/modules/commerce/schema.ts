/** Owner-scoped schema construction surface. Legacy mappings are retained until replacement. */
export { paymentMethods } from '../../schema/identity/identity-access.js';
export { orders, orderItems } from '../../schema/sales/orders.js';
export { cartKits } from '../../schema/sales/cart-kits.js';
export { discountRules } from '../../schema/sales/discount-rules.js';
export { addresses } from '../../schema/identity/addresses.js';

import {
  boolean,
  check,
  integer,
  jsonb,
  numeric,
  primaryKey,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { schoolSupplyLists } from '../../schema/school-engine/school-list-publications.js';
import { salesSchema } from '../../schema/schemas.js';

export const storefrontCarts = salesSchema.table('storefront_carts', {
  ownerDigest: text('owner_digest').primaryKey(),
  items: jsonb('items').$type<readonly { variantId: number; quantity: number }[]>().notNull(),
});

export const deliveryZones = salesSchema.table('delivery_zones', {
  id: serial('id').primaryKey(),
  name: jsonb('name').$type<{ en: string; ar: string }>().notNull(),
  fee: numeric('fee', { precision: 14, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

export const acceptedOrders = salesSchema.table('accepted_orders', {
  reference: text('reference').primaryKey(),
  snapshot: jsonb('snapshot').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const checkoutOutcomes = salesSchema.table(
  'checkout_outcomes',
  {
    ownerDigest: text('owner_digest').notNull(),
    key: text('key').notNull(),
    fingerprint: text('fingerprint').notNull(),
    orderReference: text('order_reference')
      .notNull()
      .references(() => acceptedOrders.reference),
  },
  (table) => [primaryKey({ columns: [table.ownerDigest, table.key] })],
);

export const guestOrderAccess = salesSchema.table('guest_order_access', {
  reference: text('reference').primaryKey(),
  orderReference: text('order_reference')
    .notNull()
    .references(() => acceptedOrders.reference),
  codeHash: text('code_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
});

export const listSelections = salesSchema.table(
  'list_selections',
  {
    ownerDigest: text('owner_digest').notNull(),
    listId: integer('list_id')
      .notNull()
      .references(() => schoolSupplyLists.id),
    selection: jsonb('selection').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.ownerDigest, table.listId] })],
);

export const listOffers = salesSchema.table(
  'list_offers',
  {
    listId: integer('list_id')
      .primaryKey()
      .references(() => schoolSupplyLists.id),
    basisPoints: integer('basis_points').notNull().default(0),
    startsAt: timestamp('starts_at', { withTimezone: true }).defaultNow().notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }),
  },
  (table) => [
    check('list_offers_basis_points_check', sql`${table.basisPoints} BETWEEN 0 AND 10000`),
    check('list_offers_check', sql`${table.endsAt} IS NULL OR ${table.endsAt} > ${table.startsAt}`),
  ],
);

export const orderLifecycleEvents = salesSchema.table(
  'order_lifecycle_events',
  {
    orderReference: text('order_reference')
      .notNull()
      .references(() => acceptedOrders.reference),
    eventType: text('event_type').notNull(),
    actorId: integer('actor_id').notNull(),
    amount: numeric('amount', { precision: 18, scale: 2 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.orderReference, table.eventType] }),
    check('order_lifecycle_event_type', sql`${table.eventType} IN ('delivered', 'paid')`),
    check(
      'order_lifecycle_amount',
      sql`(${table.eventType} = 'delivered' AND ${table.amount} IS NULL) OR (${table.eventType} = 'paid' AND ${table.amount} >= 0)`,
    ),
  ],
);

export const orderLifecycleOutcomes = salesSchema.table(
  'order_lifecycle_outcomes',
  {
    actorId: integer('actor_id').notNull(),
    operation: text('operation').notNull(),
    key: text('key').notNull(),
    fingerprint: text('fingerprint').notNull(),
    orderReference: text('order_reference')
      .notNull()
      .references(() => acceptedOrders.reference),
    outcome: jsonb('outcome').notNull(),
  },
  (table) => [primaryKey({ columns: [table.actorId, table.operation, table.key] })],
);
