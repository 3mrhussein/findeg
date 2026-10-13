import { availableStockByVariant } from '../inventory/availability';
import { availableStock, LOW_STOCK_MAX_UNITS } from '@findeg/domain';
import { domainId, mapStockBalance, mapWarehouse } from '../../mapping';
/**
 * Inventory Query Primitives
 *
 * Low-level database access for inventory operations.
 * Used by InventoryService and other services that need inventory data.
 */

import { db } from '@findeg/db/connection';
import { inventoryBalances, stockMovements, warehouses, productVariants } from '@findeg/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { withTransaction, type DbTransaction } from '../transaction';

export type InventoryBalanceRow = typeof inventoryBalances.$inferSelect;
export type StockMovementRow = typeof stockMovements.$inferSelect;
export type WarehouseRow = typeof warehouses.$inferSelect;

export interface InventoryBalanceResult {
  variantId: number;
  warehouseId: number;
  warehouseCode: string;
  isActive: boolean;
  onHand: number;
  reserved: number;
  available: number;
}

export interface StockMovementInput {
  movementType: string;
  quantity: number;
  referenceType?: string | null;
  referenceId?: string | null;
  notes?: string | null;
  createdBy?: number | null;
}

/**
 * Get inventory balance for a variant in a specific warehouse
 */
export async function getBalance(
  variantId: number,
  warehouseId?: number,
  tx?: DbTransaction,
): Promise<InventoryBalanceResult | null> {
  const client = tx ?? db;
  const conditions = [eq(inventoryBalances.variantId, variantId)];
  if (warehouseId) {
    conditions.push(eq(inventoryBalances.warehouseId, warehouseId));
  }

  const [result] = await client
    .select({
      variantId: inventoryBalances.variantId,
      warehouseId: inventoryBalances.warehouseId,
      warehouseCode: warehouses.code,
      warehouseName: warehouses.name,
      isActive: warehouses.isActive,
      onHand: inventoryBalances.onHand,
      reserved: inventoryBalances.reserved,
    })
    .from(inventoryBalances)
    .innerJoin(warehouses, eq(inventoryBalances.warehouseId, warehouses.id))
    .where(and(...conditions))
    .limit(1);

  if (!result) return null;

  return {
    ...result,
    available: availableStock(
      domainId<'ProductVariant'>(result.variantId),
      [mapStockBalance(result)],
      [
        mapWarehouse({
          id: result.warehouseId,
          name: result.warehouseName,
          isActive: result.isActive,
        }),
      ],
    ),
  };
}

/**
 * Get all warehouse balances for a variant
 */
export async function getAllBalances(variantId: number): Promise<InventoryBalanceResult[]> {
  const results = await db
    .select({
      variantId: inventoryBalances.variantId,
      warehouseId: inventoryBalances.warehouseId,
      warehouseCode: warehouses.code,
      warehouseName: warehouses.name,
      isActive: warehouses.isActive,
      onHand: inventoryBalances.onHand,
      reserved: inventoryBalances.reserved,
    })
    .from(inventoryBalances)
    .innerJoin(warehouses, eq(inventoryBalances.warehouseId, warehouses.id))
    .where(eq(inventoryBalances.variantId, variantId));

  return results.map((r) => ({
    ...r,
    available: availableStock(
      domainId<'ProductVariant'>(r.variantId),
      [mapStockBalance(r)],
      [mapWarehouse({ id: r.warehouseId, name: r.warehouseName, isActive: r.isActive })],
    ),
  }));
}

/**
 * Adjust stock and record a movement in an atomic transaction
 */
export async function adjustStock(
  variantId: number,
  warehouseId: number,
  movement: StockMovementInput,
  tx?: DbTransaction,
): Promise<void> {
  return await withTransaction(tx, async (tx) => {
    // Initialize without racing another first writer, then atomically apply the delta.
    // A zero insert also permits negative deltas on an existing positive balance:
    // PostgreSQL checks INSERT constraints before handling a uniqueness conflict.
    await tx
      .insert(inventoryBalances)
      .values({ variantId, warehouseId, onHand: 0, reserved: 0 })
      .onConflictDoNothing({
        target: [inventoryBalances.variantId, inventoryBalances.warehouseId],
      });
    await tx
      .update(inventoryBalances)
      .set({
        onHand: sql`${inventoryBalances.onHand} + ${movement.quantity}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(inventoryBalances.variantId, variantId),
          eq(inventoryBalances.warehouseId, warehouseId),
        ),
      );

    // 2. Record movement
    await tx.insert(stockMovements).values({
      variantId,
      warehouseId,
      movementType: movement.movementType,
      quantity: movement.quantity,
      referenceType: movement.referenceType,
      referenceId: movement.referenceId,
      notes: movement.notes,
      createdBy: movement.createdBy,
    });
  });
}

/**
 * Reserve stock in an atomic transaction with lock (joins `tx` when given)
 */
export async function reserveStock(
  variantId: number,
  warehouseId: number,
  quantity: number,
  orderId: string,
  tx?: DbTransaction,
): Promise<boolean> {
  return await withTransaction(tx, async (tx) => {
    // Check available with row lock
    const [balance] = await tx
      .select()
      .from(inventoryBalances)
      .where(
        and(
          eq(inventoryBalances.variantId, variantId),
          eq(inventoryBalances.warehouseId, warehouseId),
        ),
      )
      .for('update');

    const [warehouse] = await tx.select().from(warehouses).where(eq(warehouses.id, warehouseId));
    const available =
      balance && warehouse
        ? availableStock(
            domainId<'ProductVariant'>(variantId),
            [mapStockBalance(balance)],
            [mapWarehouse(warehouse)],
          )
        : 0;
    if (available < quantity) return false;

    // Update reservation (the row exists: available > 0 was read from it)
    await tx
      .update(inventoryBalances)
      .set({ reserved: sql`${inventoryBalances.reserved} + ${quantity}` })
      .where(
        and(
          eq(inventoryBalances.variantId, variantId),
          eq(inventoryBalances.warehouseId, warehouseId),
        ),
      );

    // Record movement
    await tx.insert(stockMovements).values({
      variantId,
      warehouseId,
      movementType: 'reserve',
      quantity,
      referenceType: 'order',
      referenceId: orderId,
      notes: `Reservation for order ${orderId}`,
    });

    return true;
  });
}

/**
 * Release a stock reservation in an atomic transaction (joins `tx` when given)
 */
export async function releaseReservation(
  variantId: number,
  warehouseId: number,
  quantity: number,
  orderId: string,
  tx?: DbTransaction,
): Promise<void> {
  await withTransaction(tx, async (tx) => {
    await tx
      .update(inventoryBalances)
      .set({
        reserved: sql`${inventoryBalances.reserved} - ${quantity}`,
      })
      .where(
        and(
          eq(inventoryBalances.variantId, variantId),
          eq(inventoryBalances.warehouseId, warehouseId),
        ),
      );

    await tx.insert(stockMovements).values({
      variantId,
      warehouseId,
      movementType: 'unreserve',
      quantity,
      referenceType: 'order',
      referenceId: orderId,
      notes: `Release reservation for order ${orderId}`,
    });
  });
}

/** Low stock is measured per variant across active warehouses, never per balance. */
export async function getLowStock(threshold = LOW_STOCK_MAX_UNITS) {
  const availability = availableStockByVariant();
  const results = await db
    .select({
      variant: productVariants,
      balance: inventoryBalances,
      warehouseCode: warehouses.code,
      warehouseName: warehouses.name,
      isActive: warehouses.isActive,
      available: availability.available,
    })
    .from(productVariants)
    .innerJoin(availability, eq(availability.variantId, productVariants.id))
    .innerJoin(inventoryBalances, eq(inventoryBalances.variantId, productVariants.id))
    .innerJoin(warehouses, eq(warehouses.id, inventoryBalances.warehouseId))
    .where(
      and(
        eq(warehouses.isActive, true),
        sql`${availability.available} > 0 and ${availability.available} <= ${threshold}`,
      ),
    )
    .orderBy(desc(productVariants.id), inventoryBalances.warehouseId);
  return results.map((row) => ({
    variant: row.variant,
    available: row.available,
    balance: {
      variantId: row.balance.variantId,
      warehouseId: row.balance.warehouseId,
      warehouseCode: row.warehouseCode,
      isActive: row.isActive,
      onHand: row.balance.onHand,
      reserved: row.balance.reserved,
      available: availableStock(
        domainId<'ProductVariant'>(row.balance.variantId),
        [mapStockBalance(row.balance)],
        [
          mapWarehouse({
            id: row.balance.warehouseId,
            name: row.warehouseName,
            isActive: row.isActive,
          }),
        ],
      ),
    },
  }));
}
