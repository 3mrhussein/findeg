import { and, eq, inArray } from 'drizzle-orm';
import type { TransactionDatabase } from '@findeg/db/transactions';
import { inventoryBalances, stockMovements, warehouses } from '@findeg/db/modules/inventory';
import type { InventoryStore } from '../public.js';

export function bindInventoryStore(database: TransactionDatabase): InventoryStore {
  return {
    async adjustOnHand(input) {
      const [warehouse] = await database
        .select({ id: warehouses.id })
        .from(warehouses)
        .where(and(eq(warehouses.id, input.warehouseId), eq(warehouses.isActive, true)))
        .for('update');
      if (!warehouse) return 'not-found';
      await database
        .insert(inventoryBalances)
        .values({
          variantId: input.variantId,
          warehouseId: input.warehouseId,
          onHand: 0,
          reserved: 0,
        })
        .onConflictDoNothing();
      const [balance] = await database
        .select()
        .from(inventoryBalances)
        .where(
          and(
            eq(inventoryBalances.variantId, input.variantId),
            eq(inventoryBalances.warehouseId, input.warehouseId),
          ),
        )
        .for('update');
      if (!balance) return 'not-found';
      const nextOnHand = balance.onHand + input.quantityDelta;
      if (nextOnHand < balance.reserved) return 'insufficient-stock';
      await database
        .update(inventoryBalances)
        .set({ onHand: nextOnHand, updatedAt: new Date() })
        .where(eq(inventoryBalances.id, balance.id));
      await database.insert(stockMovements).values({
        variantId: input.variantId,
        warehouseId: input.warehouseId,
        quantity: input.quantityDelta,
        movementType: 'manual-adjustment',
        referenceType: 'back-office',
        notes: input.notes,
        createdBy: input.actorId,
      });
      return 'adjusted';
    },
    async availabilityFor(variantIds) {
      if (!variantIds.length) return new Map();
      const balances = await database
        .select({
          variantId: inventoryBalances.variantId,
          onHand: inventoryBalances.onHand,
          reserved: inventoryBalances.reserved,
        })
        .from(inventoryBalances)
        .where(inArray(inventoryBalances.variantId, [...variantIds]));
      const totals = new Map<number, number>();
      for (const balance of balances)
        totals.set(
          balance.variantId,
          (totals.get(balance.variantId) ?? 0) + balance.onHand - balance.reserved,
        );
      return totals;
    },
  };
}
