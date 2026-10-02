import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '@findeg/db/schema';
import {
  categories,
  inventoryBalances,
  orders,
  products,
  productVariants,
  stockMovements,
  stockReservations,
  warehouses,
} from '@findeg/db/schema';
import {
  consumeOrderStock,
  InsufficientStockError,
  releaseOrderStock,
  reserveOrderStock,
  StockReservationStateError,
} from '@findeg/db/queries';
import {
  connectToTestDatabase,
  runConcurrently,
  waitUntilBlocked,
  type TestDatabase,
} from '../../../testing/postgres';

describe('Stock Reservation primitives on real Postgres', () => {
  let testDb: TestDatabase;
  let sequence = 0;

  beforeAll(() => {
    testDb = connectToTestDatabase();
  });
  afterAll(async () => testDb.close());

  async function variant() {
    sequence += 1;
    const [category] = await testDb.db
      .insert(categories)
      .values({ slug: `sr-category-${sequence}` })
      .returning();
    const [product] = await testDb.db
      .insert(products)
      .values({
        slug: `sr-product-${sequence}`,
        localizedName: { en: 'Pen', ar: 'قلم' },
        localizedDescription: { en: '' },
        localizedLongDescription: { en: '' },
        categoryId: category.id,
      })
      .returning();
    const [row] = await testDb.db
      .insert(productVariants)
      .values({
        productId: product.id,
        variantKey: 'default',
        sku: `SR-${sequence}`,
        basePrice: '10.00',
      })
      .returning();
    return { productId: product.id, variantId: row.id };
  }

  async function warehouse(isActive = true) {
    sequence += 1;
    const [row] = await testDb.db
      .insert(warehouses)
      .values({ code: `sr-warehouse-${sequence}`, name: 'W', isActive })
      .returning();
    return row.id;
  }

  async function stock(variantId: number, warehouseId: number, onHand: number) {
    await testDb.db.insert(inventoryBalances).values({ variantId, warehouseId, onHand });
  }

  async function order() {
    const [row] = await testDb.db
      .insert(orders)
      .values({ guestEmail: 'g@example.com', totalAmount: '10.00' })
      .returning();
    return row.id;
  }

  async function balance(variantId: number, warehouseId: number) {
    const [row] = await testDb.db
      .select()
      .from(inventoryBalances)
      .where(
        and(
          eq(inventoryBalances.variantId, variantId),
          eq(inventoryBalances.warehouseId, warehouseId),
        ),
      );
    return row;
  }

  const movementTypes = async (orderId: number) =>
    (
      await testDb.db
        .select()
        .from(stockMovements)
        .where(eq(stockMovements.referenceId, String(orderId)))
    )
      .map((m) => m.movementType)
      .sort();

  it('reserves greedily across warehouses, recording a reservation and movement per reserved line', async () => {
    const { variantId } = await variant();
    const [first, second] = [await warehouse(), await warehouse()];
    await stock(variantId, first, 3);
    await stock(variantId, second, 5);
    const orderId = await order();

    const reserved = await testDb.db.transaction((tx) =>
      reserveOrderStock(orderId, [{ variantId, quantity: 6 }], tx),
    );

    expect(reserved).toEqual([
      { variantId, warehouseId: first, quantity: 3 },
      { variantId, warehouseId: second, quantity: 3 },
    ]);
    expect(await balance(variantId, first)).toMatchObject({ onHand: 3, reserved: 3 });
    expect(await balance(variantId, second)).toMatchObject({ onHand: 5, reserved: 3 });
    expect(
      await testDb.db
        .select()
        .from(stockReservations)
        .where(eq(stockReservations.orderId, orderId)),
    ).toHaveLength(2);
    expect(await movementTypes(orderId)).toEqual(['reserve', 'reserve']);
  });

  it('skips inactive warehouses', async () => {
    const { variantId } = await variant();
    const [inactive, active] = [await warehouse(false), await warehouse()];
    await stock(variantId, inactive, 9);
    await stock(variantId, active, 2);

    const reserved = await reserveOrderStock(await order(), [{ variantId, quantity: 2 }]);

    expect(reserved).toEqual([{ variantId, warehouseId: active, quantity: 2 }]);
  });

  it('aggregates duplicate variants before reserving', async () => {
    const { variantId } = await variant();
    const warehouseId = await warehouse();
    await stock(variantId, warehouseId, 5);
    const orderId = await order();

    await reserveOrderStock(orderId, [
      { variantId, quantity: 2 },
      { variantId, quantity: 3 },
    ]);

    expect(await balance(variantId, warehouseId)).toMatchObject({ reserved: 5 });
    expect(await movementTypes(orderId)).toEqual(['reserve']);
  });

  it('throws on a shortfall, naming each short variant, and rolls the whole transaction back', async () => {
    const [a, b] = [await variant(), await variant()];
    const warehouseId = await warehouse();
    await stock(a.variantId, warehouseId, 10);
    await stock(b.variantId, warehouseId, 1);
    const orderId = await order();

    const attempt = testDb.db.transaction((tx) =>
      reserveOrderStock(
        orderId,
        [
          { variantId: a.variantId, quantity: 4 },
          { variantId: b.variantId, quantity: 3 },
        ],
        tx,
      ),
    );

    await expect(attempt).rejects.toBeInstanceOf(InsufficientStockError);
    await expect(attempt).rejects.toMatchObject({
      shortfalls: [{ variantId: b.variantId, requested: 3, available: 1 }],
    });
    expect(await balance(a.variantId, warehouseId)).toMatchObject({ reserved: 0 });
    expect(await balance(b.variantId, warehouseId)).toMatchObject({ reserved: 0 });
    expect(await movementTypes(orderId)).toEqual([]);
  });

  it('consumes a reservation: on_hand and reserved drop, once per order', async () => {
    const { variantId } = await variant();
    const warehouseId = await warehouse();
    await stock(variantId, warehouseId, 5);
    const orderId = await order();
    await reserveOrderStock(orderId, [{ variantId, quantity: 2 }]);

    expect(await consumeOrderStock(orderId)).toBe(true);
    expect(await consumeOrderStock(orderId)).toBe(false);

    expect(await balance(variantId, warehouseId)).toMatchObject({ onHand: 3, reserved: 0 });
    expect(await movementTypes(orderId)).toEqual(['consume', 'reserve']);
  });

  it('releases a reservation: only reserved drops, once per order', async () => {
    const { variantId } = await variant();
    const warehouseId = await warehouse();
    await stock(variantId, warehouseId, 5);
    const orderId = await order();
    await reserveOrderStock(orderId, [{ variantId, quantity: 2 }]);

    expect(await releaseOrderStock(orderId)).toBe(true);
    expect(await releaseOrderStock(orderId)).toBe(false);

    expect(await balance(variantId, warehouseId)).toMatchObject({ onHand: 5, reserved: 0 });
    expect(await movementTypes(orderId)).toEqual(['release', 'reserve']);
  });

  it('refuses to settle a reservation the other way', async () => {
    const { variantId } = await variant();
    const warehouseId = await warehouse();
    await stock(variantId, warehouseId, 5);
    const orderId = await order();
    await reserveOrderStock(orderId, [{ variantId, quantity: 2 }]);
    await releaseOrderStock(orderId);

    await expect(consumeOrderStock(orderId)).rejects.toBeInstanceOf(StockReservationStateError);
    expect(await balance(variantId, warehouseId)).toMatchObject({ onHand: 5, reserved: 0 });
  });

  it('keeps the immutable reservation row intact', async () => {
    const { variantId } = await variant();
    const warehouseId = await warehouse();
    await stock(variantId, warehouseId, 5);
    const orderId = await order();
    await reserveOrderStock(orderId, [{ variantId, quantity: 2 }]);

    await expect(
      testDb.db
        .update(stockReservations)
        .set({ quantity: 1 })
        .where(eq(stockReservations.orderId, orderId)),
    ).rejects.toThrow();
    await expect(
      testDb.db.delete(stockReservations).where(eq(stockReservations.orderId, orderId)),
    ).rejects.toThrow();
  });

  it('lets exactly one of two orders racing for the last unit succeed', async () => {
    const { variantId } = await variant();
    const warehouseId = await warehouse();
    await stock(variantId, warehouseId, 1);
    const [first, second] = [await order(), await order()];

    let firstHasReserved!: () => void;
    const reserved = new Promise<void>((resolve) => (firstHasReserved = resolve));

    const [winner, loser] = await runConcurrently(
      async (sql, peer) => {
        const db = drizzle(sql, { schema });
        return db.transaction(async (tx) => {
          const result = await reserveOrderStock(first, [{ variantId, quantity: 1 }], tx);
          firstHasReserved();
          // Hold the lock until the other order is provably queued behind it.
          await waitUntilBlocked(testDb.sql, peer.pid);
          return result;
        });
      },
      async (sql) => {
        await reserved;
        const db = drizzle(sql, { schema });
        return db
          .transaction((tx) => reserveOrderStock(second, [{ variantId, quantity: 1 }], tx))
          .catch((error: unknown) => error);
      },
    );

    expect(winner).toEqual([{ variantId, warehouseId, quantity: 1 }]);
    expect(loser).toBeInstanceOf(InsufficientStockError);
    expect(await balance(variantId, warehouseId)).toMatchObject({ onHand: 1, reserved: 1 });
  });

  describe('CHECK (on_hand >= reserved AND reserved >= 0)', () => {
    it('rejects a direct negative write', async () => {
      const { variantId } = await variant();
      const warehouseId = await warehouse();
      await stock(variantId, warehouseId, 2);

      await expect(
        testDb.db
          .update(inventoryBalances)
          .set({ reserved: -1 })
          .where(eq(inventoryBalances.variantId, variantId)),
      ).rejects.toThrow();
      await expect(
        testDb.db
          .update(inventoryBalances)
          .set({ reserved: 3 })
          .where(eq(inventoryBalances.variantId, variantId)),
      ).rejects.toThrow();
    });
  });
});
