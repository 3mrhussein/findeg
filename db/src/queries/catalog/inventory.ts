/**
 * Inventory Query Primitives
 *
 * Low-level database access for inventory operations.
 * Used by InventoryService and other services that need inventory data.
 */

import { db } from '@findeg/db/connection';
import { inventoryBalances, stockMovements, warehouses, productVariants } from '@findeg/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

export type InventoryBalanceRow = typeof inventoryBalances.$inferSelect;
export type StockMovementRow = typeof stockMovements.$inferSelect;
export type WarehouseRow = typeof warehouses.$inferSelect;

export interface InventoryBalanceResult {
    variantId: number;
    warehouseId: number;
    warehouseCode: string;
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
): Promise<InventoryBalanceResult | null> {
    const conditions = [eq(inventoryBalances.variantId, variantId)];
    if (warehouseId) {
        conditions.push(eq(inventoryBalances.warehouseId, warehouseId));
    }

    const [result] = await db
        .select({
            variantId: inventoryBalances.variantId,
            warehouseId: inventoryBalances.warehouseId,
            warehouseCode: warehouses.code,
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
        available: result.onHand - result.reserved,
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
            onHand: inventoryBalances.onHand,
            reserved: inventoryBalances.reserved,
        })
        .from(inventoryBalances)
        .innerJoin(warehouses, eq(inventoryBalances.warehouseId, warehouses.id))
        .where(eq(inventoryBalances.variantId, variantId));

    return results.map((r) => ({
        ...r,
        available: r.onHand - r.reserved,
    }));
}

/**
 * Adjust stock and record a movement in an atomic transaction
 */
export async function adjustStock(
    variantId: number,
    warehouseId: number,
    movement: StockMovementInput,
): Promise<void> {
    await db.transaction(async (tx) => {
        // 1. Update/Upsert balance
        await tx
            .insert(inventoryBalances)
            .values({
                variantId,
                warehouseId,
                onHand: movement.quantity,
                reserved: 0,
            })
            .onConflictDoUpdate({
                target: [inventoryBalances.variantId, inventoryBalances.warehouseId],
                set: {
                    onHand: sql`${inventoryBalances.onHand} + ${movement.quantity}`,
                },
            });

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
 * Reserve stock in an atomic transaction with lock
 */
export async function reserveStock(
    variantId: number,
    warehouseId: number,
    quantity: number,
    orderId: string,
): Promise<boolean> {
    return await db.transaction(async (tx) => {
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

        const available = (balance?.onHand || 0) - (balance?.reserved || 0);
        if (available < quantity) return false;

        // Update reservation
        await tx
            .insert(inventoryBalances)
            .values({
                variantId,
                warehouseId,
                onHand: 0,
                reserved: quantity,
            })
            .onConflictDoUpdate({
                target: [inventoryBalances.variantId, inventoryBalances.warehouseId],
                set: {
                    reserved: sql`${inventoryBalances.reserved} + ${quantity}`,
                },
            });

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
 * Release a stock reservation in an atomic transaction
 */
export async function releaseReservation(
    variantId: number,
    warehouseId: number,
    quantity: number,
    orderId: string,
): Promise<void> {
    await db.transaction(async (tx) => {
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

/**
 * Get low stock variants (available quantity below threshold)
 */
export async function getLowStock(threshold?: number) {
    const results = await db
        .select({
            variant: productVariants,
            balance: inventoryBalances,
            warehouseCode: warehouses.code,
        })
        .from(inventoryBalances)
        .innerJoin(productVariants, eq(inventoryBalances.variantId, productVariants.id))
        .innerJoin(warehouses, eq(inventoryBalances.warehouseId, warehouses.id))
        .where(
            threshold !== undefined
                ? sql`${inventoryBalances.onHand} - ${inventoryBalances.reserved} <= ${threshold}`
                : sql`${inventoryBalances.onHand} - ${inventoryBalances.reserved} <= 5`,
        )
        .orderBy(desc(productVariants.id));

    return results.map((r) => ({
        variant: r.variant,
        balance: {
            variantId: r.balance.variantId,
            warehouseId: r.balance.warehouseId,
            warehouseCode: r.warehouseCode,
            onHand: r.balance.onHand,
            reserved: r.balance.reserved,
            available: r.balance.onHand - r.balance.reserved,
        },
    }));
}
