/** Owner-scoped schema construction surface. Legacy mappings are retained until replacement. */
export { warehouses, inventoryBalances, stockMovements } from '../../schema/inventory/inventory.js';

import { integer, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { inventorySchema } from '../../schema/schemas.js';

export const orderReservations = inventorySchema.table(
  'order_reservations',
  {
    orderReference: text('order_reference').notNull(),
    variantId: integer('variant_id').notNull(),
    warehouseId: integer('warehouse_id').notNull(),
    quantity: integer('quantity').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.orderReference, table.variantId, table.warehouseId] })],
);

export const orderFulfillments = inventorySchema.table('order_fulfillments', {
  orderReference: text('order_reference').primaryKey(),
  actorId: integer('actor_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
