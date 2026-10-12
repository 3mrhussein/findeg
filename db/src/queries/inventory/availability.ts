import { sellableUnitsSql } from './stock-sql';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../connection';
import { inventoryBalances, warehouses } from '../../schema/inventory';

/** SQL equivalent of domain availableStock: clamp each balance before summing. */
export function availableStockByVariant() {
  return db
    .select({
      variantId: inventoryBalances.variantId,
      available:
        sql<number>`sum(${sellableUnitsSql(inventoryBalances.onHand, inventoryBalances.reserved, warehouses.isActive)})`
          .mapWith(Number)
          .as('available'),
    })
    .from(inventoryBalances)
    .innerJoin(warehouses, eq(warehouses.id, inventoryBalances.warehouseId))
    .where(eq(warehouses.isActive, true))
    .groupBy(inventoryBalances.variantId)
    .as('availability');
}
