import { db } from "../../../core/infrastructure/persistence";
import {
  inventoryBalances,
  stockMovements,
  warehouses,
  productVariants,
} from "../../../core/infrastructure/persistence/schema";
import {
  IInventoryRepository,
  InventoryBalanceResult,
  StockMovementInput,
  LowStockResult,
} from "../../application/interfaces/IInventoryRepository";
import { DrizzleVariantRepository } from "./DrizzleVariantRepository";
import { eq, and, sql, desc } from "drizzle-orm";
import { ID } from "@findeg/backend/features/core/domain/types/common";

/**
 * Drizzle Inventory Repository
 *
 * Implements multi-warehouse inventory tracking and stock movement auditing.
 */
export class DrizzleInventoryRepository implements IInventoryRepository {
  private variantRepo = new DrizzleVariantRepository();

  async getBalance(variantId: ID, warehouseId?: ID): Promise<InventoryBalanceResult | null> {
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

  async getAllBalances(variantId: ID): Promise<InventoryBalanceResult[]> {
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
   * Adjusts stock and records a movement in an atomic transaction.
   */
  async adjustStock(variantId: ID, warehouseId: ID, movement: StockMovementInput): Promise<void> {
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

  async reserveStock(
    variantId: ID,
    warehouseId: ID,
    quantity: number,
    orderId: string,
  ): Promise<boolean> {
    return await db.transaction(async (tx) => {
      // Check available
      const [balance] = await tx
        .select()
        .from(inventoryBalances)
        .where(
          and(
            eq(inventoryBalances.variantId, variantId),
            eq(inventoryBalances.warehouseId, warehouseId),
          ),
        )
        .for("update");

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
        movementType: "reserve",
        quantity,
        referenceType: "order",
        referenceId: orderId,
        notes: `Reservation for order ${orderId}`,
      });

      return true;
    });
  }

  async releaseReservation(
    variantId: ID,
    warehouseId: ID,
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
        movementType: "unreserve",
        quantity,
        referenceType: "order",
        referenceId: orderId,
        notes: `Release reservation for order ${orderId}`,
      });
    });
  }

  async getLowStock(threshold?: number): Promise<LowStockResult[]> {
    const results = await db
      .select({
        v: productVariants,
        bal: inventoryBalances,
        whCode: warehouses.code,
      })
      .from(inventoryBalances)
      .innerJoin(productVariants, eq(inventoryBalances.variantId, productVariants.id))
      .innerJoin(warehouses, eq(inventoryBalances.warehouseId, warehouses.id))
      .where(
        threshold !== undefined
          ? sql`${inventoryBalances.onHand} - ${inventoryBalances.reserved} <= ${threshold}`
          : sql`${inventoryBalances.onHand} - ${inventoryBalances.reserved} <= ${productVariants.lowStockThreshold}`,
      )
      .orderBy(desc(sql`${inventoryBalances.onHand} - ${inventoryBalances.reserved}`));

    if (results.length === 0) return [];

    const variantIds = results.map((r) => r.v.id);
    const variants = await Promise.all(variantIds.map((id) => this.variantRepo.getById(id)));

    return results.map((r, idx) => ({
      variant: variants[idx]!,
      balance: {
        variantId: r.bal.variantId,
        warehouseId: r.bal.warehouseId,
        warehouseCode: r.whCode,
        onHand: r.bal.onHand,
        reserved: r.bal.reserved,
        available: r.bal.onHand - r.bal.reserved,
      },
    }));
  }
}
