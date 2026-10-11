import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import {
  categories,
  inventoryBalances,
  orders,
  products,
  productVariants,
  stockMovements,
  warehouses,
} from '@findeg/db/schema';
import { inventoryQueries, orderQueries } from '@findeg/db/queries';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';

class Rollback extends Error {}

describe('tx-aware order and inventory queries on real Postgres', () => {
  let testDb: TestDatabase;
  let sequence = 0;

  beforeAll(() => {
    testDb = connectToTestDatabase();
  });
  afterAll(async () => testDb.close());

  async function stockedVariant(onHand = 10) {
    sequence += 1;
    const [category] = await testDb.db
      .insert(categories)
      .values({ slug: `tx-category-${sequence}` })
      .returning();
    const [product] = await testDb.db
      .insert(products)
      .values({
        slug: `tx-product-${sequence}`,
        localizedName: { en: 'Pen', ar: 'قلم' },
        localizedDescription: { en: '' },
        localizedLongDescription: { en: '' },
        categoryId: category.id,
      })
      .returning();
    const [variant] = await testDb.db
      .insert(productVariants)
      .values({
        productId: product.id,
        variantKey: 'default',
        sku: `TX-${sequence}`,
        basePrice: '10.00',
      })
      .returning();
    const [warehouse] = await testDb.db
      .insert(warehouses)
      .values({ code: `tx-warehouse-${sequence}`, name: 'Main' })
      .returning();
    await testDb.db
      .insert(inventoryBalances)
      .values({ variantId: variant.id, warehouseId: warehouse.id, onHand, reserved: 0 });
    return { productId: product.id, variantId: variant.id, warehouseId: warehouse.id };
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

  async function movements(variantId: number) {
    return testDb.db.select().from(stockMovements).where(eq(stockMovements.variantId, variantId));
  }

  const orderInput = (productId: number, variantId: number) => ({
    guestEmail: 'guest@example.com',
    subtotal: '20.00',
    shippingCost: '5.00',
    totalAmount: '25.00',
    items: [{ productId, variantId, quantity: 2, unitPriceSnapshot: '10.00', totalPrice: '20.00' }],
  });

  describe('without tx', () => {
    it('creates an order with its items', async () => {
      const { productId, variantId } = await stockedVariant();

      const { order, items } = await orderQueries.create(orderInput(productId, variantId));

      expect(order).toMatchObject({ status: 'pending', paymentStatus: 'unpaid', currency: 'EGP' });
      expect(items).toHaveLength(1);
    });

    it('updates mutable order fields', async () => {
      const { productId, variantId } = await stockedVariant();
      const { order } = await orderQueries.create(orderInput(productId, variantId));

      await orderQueries.updateOrder(order.id, {
        trackingNumber: 'TRK-1',
        adminNotes: 'handed over',
      });

      const [row] = await testDb.db.select().from(orders).where(eq(orders.id, order.id));
      expect(row).toMatchObject({
        status: 'pending',
        trackingNumber: 'TRK-1',
        adminNotes: 'handed over',
      });
    });

    it('does not expose status or payment changes through the generic update primitive', async () => {
      const { productId, variantId } = await stockedVariant();
      const { order } = await orderQueries.create(orderInput(productId, variantId));

      await expect(orderQueries.updateOrder(order.id, { status: 'confirmed' })).rejects.toThrow(
        'Cannot update frozen order snapshot column: status',
      );
      await expect(
        orderQueries.updateOrder(order.id, { paymentStatus: 'paid' } as never),
      ).rejects.toThrow('Cannot update frozen order snapshot column: paymentStatus');
    });

    it('searches Order Reference even when the search is numeric-looking', async () => {
      const { productId, variantId } = await stockedVariant();
      const { order } = await orderQueries.create({
        ...orderInput(productId, variantId),
        orderReference: 'FE-123456',
      });

      const result = await orderQueries.getFiltered({ search: '123456' });

      expect(result.orders.map(({ order }) => order.id)).toContain(order.id);
    });

    it('reserves stock, then releases it', async () => {
      const { variantId, warehouseId } = await stockedVariant(5);

      expect(await inventoryQueries.reserveStock(variantId, warehouseId, 3, 'order-1')).toBe(true);
      expect(await balance(variantId, warehouseId)).toMatchObject({ onHand: 5, reserved: 3 });

      await inventoryQueries.releaseReservation(variantId, warehouseId, 3, 'order-1');
      expect(await balance(variantId, warehouseId)).toMatchObject({ onHand: 5, reserved: 0 });
      expect((await movements(variantId)).map((m) => m.movementType).sort()).toEqual([
        'reserve',
        'unreserve',
      ]);
    });

    it('refuses to reserve more than is available and writes nothing', async () => {
      const { variantId, warehouseId } = await stockedVariant(2);

      expect(await inventoryQueries.reserveStock(variantId, warehouseId, 3, 'order-2')).toBe(false);
      expect(await balance(variantId, warehouseId)).toMatchObject({ onHand: 2, reserved: 0 });
      expect(await movements(variantId)).toHaveLength(0);
    });
  });

  describe('with tx', () => {
    it('composes create, metadata update and reserve in one transaction that commits together', async () => {
      const { productId, variantId, warehouseId } = await stockedVariant();

      const { order } = await testDb.db.transaction(async (tx) => {
        const created = await orderQueries.create(orderInput(productId, variantId), tx);
        await orderQueries.updateOrder(created.order.id, { adminNotes: 'reserved' }, tx);
        await inventoryQueries.reserveStock(
          variantId,
          warehouseId,
          2,
          String(created.order.id),
          tx,
        );
        return created;
      });

      const [row] = await testDb.db.select().from(orders).where(eq(orders.id, order.id));
      expect(row).toMatchObject({ status: 'pending', adminNotes: 'reserved' });
      expect(await balance(variantId, warehouseId)).toMatchObject({ reserved: 2 });
    });

    it('reports insufficient stock inside the caller transaction without writing', async () => {
      const { variantId, warehouseId } = await stockedVariant(1);

      const reserved = await testDb.db.transaction((tx) =>
        inventoryQueries.reserveStock(variantId, warehouseId, 2, 'order-3', tx),
      );

      expect(reserved).toBe(false);
      expect(await balance(variantId, warehouseId)).toMatchObject({ onHand: 1, reserved: 0 });
      expect(await movements(variantId)).toHaveLength(0);
    });

    it('rolls back every write when the caller aborts its transaction', async () => {
      const { productId, variantId, warehouseId } = await stockedVariant();
      let orderId = 0;

      await expect(
        testDb.db.transaction(async (tx) => {
          const created = await orderQueries.create(orderInput(productId, variantId), tx);
          orderId = created.order.id;
          await inventoryQueries.reserveStock(variantId, warehouseId, 2, String(orderId), tx);
          throw new Rollback();
        }),
      ).rejects.toThrow(Rollback);

      expect(await testDb.db.select().from(orders).where(eq(orders.id, orderId))).toHaveLength(0);
      expect(await balance(variantId, warehouseId)).toMatchObject({ reserved: 0 });
      expect(await movements(variantId)).toHaveLength(0);
    });

    it('rolls back release, metadata and payment updates with the caller transaction', async () => {
      const { productId, variantId, warehouseId } = await stockedVariant();
      const { order } = await orderQueries.create(orderInput(productId, variantId));
      await inventoryQueries.reserveStock(variantId, warehouseId, 2, String(order.id));

      await expect(
        testDb.db.transaction(async (tx) => {
          await inventoryQueries.releaseReservation(
            variantId,
            warehouseId,
            2,
            String(order.id),
            tx,
          );
          await orderQueries.updateOrder(order.id, { adminNotes: 'cancelled' }, tx);
          throw new Rollback();
        }),
      ).rejects.toThrow(Rollback);

      const [row] = await testDb.db.select().from(orders).where(eq(orders.id, order.id));
      expect(row).toMatchObject({
        status: 'pending',
        paymentStatus: 'unpaid',
        adminNotes: null,
      });
      expect(await balance(variantId, warehouseId)).toMatchObject({ reserved: 2 });
    });
  });
});
