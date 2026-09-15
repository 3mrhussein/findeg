import { and, eq, inArray } from 'drizzle-orm';
import type { TransactionDatabase } from '@findeg/db/transactions';
import {
  inventoryBalances,
  stockMovements,
  warehouses,
  orderReservations,
  orderFulfillments,
} from '@findeg/db/modules/inventory';
import {
  InventoryVariantNotFoundError,
  type InventoryReservations,
  type InventoryStore,
} from '../public.js';

export function bindInventoryReservations(database: TransactionDatabase): InventoryReservations {
  return {
    async reserve(reference, items) {
      for (const item of [...items].sort((left, right) => left.variantId - right.variantId)) {
        const rows = await database
          .select({ balance: inventoryBalances })
          .from(inventoryBalances)
          .innerJoin(warehouses, eq(warehouses.id, inventoryBalances.warehouseId))
          .where(
            and(eq(inventoryBalances.variantId, item.variantId), eq(warehouses.isActive, true)),
          )
          .orderBy(warehouses.id, inventoryBalances.id)
          .for('update');
        if (
          rows.reduce((total, { balance }) => total + balance.onHand - balance.reserved, 0) <
          item.quantity
        ) {
          return false;
        }
        let remaining = item.quantity;
        for (const { balance } of rows) {
          const quantity = Math.min(remaining, balance.onHand - balance.reserved);
          if (!quantity) continue;
          await database
            .update(inventoryBalances)
            .set({ reserved: balance.reserved + quantity, updatedAt: new Date() })
            .where(eq(inventoryBalances.id, balance.id));
          await database.insert(orderReservations).values({
            orderReference: reference,
            variantId: item.variantId,
            warehouseId: balance.warehouseId,
            quantity,
          });
          await database.insert(stockMovements).values({
            variantId: item.variantId,
            warehouseId: balance.warehouseId,
            quantity: -quantity,
            movementType: 'order-reservation',
            referenceType: 'accepted-order',
            referenceId: reference,
          });
          remaining -= quantity;
          if (!remaining) break;
        }
      }
      return true;
    },
  };
}

export function bindInventoryStore(database: TransactionDatabase): InventoryStore {
  return {
    async adjustOnHand(input) {
      const [warehouse] = await database
        .select({ id: warehouses.id })
        .from(warehouses)
        .where(and(eq(warehouses.id, input.warehouseId), eq(warehouses.isActive, true)))
        .for('update');
      if (!warehouse) return 'not-found';
      try {
        await database
          .insert(inventoryBalances)
          .values({
            variantId: input.variantId,
            warehouseId: input.warehouseId,
            onHand: 0,
            reserved: 0,
          })
          .onConflictDoNothing();
      } catch (error) {
        if (isForeignKeyViolation(error)) throw new InventoryVariantNotFoundError();
        throw error;
      }
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

function isForeignKeyViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23503';
}

export function bindInventoryFulfillment(
  database: TransactionDatabase,
): import('../public.js').InventoryFulfillment {
  return {
    async deliver(reference, actorId) {
      const [marker] = await database
        .insert(orderFulfillments)
        .values({ orderReference: reference, actorId })
        .onConflictDoNothing()
        .returning();
      if (!marker) return true;
      const reservations = await database
        .select()
        .from(orderReservations)
        .where(eq(orderReservations.orderReference, reference))
        .orderBy(orderReservations.variantId, orderReservations.warehouseId);
      if (!reservations.length) return false;
      for (const reservation of reservations) {
        const [balance] = await database
          .select()
          .from(inventoryBalances)
          .where(
            and(
              eq(inventoryBalances.variantId, reservation.variantId),
              eq(inventoryBalances.warehouseId, reservation.warehouseId),
            ),
          )
          .for('update');
        if (
          !balance ||
          balance.reserved < reservation.quantity ||
          balance.onHand < reservation.quantity
        )
          return false;
        await database
          .update(inventoryBalances)
          .set({
            onHand: balance.onHand - reservation.quantity,
            reserved: balance.reserved - reservation.quantity,
            updatedAt: new Date(),
          })
          .where(eq(inventoryBalances.id, balance.id));
        await database.insert(stockMovements).values({
          variantId: reservation.variantId,
          warehouseId: reservation.warehouseId,
          quantity: -reservation.quantity,
          movementType: 'order-delivery',
          referenceType: 'accepted-order',
          referenceId: reference,
          createdBy: actorId,
        });
      }
      return true;
    },
  };
}
