import { serial, varchar, text, integer, timestamp, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { salesSchema } from '../schemas';
import { orders } from './orders';
import type { CheckoutReceipt } from '../../types/sales';

export const checkoutIdempotency = salesSchema.table(
  'checkout_idempotency',
  {
    id: serial('id').primaryKey(),
    scope: varchar('scope', { length: 255 }).notNull(),
    key: varchar('key', { length: 255 }).notNull(),
    fingerprint: varchar('fingerprint', { length: 64 }).notNull(),
    orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }),
    orderReference: text('order_reference'),
    response: jsonb('response').$type<CheckoutReceipt>(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('uq_checkout_idempotency_scope_key').on(table.scope, table.key)],
);

export const checkoutIdempotencyRelations = relations(checkoutIdempotency, ({ one }) => ({
  order: one(orders, {
    fields: [checkoutIdempotency.orderId],
    references: [orders.id],
  }),
}));

export type CheckoutIdempotency = typeof checkoutIdempotency.$inferSelect;
export type NewCheckoutIdempotency = typeof checkoutIdempotency.$inferInsert;
