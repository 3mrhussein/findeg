import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import {
  categories,
  inventoryBalances,
  orders,
  orderItems,
  products,
  productVariants,
  stockReservations,
  users,
  warehouses,
} from '@findeg/db/schema';
import { createCheckoutService, isValidOrderReference } from '../index';
import { orderQueries } from '@findeg/db/queries';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';

describe('Checkout feature integration tests on real Postgres', () => {
  let testDb: TestDatabase;
  let sequence = 0;
  const checkoutService = createCheckoutService({ shippingFee: 50 });

  beforeAll(() => {
    testDb = connectToTestDatabase();
  });
  afterAll(async () => testDb.close());

  async function createVariantWithStock(
    opts: {
      price?: string;
      onHand?: number;
      isActive?: boolean;
      productIsActive?: boolean;
    } = {},
  ) {
    sequence += 1;
    const price = opts.price ?? '25.00';
    const onHand = opts.onHand ?? 10;
    const isActive = opts.isActive ?? true;
    const productIsActive = opts.productIsActive ?? true;

    const [category] = await testDb.db
      .insert(categories)
      .values({ slug: `co-cat-${sequence}` })
      .returning();

    const [product] = await testDb.db
      .insert(products)
      .values({
        localizedName: { en: `Notebook ${sequence}`, ar: `كشكول ${sequence}` },
        localizedDescription: { en: 'A nice notebook' },
        localizedLongDescription: { en: 'A very nice notebook' },
        categoryId: category.id,
        isActive: productIsActive,
      })
      .returning();

    const [variant] = await testDb.db
      .insert(productVariants)
      .values({
        productId: product.id,
        variantKey: 'default',
        sku: `VAR-SKU-${sequence}`,
        basePrice: price,
        isActive,
        localizedLabel: { en: 'Blue, 80 pages' },
      })
      .returning();

    const [warehouse] = await testDb.db
      .insert(warehouses)
      .values({ code: `co-wh-${sequence}`, name: 'Cairo Main' })
      .returning();

    await testDb.db.insert(inventoryBalances).values({
      variantId: variant.id,
      warehouseId: warehouse.id,
      onHand,
      reserved: 0,
    });

    return {
      productId: product.id,
      variantId: variant.id,
      warehouseId: warehouse.id,
      price: Number(price),
    };
  }

  const validAddress = {
    fullName: 'Ahmed Hassan',
    phone: '01012345678',
    city: 'Cairo',
    area: 'Nasr City',
    street: 'Abbas El Akkad',
    building: '15',
    floor: '4',
    apartment: '402',
  };

  describe('POST /checkout/validate seam', () => {
    it('returns lines, unit prices, per-line discounts, shipping, total, currency and confirmation', async () => {
      const item1 = await createVariantWithStock({ price: '40.00', onHand: 10 });
      const item2 = await createVariantWithStock({ price: '15.00', onHand: 10 });

      const result = await checkoutService.validate({
        source: 'cart',
        lines: [
          { variantId: item1.variantId, quantity: 2 },
          { variantId: item2.variantId, quantity: 3 },
        ],
      });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.currency).toBe('EGP');
      expect(result.data.shipping).toBe(50);
      expect(result.data.subtotal).toBe(125); // (2 * 40) + (3 * 15) = 80 + 45 = 125
      expect(result.data.total).toBe(175); // 125 + 50 = 175
      expect(result.data.lines).toHaveLength(2);
      expect(result.data.lines[0]).toMatchObject({
        variantId: item1.variantId,
        quantity: 2,
        unitPrice: 40,
        discounts: [],
        lineTotal: 80,
      });
      expect(result.data.lines[1]).toMatchObject({
        variantId: item2.variantId,
        quantity: 3,
        unitPrice: 15,
        discounts: [],
        lineTotal: 45,
      });
      expect(result.data.confirmation).toMatch(/^[0-9a-f]{64}$/);
    });

    it('never trusts client prices (reads authoritative catalog prices)', async () => {
      const item = await createVariantWithStock({ price: '100.00', onHand: 5 });

      // Client passes only variantId and quantity, client has no way to inject price
      const result = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
      });

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.lines[0].unitPrice).toBe(100);
      expect(result.data.total).toBe(150); // 100 + 50 shipping
    });

    it('generates a stable confirmation digest independent of input line ordering', async () => {
      const item1 = await createVariantWithStock({ price: '30.00' });
      const item2 = await createVariantWithStock({ price: '20.00' });

      const resultA = await checkoutService.validate({
        source: 'cart',
        lines: [
          { variantId: item1.variantId, quantity: 1 },
          { variantId: item2.variantId, quantity: 2 },
        ],
      });

      const resultB = await checkoutService.validate({
        source: 'cart',
        lines: [
          { variantId: item2.variantId, quantity: 2 },
          { variantId: item1.variantId, quantity: 1 },
        ],
      });

      expect(resultA.success && resultB.success).toBe(true);
      if (!resultA.success || !resultB.success) return;
      expect(resultA.data.confirmation).toBe(resultB.data.confirmation);
    });

    it('changes confirmation digest when any term changes (price, quantity, shipping)', async () => {
      const item = await createVariantWithStock({ price: '30.00' });

      const quote1 = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
      });

      const quote2 = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 2 }],
      });

      expect(quote1.success && quote2.success).toBe(true);
      if (!quote1.success || !quote2.success) return;
      expect(quote1.data.confirmation).not.toBe(quote2.data.confirmation);
    });

    it('rejects unavailable or inactive variants', async () => {
      const inactive = await createVariantWithStock({ isActive: false });

      const result = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: inactive.variantId, quantity: 1 }],
      });

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('unavailable-variant');
    });

    it('rejects empty lines array', async () => {
      const result = await checkoutService.validate({
        source: 'cart',
        lines: [],
      });

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('validation-error');
    });
  });

  describe('POST /checkout/order seam', () => {
    it('accepts order, reserves stock, freezes snapshots and returns Order Reference in one transaction', async () => {
      const item = await createVariantWithStock({ price: '60.00', onHand: 10 });

      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 2 }],
      });
      expect(quote.success).toBe(true);
      if (!quote.success) return;

      const acceptResult = await checkoutService.accept({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 2 }],
        confirmation: quote.data.confirmation,
        paymentMethod: 'cod',
        address: validAddress,
        guestEmail: 'guest@example.com',
      });

      expect(acceptResult.success).toBe(true);
      if (!acceptResult.success) return;

      const orderData = acceptResult.data.order;
      expect(orderData.status).toBe('pending');
      expect(orderData.paymentStatus).toBe('unpaid');
      expect(orderData.totalAmount).toBe('170.00'); // 120 + 50
      expect(isValidOrderReference(orderData.orderReference)).toBe(true);

      // Verify row in database
      const [orderRow] = await testDb.db.select().from(orders).where(eq(orders.id, orderData.id));
      expect(orderRow).toBeDefined();
      expect(orderRow.orderReference).toBe(orderData.orderReference);
      expect(orderRow.guestEmail).toBe('guest@example.com');
      expect(orderRow.subtotal).toBe('120.00');
      expect(orderRow.shippingCost).toBe('50.00');
      expect(orderRow.totalAmount).toBe('170.00');
      expect(orderRow.currency).toBe('EGP');
      expect(orderRow.paymentMethod).toBe('cod');
      expect(orderRow.shippingAddressSnapshot).toMatchObject(validAddress);

      // Verify order items in database
      const itemRows = await testDb.db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderData.id));
      expect(itemRows).toHaveLength(1);
      expect(itemRows[0].variantId).toBe(item.variantId);
      expect(itemRows[0].quantity).toBe(2);
      expect(itemRows[0].unitPriceSnapshot).toBe('60.00');
      expect(itemRows[0].totalPrice).toBe('120.00');
      expect(itemRows[0].productNameSnapshot).toContain('Notebook');
      expect(itemRows[0].productSkuSnapshot).toMatch(/^VAR-SKU-/);
      expect(itemRows[0].variantSkuSnapshot).toMatch(/^VAR-SKU-/);

      // Verify stock reservation in database
      const reservations = await testDb.db
        .select()
        .from(stockReservations)
        .where(eq(stockReservations.orderId, orderData.id));
      expect(reservations).toHaveLength(1);
      expect(reservations[0].quantity).toBe(2);
      expect(reservations[0].variantId).toBe(item.variantId);

      // Verify inventory balance: reserved incremented
      const [bal] = await testDb.db
        .select()
        .from(inventoryBalances)
        .where(eq(inventoryBalances.variantId, item.variantId));
      expect(bal.onHand).toBe(10);
      expect(bal.reserved).toBe(2);
    });

    it('supports signed-in customers with userId', async () => {
      sequence += 1;
      const [user] = await testDb.db
        .insert(users)
        .values({
          email: `user-${sequence}@example.com`,
          firstName: 'Fatima',
          lastName: 'Ali',
        })
        .returning();

      const item = await createVariantWithStock({ price: '20.00', onHand: 5 });
      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
      });
      if (!quote.success) return;

      const acceptResult = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: item.variantId, quantity: 1 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'should-be-ignored@example.com',
        },
        { userId: user.id },
      );

      expect(acceptResult.success).toBe(true);
      if (!acceptResult.success) return;

      const [orderRow] = await testDb.db
        .select()
        .from(orders)
        .where(eq(orders.id, acceptResult.data.order.id));
      expect(orderRow.userId).toBe(user.id);
      expect(orderRow.guestEmail).toBeNull();
    });

    it('requires guestEmail when no session context is provided', async () => {
      const item = await createVariantWithStock({ price: '20.00', onHand: 5 });
      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
      });
      if (!quote.success) return;

      const acceptResult = await checkoutService.accept({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
        confirmation: quote.data.confirmation,
        paymentMethod: 'cod',
        address: validAddress,
      });

      expect(acceptResult.success).toBe(false);
      if (acceptResult.success) return;
      expect(acceptResult.status).toBe(400);
      expect(acceptResult.error.code).toBe('validation-error');
    });

    it('returns 409 reconfirmation-required when catalog price changes between quote and accept', async () => {
      const item = await createVariantWithStock({ price: '50.00', onHand: 10 });

      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
      });
      if (!quote.success) return;

      // Price changes in catalog
      await testDb.db
        .update(productVariants)
        .set({ basePrice: '75.00' })
        .where(eq(productVariants.id, item.variantId));

      const acceptResult = await checkoutService.accept({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
        confirmation: quote.data.confirmation,
        paymentMethod: 'cod',
        address: validAddress,
        guestEmail: 'guest@example.com',
      });

      expect(acceptResult.success).toBe(false);
      if (acceptResult.success) return;
      expect(acceptResult.status).toBe(409);
      expect(acceptResult.error.code).toBe('reconfirmation-required');
      expect(acceptResult.error.quote).toBeDefined();
      expect(acceptResult.error.quote?.lines[0].unitPrice).toBe(75);
      expect(acceptResult.error.quote?.total).toBe(125); // 75 + 50
    });

    it('returns 409 insufficient-stock and rolls back whole transaction when stock runs out', async () => {
      const item = await createVariantWithStock({ price: '30.00', onHand: 1 });

      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 2 }],
      });
      if (!quote.success) return;

      const acceptResult = await checkoutService.accept({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 2 }],
        confirmation: quote.data.confirmation,
        paymentMethod: 'cod',
        address: validAddress,
        guestEmail: 'stockout-guest@example.com',
      });

      expect(acceptResult.success).toBe(false);
      if (acceptResult.success) return;
      expect(acceptResult.status).toBe(409);
      expect(acceptResult.error.code).toBe('insufficient-stock');
      expect(acceptResult.error.shortfalls).toEqual([
        { variantId: item.variantId, requested: 2, available: 1 },
      ]);

      // Verify nothing persisted in database (rollback check)
      const allOrders = await testDb.db
        .select()
        .from(orders)
        .where(eq(orders.guestEmail, 'stockout-guest@example.com'));
      expect(allOrders).toHaveLength(0);

      const [bal] = await testDb.db
        .select()
        .from(inventoryBalances)
        .where(eq(inventoryBalances.variantId, item.variantId));
      expect(bal.reserved).toBe(0);
    });

    it('rejects non-COD payment methods', async () => {
      const item = await createVariantWithStock();
      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
      });
      if (!quote.success) return;

      const acceptResult = await checkoutService.accept({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
        confirmation: quote.data.confirmation,
        paymentMethod: 'card' as unknown as 'cod',
        address: validAddress,
        guestEmail: 'guest@example.com',
      });

      expect(acceptResult.success).toBe(false);
      if (acceptResult.success) return;
      expect(acceptResult.status).toBe(400);
      expect(acceptResult.error.code).toBe('unsupported-payment-method');
    });

    it('enforces trigger freeze on order snapshot columns while allowing status updates', async () => {
      const item = await createVariantWithStock({ price: '45.00', onHand: 5 });
      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
      });
      if (!quote.success) return;

      const acceptResult = await checkoutService.accept({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
        confirmation: quote.data.confirmation,
        paymentMethod: 'cod',
        address: validAddress,
        guestEmail: 'freeze-test@example.com',
      });
      expect(acceptResult.success).toBe(true);
      if (!acceptResult.success) return;

      const orderId = acceptResult.data.order.id;

      // Updating mutable status works
      await testDb.db
        .update(orders)
        .set({ status: 'confirmed', paymentStatus: 'paid' })
        .where(eq(orders.id, orderId));

      const [updated] = await testDb.db.select().from(orders).where(eq(orders.id, orderId));
      expect(updated.status).toBe('confirmed');
      expect(updated.paymentStatus).toBe('paid');

      // Service-level check throws on frozen columns
      expect(() => orderQueries.assertMutableOrderColumns({ subtotal: '999.00' })).toThrow(
        /Cannot update frozen order snapshot column: subtotal/,
      );

      await expect(orderQueries.updateOrder(orderId, { subtotal: '999.00' })).rejects.toThrow(
        /Cannot update frozen order snapshot column: subtotal/,
      );

      // Service-level check allows mutable columns
      await orderQueries.updateOrder(orderId, {
        status: 'shipped',
        trackingNumber: 'TRACK-12345',
        adminNotes: 'Packaged with care',
      });
      const [afterServiceUpdate] = await testDb.db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));
      expect(afterServiceUpdate.status).toBe('shipped');
      expect(afterServiceUpdate.trackingNumber).toBe('TRACK-12345');
      expect(afterServiceUpdate.adminNotes).toBe('Packaged with care');

      // Attempting to update frozen snapshot columns (e.g. subtotal) triggers database trigger
      await expect(
        testDb.sql`update sales.orders set subtotal = '999.00' where id = ${orderId}`,
      ).rejects.toThrow(/Order snapshot columns are frozen/);

      // Attempting to update order reference triggers error
      await expect(
        testDb.sql`update sales.orders set order_reference = 'FE-999999' where id = ${orderId}`,
      ).rejects.toThrow(/Order snapshot columns are frozen/);

      // Attempting to update order items triggers error
      await expect(
        testDb.sql`update sales.order_items set quantity = 10 where order_id = ${orderId}`,
      ).rejects.toThrow(/Order items are frozen/);

      // Attempting to delete order items triggers error
      await expect(
        testDb.sql`delete from sales.order_items where order_id = ${orderId}`,
      ).rejects.toThrow(/Order items cannot be deleted/);

      // Attempting to delete order with items triggers error directly at order level
      await expect(testDb.sql`delete from sales.orders where id = ${orderId}`).rejects.toThrow(
        /Orders cannot be deleted/,
      );

      // Attempting to delete an itemless order also triggers error directly at order level
      const itemlessOrder = await orderQueries.create({
        guestEmail: 'itemless@example.com',
        subtotal: '0.00',
        shippingCost: '0.00',
        totalAmount: '0.00',
      });
      await expect(
        testDb.sql`delete from sales.orders where id = ${itemlessOrder.order.id}`,
      ).rejects.toThrow(/Orders cannot be deleted/);
    });

    it('allows ON DELETE SET NULL on user_id and variant_id without trigger failure', async () => {
      sequence += 1;
      const [testUser] = await testDb.db
        .insert(users)
        .values({
          email: `anon-${sequence}@example.com`,
          firstName: 'Anonymize',
          lastName: 'Me',
        })
        .returning();

      const item = await createVariantWithStock({ price: '15.00', onHand: 5 });
      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
      });
      if (!quote.success) return;

      const acceptResult = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: item.variantId, quantity: 1 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
        },
        { userId: testUser.id },
      );
      expect(acceptResult.success).toBe(true);
      if (!acceptResult.success) return;

      const orderId = acceptResult.data.order.id;

      // Deleting the user triggers ON DELETE SET NULL on orders.user_id
      await testDb.db.delete(users).where(eq(users.id, testUser.id));

      const [orderAfterUserDelete] = await testDb.db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));
      expect(orderAfterUserDelete.userId).toBeNull();
      expect(orderAfterUserDelete.totalAmount).toBe('65.00');

      // Updating product_id or variant_id to NULL on order_items (allowed for ON DELETE SET NULL cascade)
      await testDb.sql`update sales.order_items set variant_id = null where order_id = ${orderId}`;
      await testDb.sql`update sales.order_items set product_id = null where order_id = ${orderId}`;

      const [itemAfterNulls] = await testDb.db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));
      expect(itemAfterNulls.variantId).toBeNull();
      expect(itemAfterNulls.productId).toBeNull();
      expect(itemAfterNulls.unitPriceSnapshot).toBe('15.00');

      // Attempting to change variant_id to a new non-null ID is blocked
      await expect(
        testDb.sql`update sales.order_items set variant_id = 999 where order_id = ${orderId}`,
      ).rejects.toThrow(/Order items are frozen/);
    });

    it('verifies Order Reference format and uniqueness constraint', async () => {
      const item = await createVariantWithStock({ price: '10.00', onHand: 5 });
      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
      });
      if (!quote.success) return;

      const result = await checkoutService.accept({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
        confirmation: quote.data.confirmation,
        paymentMethod: 'cod',
        address: validAddress,
        guestEmail: 'ref-test@example.com',
      });
      expect(result.success).toBe(true);
      if (!result.success) return;

      const ref = result.data.order.orderReference;
      expect(ref).toMatch(/^FE-[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{6}$/);

      // Database CHECK rejects invalid reference format
      await expect(
        testDb.sql`insert into sales.orders (order_reference, total_amount, subtotal) values ('INVALID-FORMAT', '50.00', '0.00')`,
      ).rejects.toThrow(/ck_orders_order_reference/);

      // Database UNIQUE rejects duplicate reference
      await expect(
        testDb.sql`insert into sales.orders (order_reference, total_amount, subtotal) values (${ref}, '50.00', '0.00')`,
      ).rejects.toThrow(/uq_orders_order_reference/);
    });
  });
});
