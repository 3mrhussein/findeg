import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq, sql } from 'drizzle-orm';
import { getPendingRewardTotals } from '@findeg/db/queries/rewards';
import {
  categories,
  businessPartners,
  inventoryBalances,
  orders,
  orderItems,
  schoolSupplyListItems,
  schoolSupplyLists,
  products,
  productVariants,
  rewardEntitlements,
  rewardEvents,
  rewardRates,
  stockReservations,
  users,
  warehouses,
  checkoutIdempotency,
  listOffers,
} from '@findeg/db/schema';
import { createCheckoutService } from '../index';
import { isValidOrderReference } from '../domain/order-reference';
import { computeOrderFingerprint } from '../domain/fingerprint';
import { checkoutIdempotencyQueries, orderQueries } from '@findeg/db/queries';
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
      categoryId: category.id,
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

  async function createPublishedList(
    lines: Array<{
      variantId: number;
      exactItem?: boolean;
      required?: boolean;
      quantity?: number;
      specification?: { categoryId: number; attributes: Record<string, string> } | null;
    }>,
    status: 'published' | 'archived' = 'published',
  ) {
    sequence += 1;
    const [partner] = await testDb.db
      .insert(businessPartners)
      .values({
        code: `checkout-school-${sequence}`,
        nameEn: 'Nile School',
        nameAr: 'مدرسة النيل',
      })
      .returning();
    const publishedAt = new Date('2026-09-01T08:00:00.000Z');
    const publicCode = sequence.toString(16).padStart(32, '0');
    const [draft] = await testDb.db
      .insert(schoolSupplyLists)
      .values({
        businessPartnerId: partner.id,
        grade: 'Grade 1',
        academicYear: '2026/2027',
        localizedTitle: { en: 'Grade 1 supplies' },
      })
      .returning();
    const items = await testDb.db
      .insert(schoolSupplyListItems)
      .values(
        lines.map((line, index) => ({
          listId: draft.id,
          variantId: line.variantId,
          exactItem: line.exactItem ?? true,
          specification: line.specification ?? null,
          required: line.required ?? true,
          quantity: line.quantity ?? 1,
          localizedLabel: { en: `Supply ${index + 1}` },
          sortOrder: index,
          productNameEnSnapshot: `Supply ${index + 1}`,
          skuSnapshot: `LIST-SKU-${sequence}-${index}`,
        })),
      )
      .returning();
    const [published] = await testDb.db
      .update(schoolSupplyLists)
      .set({ status: 'published', publicCode, publishedAt })
      .where(eq(schoolSupplyLists.id, draft.id))
      .returning();
    const [list] =
      status === 'archived'
        ? await testDb.db
            .update(schoolSupplyLists)
            .set({ status: 'archived', archivedAt: new Date('2026-09-15T08:00:00.000Z') })
            .where(eq(schoolSupplyLists.id, draft.id))
            .returning()
        : [published];
    return { list, items, partner, publicCode, publishedAt };
  }

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

      const acceptResult = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: item.variantId, quantity: 2 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'guest@example.com',
        },
        { idempotencyKey: 'idemp-accept-1' },
      );

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
        { userId: user.id, idempotencyKey: 'idemp-accept-2' },
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

      const acceptResult = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: item.variantId, quantity: 1 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
        },
        { idempotencyKey: 'idemp-accept-3' },
      );

      expect(acceptResult.success).toBe(false);
      if (acceptResult.success) return;
      expect(acceptResult.status).toBe(400);
      expect(acceptResult.error.code).toBe('validation-error');
    });

    it('rejects order acceptance when Idempotency-Key is missing', async () => {
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
        paymentMethod: 'cod',
        address: validAddress,
        guestEmail: 'guest@example.com',
      });

      expect(acceptResult.success).toBe(false);
      if (acceptResult.success) return;
      expect(acceptResult.status).toBe(400);
      expect(acceptResult.error.code).toBe('missing-idempotency-key');
    });

    it('ignores an idempotencyKey supplied in the request body (header only)', async () => {
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
        paymentMethod: 'cod',
        address: validAddress,
        guestEmail: 'guest@example.com',
        idempotencyKey: 'body-supplied-key',
      } as Parameters<typeof checkoutService.accept>[0]);

      expect(acceptResult.success).toBe(false);
      if (acceptResult.success) return;
      expect(acceptResult.status).toBe(400);
      expect(acceptResult.error.code).toBe('missing-idempotency-key');
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

      const acceptResult = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: item.variantId, quantity: 1 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'guest@example.com',
        },
        { idempotencyKey: 'idemp-accept-4' },
      );

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

      const acceptResult = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: item.variantId, quantity: 2 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'stockout-guest@example.com',
        },
        { idempotencyKey: 'idemp-accept-5' },
      );

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

      const acceptResult = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: item.variantId, quantity: 1 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'card' as unknown as 'cod',
          address: validAddress,
          guestEmail: 'guest@example.com',
        },
        { idempotencyKey: 'idemp-accept-6' },
      );

      expect(acceptResult.success).toBe(false);
      if (acceptResult.success) return;
      expect(acceptResult.status).toBe(400);
      expect(acceptResult.error.code).toBe('unsupported-payment-method');
    });

    it('rejects unavailable or inactive variants during acceptance with 400 unavailable-variant', async () => {
      const item = await createVariantWithStock({ price: '20.00', onHand: 5 });
      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
      });
      if (!quote.success) return;

      // Deactivate variant after validation to simulate catalog race condition
      await testDb.db
        .update(productVariants)
        .set({ isActive: false })
        .where(eq(productVariants.id, item.variantId));

      const acceptResult = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: item.variantId, quantity: 1 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'guest@example.com',
        },
        { idempotencyKey: 'idemp-accept-7' },
      );

      expect(acceptResult.success).toBe(false);
      if (acceptResult.success) return;
      expect(acceptResult.status).toBe(400);
      expect(acceptResult.error.code).toBe('unavailable-variant');
    });

    it('enforces trigger freeze on order snapshot columns while allowing status updates', async () => {
      const item = await createVariantWithStock({ price: '45.00', onHand: 5 });
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
          guestEmail: 'freeze-test@example.com',
        },
        { idempotencyKey: 'idemp-accept-8' },
      );
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
      await expect(orderQueries.updateOrder(orderId, { status: 'shipped' })).rejects.toThrow(
        /Cannot update frozen order snapshot column: status/,
      );
      await orderQueries.updateOrder(orderId, {
        trackingNumber: 'TRACK-12345',
        adminNotes: 'Packaged with care',
      });
      const [afterServiceUpdate] = await testDb.db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));
      expect(afterServiceUpdate.status).toBe('confirmed');
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

    it('allows ON DELETE SET NULL on user_id only through the FK action, not direct updates', async () => {
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
        { userId: testUser.id, idempotencyKey: 'idemp-accept-9' },
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

      // Direct UPDATEs of identity/catalog links are rejected; only FK actions may null them
      await expect(
        testDb.sql`update sales.order_items set variant_id = null where order_id = ${orderId}`,
      ).rejects.toThrow(/Order items are frozen/);

      const [itemAfterUserDelete] = await testDb.db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));
      expect(itemAfterUserDelete.variantId).toBe(item.variantId);
      expect(itemAfterUserDelete.unitPriceSnapshot).toBe('15.00');

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

      const result = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: item.variantId, quantity: 1 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'ref-test@example.com',
        },
        { idempotencyKey: 'idemp-accept-10' },
      );
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

  describe('Idempotent Order Acceptance (Issue #239)', () => {
    it('returns the stored receipt (Order Reference, status, totals) with 201 on matching replay, even after price or stock changed', async () => {
      const item = await createVariantWithStock({ price: '40.00', onHand: 5 });
      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 2 }],
      });
      expect(quote.success).toBe(true);
      if (!quote.success) return;

      const idempotencyKey = `replay-test-key-${++sequence}`;
      const guestId = `guest-replay-${sequence}`;

      // First submit
      const firstResult = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: item.variantId, quantity: 2 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'replay@example.com',
        },
        { idempotencyKey, guestId },
      );

      expect(firstResult.success).toBe(true);
      if (!firstResult.success) return;
      expect(firstResult.status).toBe(201);
      const initialOrder = firstResult.data.order;

      // Price increases and remaining stock drops to 0
      await testDb.db
        .update(productVariants)
        .set({ basePrice: '150.00' })
        .where(eq(productVariants.id, item.variantId));
      await testDb.db
        .update(inventoryBalances)
        .set({ onHand: 2, reserved: 2 })
        .where(eq(inventoryBalances.variantId, item.variantId));

      // Replay with identical input and same key
      const replayResult = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: item.variantId, quantity: 2 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'replay@example.com',
        },
        { idempotencyKey, guestId },
      );

      expect(replayResult.success).toBe(true);
      if (!replayResult.success) return;
      expect(replayResult.status).toBe(201);
      expect(replayResult.data.order.id).toBe(initialOrder.id);
      expect(replayResult.data.order.orderReference).toBe(initialOrder.orderReference);
      expect(replayResult.data.order.status).toBe('pending');
      expect(replayResult.data.order.paymentStatus).toBe('unpaid');
      expect(replayResult.data.order.totalAmount).toBe(initialOrder.totalAmount);
      expect(replayResult.data.order.currency).toBe('EGP');

      // Exactly one order was created in the database
      const matchingOrders = await testDb.db
        .select()
        .from(orders)
        .where(eq(orders.guestEmail, 'replay@example.com'));
      expect(matchingOrders).toHaveLength(1);
    });

    it('returns matching replay even when input line ordering is permuted', async () => {
      const itemA = await createVariantWithStock({ price: '20.00', onHand: 5 });
      const itemB = await createVariantWithStock({ price: '30.00', onHand: 5 });

      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [
          { variantId: itemA.variantId, quantity: 1 },
          { variantId: itemB.variantId, quantity: 2 },
        ],
      });
      if (!quote.success) return;

      const idempotencyKey = `permute-key-${++sequence}`;

      const res1 = await checkoutService.accept(
        {
          source: 'cart',
          lines: [
            { variantId: itemA.variantId, quantity: 1 },
            { variantId: itemB.variantId, quantity: 2 },
          ],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'permute@example.com',
        },
        { idempotencyKey },
      );
      expect(res1.success).toBe(true);
      if (!res1.success) return;

      // Replay with reversed line ordering in the request
      const res2 = await checkoutService.accept(
        {
          source: 'cart',
          lines: [
            { variantId: itemB.variantId, quantity: 2 },
            { variantId: itemA.variantId, quantity: 1 },
          ],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'permute@example.com',
        },
        { idempotencyKey },
      );

      expect(res2.success).toBe(true);
      if (!res2.success) return;
      expect(res2.status).toBe(201);
      expect(res2.data.order.id).toBe(res1.data.order.id);
      expect(res2.data.order.orderReference).toBe(res1.data.order.orderReference);
    });

    it('returns 409 idempotency-conflict when fingerprint mismatches', async () => {
      const itemA = await createVariantWithStock({ price: '25.00', onHand: 10 });
      const itemB = await createVariantWithStock({ price: '35.00', onHand: 10 });

      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: itemA.variantId, quantity: 1 }],
      });
      if (!quote.success) return;

      const idempotencyKey = `conflict-key-${++sequence}`;
      const guestId = `guest-conflict-${sequence}`;

      const initialResult = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: itemA.variantId, quantity: 1 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'conflict@example.com',
        },
        { idempotencyKey, guestId },
      );
      expect(initialResult.success).toBe(true);

      // 1. Conflict on different variant ID
      const variantConflict = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: itemB.variantId, quantity: 1 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'conflict@example.com',
        },
        { idempotencyKey, guestId },
      );
      expect(variantConflict.success).toBe(false);
      if (!variantConflict.success) {
        expect(variantConflict.status).toBe(409);
        expect(variantConflict.error.code).toBe('idempotency-conflict');
      }

      // 2. Conflict on different line quantity
      const quantityConflict = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: itemA.variantId, quantity: 2 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'conflict@example.com',
        },
        { idempotencyKey, guestId },
      );
      expect(quantityConflict.success).toBe(false);
      if (!quantityConflict.success) {
        expect(quantityConflict.status).toBe(409);
        expect(quantityConflict.error.code).toBe('idempotency-conflict');
      }

      // 2. Conflict on different address
      const addressConflict = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: itemA.variantId, quantity: 1 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: { ...validAddress, street: 'Different Street 99' },
          guestEmail: 'conflict@example.com',
        },
        { idempotencyKey, guestId },
      );
      expect(addressConflict.success).toBe(false);
      if (!addressConflict.success) {
        expect(addressConflict.status).toBe(409);
        expect(addressConflict.error.code).toBe('idempotency-conflict');
      }

      // 3. Conflict on different confirmation
      const confirmationConflict = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: itemA.variantId, quantity: 1 }],
          confirmation: 'tampered-or-different-confirmation',
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'conflict@example.com',
        },
        { idempotencyKey, guestId },
      );
      expect(confirmationConflict.success).toBe(false);
      if (!confirmationConflict.success) {
        expect(confirmationConflict.status).toBe(409);
        expect(confirmationConflict.error.code).toBe('idempotency-conflict');
      }

      // 3b. Conflict on different guest email (must never replay another customer's receipt)
      const guestEmailConflict = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: itemA.variantId, quantity: 1 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'someone-else@example.com',
        },
        { idempotencyKey, guestId },
      );
      expect(guestEmailConflict.success).toBe(false);
      if (!guestEmailConflict.success) {
        expect(guestEmailConflict.status).toBe(409);
        expect(guestEmailConflict.error.code).toBe('idempotency-conflict');
      }

      // 4. Conflict on different delivery method
      const deliveryMethodConflict = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: itemA.variantId, quantity: 1 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          deliveryMethod: 'express',
          address: validAddress,
          guestEmail: 'conflict@example.com',
        },
        { idempotencyKey, guestId },
      );
      expect(deliveryMethodConflict.success).toBe(false);
      if (!deliveryMethodConflict.success) {
        expect(deliveryMethodConflict.status).toBe(409);
        expect(deliveryMethodConflict.error.code).toBe('idempotency-conflict');
      }
    });

    it('leaves no row on rollback so a subsequent retry proceeds', async () => {
      const item = await createVariantWithStock({ price: '50.00', onHand: 1 });
      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 2 }],
      });
      if (!quote.success) return;

      const idempotencyKey = `rollback-key-${++sequence}`;
      const guestId = `guest-rollback-${sequence}`;

      // 1. Initial attempt fails due to insufficient stock
      const failedAttempt = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: item.variantId, quantity: 2 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'rollback-test@example.com',
        },
        { idempotencyKey, guestId },
      );
      expect(failedAttempt.success).toBe(false);
      if (failedAttempt.success) return;
      expect(failedAttempt.status).toBe(409);
      expect(failedAttempt.error.code).toBe('insufficient-stock');

      // Verify no row persisted in sales.checkout_idempotency
      const rows = await testDb.db
        .select()
        .from(checkoutIdempotency)
        .where(eq(checkoutIdempotency.key, idempotencyKey));
      expect(rows).toHaveLength(0);

      // 2. Restock variant
      await testDb.db
        .update(inventoryBalances)
        .set({ onHand: 10 })
        .where(eq(inventoryBalances.variantId, item.variantId));

      // 3. Retry with the SAME idempotency key now proceeds and succeeds
      const retryResult = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: item.variantId, quantity: 2 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'rollback-test@example.com',
        },
        { idempotencyKey, guestId },
      );

      expect(retryResult.success).toBe(true);
      if (!retryResult.success) return;
      expect(retryResult.status).toBe(201);

      // Now exactly one row exists in sales.checkout_idempotency
      const savedRows = await testDb.db
        .select()
        .from(checkoutIdempotency)
        .where(eq(checkoutIdempotency.key, idempotencyKey));
      expect(savedRows).toHaveLength(1);
      expect(savedRows[0].orderId).toBe(retryResult.data.order.id);
      expect(savedRows[0].orderReference).toBe(retryResult.data.order.orderReference);
      expect(savedRows[0].response?.order?.id).toBe(retryResult.data.order.id);
    });

    it('leaves no row when price changes (reconfirmation-required) so retry with new confirmation proceeds', async () => {
      const item = await createVariantWithStock({ price: '30.00', onHand: 5 });
      const initialQuote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
      });
      if (!initialQuote.success) return;

      const idempotencyKey = `reconf-rollback-key-${++sequence}`;

      // Change catalog price
      await testDb.db
        .update(productVariants)
        .set({ basePrice: '45.00' })
        .where(eq(productVariants.id, item.variantId));

      // Attempt fails with 409 reconfirmation-required
      const reconfResult = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: item.variantId, quantity: 1 }],
          confirmation: initialQuote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'reconf-guest@example.com',
        },
        { idempotencyKey },
      );
      expect(reconfResult.success).toBe(false);
      if (reconfResult.success) return;
      expect(reconfResult.status).toBe(409);
      expect(reconfResult.error.code).toBe('reconfirmation-required');

      // Verify no row in sales.checkout_idempotency
      const rows = await testDb.db
        .select()
        .from(checkoutIdempotency)
        .where(eq(checkoutIdempotency.key, idempotencyKey));
      expect(rows).toHaveLength(0);

      // Fresh quote and retry with updated confirmation succeeds
      const freshQuote = reconfResult.error.quote!;
      const retryResult = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: item.variantId, quantity: 1 }],
          confirmation: freshQuote.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'reconf-guest@example.com',
        },
        { idempotencyKey },
      );
      expect(retryResult.success).toBe(true);
      if (!retryResult.success) return;
      expect(retryResult.status).toBe(201);
    });

    it('produces exactly one Order when two identical requests run concurrently', async () => {
      const item = await createVariantWithStock({ price: '50.00', onHand: 2 });
      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
      });
      expect(quote.success).toBe(true);
      if (!quote.success) return;

      const idempotencyKey = `concurrent-key-${++sequence}`;
      const guestId = `guest-concurrent-${sequence}`;

      const orderPayload = {
        source: 'cart' as const,
        lines: [{ variantId: item.variantId, quantity: 1 }],
        confirmation: quote.data.confirmation,
        paymentMethod: 'cod' as const,
        address: validAddress,
        guestEmail: 'concurrent@example.com',
      };
      const context = { idempotencyKey, guestId };

      // Dispatch two concurrent identical requests
      const [result1, result2] = await Promise.all([
        checkoutService.accept(orderPayload, context),
        checkoutService.accept(orderPayload, context),
      ]);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      if (!result1.success || !result2.success) return;

      expect(result1.status).toBe(201);
      expect(result2.status).toBe(201);

      // Both returned the identical order
      expect(result1.data.order.id).toBe(result2.data.order.id);
      expect(result1.data.order.orderReference).toBe(result2.data.order.orderReference);

      // Exactly ONE order was created in DB
      const createdOrders = await testDb.db
        .select()
        .from(orders)
        .where(eq(orders.guestEmail, 'concurrent@example.com'));
      expect(createdOrders).toHaveLength(1);

      // Exactly ONE stock reservation exists
      const reservations = await testDb.db
        .select()
        .from(stockReservations)
        .where(eq(stockReservations.orderId, result1.data.order.id));
      expect(reservations).toHaveLength(1);
      expect(reservations[0].quantity).toBe(1);

      // Stock was only reserved once
      const [balance] = await testDb.db
        .select()
        .from(inventoryBalances)
        .where(eq(inventoryBalances.variantId, item.variantId));
      expect(balance.reserved).toBe(1);

      // Exactly ONE row in checkout_idempotency
      const rows = await testDb.db
        .select()
        .from(checkoutIdempotency)
        .where(eq(checkoutIdempotency.key, idempotencyKey));
      expect(rows).toHaveLength(1);
    });

    it('lets a concurrent request proceed when the holder of the key rolls back', async () => {
      const item = await createVariantWithStock({ price: '50.00', onHand: 2 });
      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
      });
      expect(quote.success).toBe(true);
      if (!quote.success) return;

      const idempotencyKey = `holder-rollback-${++sequence}`;
      const guestId = `guest-holder-rollback-${sequence}`;
      const orderPayload = {
        source: 'cart' as const,
        lines: [{ variantId: item.variantId, quantity: 1 }],
        confirmation: quote.data.confirmation,
        paymentMethod: 'cod' as const,
        address: validAddress,
        guestEmail: 'holder-rollback@example.com',
      };

      // A competing attempt claims the key inside an open transaction...
      let signalClaimed!: () => void;
      const claimed = new Promise<void>((resolve) => (signalClaimed = resolve));
      let releaseHolder!: () => void;
      const released = new Promise<void>((resolve) => (releaseHolder = resolve));
      const holder = testDb.db
        .transaction(async (tx) => {
          await checkoutIdempotencyQueries.claimKey(
            { scope: `guest:${guestId}`, key: idempotencyKey, fingerprint: 'holder-fingerprint' },
            tx,
          );
          signalClaimed();
          await released;
          throw new Error('holder rolls back');
        })
        .catch(() => undefined);
      await claimed;

      // ...so this request blocks on the unique index instead of failing or double-creating.
      const pending = checkoutService.accept(orderPayload, { idempotencyKey, guestId });
      const stillWaiting = await Promise.race([
        pending.then(() => 'settled'),
        new Promise((resolve) => setTimeout(() => resolve('waiting'), 300)),
      ]);
      expect(stillWaiting).toBe('waiting');

      // Once the holder rolls back its claim vanishes and the waiting request proceeds.
      releaseHolder();
      await holder;
      const result = await pending;
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.status).toBe(201);

      const createdOrders = await testDb.db
        .select()
        .from(orders)
        .where(eq(orders.guestEmail, 'holder-rollback@example.com'));
      expect(createdOrders).toHaveLength(1);
    });

    it('returns 409 idempotency-in-progress when a committed claim never records an outcome', async () => {
      const item = await createVariantWithStock({ price: '25.00', onHand: 10 });
      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
      });
      expect(quote.success).toBe(true);
      if (!quote.success) return;

      const idempotencyKey = `in-progress-${++sequence}`;
      const guestId = `guest-in-progress-${sequence}`;
      const lines = [{ variantId: item.variantId, quantity: 1 }];
      const guestEmail = 'in-progress@example.com';

      // A claim for the identical request that committed without a recorded response
      await checkoutIdempotencyQueries.claimKey({
        scope: `guest:${guestId}`,
        key: idempotencyKey,
        fingerprint: computeOrderFingerprint({
          lines,
          address: validAddress,
          paymentMethod: 'cod',
          confirmation: quote.data.confirmation,
          guestEmail,
        }),
      });

      const result = await checkoutService.accept(
        {
          source: 'cart',
          lines,
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail,
        },
        { idempotencyKey, guestId },
      );

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.status).toBe(409);
      expect(result.error.code).toBe('idempotency-in-progress');

      const createdOrders = await testDb.db
        .select()
        .from(orders)
        .where(eq(orders.guestEmail, guestEmail));
      expect(createdOrders).toHaveLength(0);
    });

    it('isScopeKeyConflict recognises a live-row conflict and nothing else', async () => {
      const scope = `guest:conflict-probe-${++sequence}`;
      const claim = { scope, key: `probe-${sequence}`, fingerprint: 'probe-fingerprint' };
      await checkoutIdempotencyQueries.claimKey(claim);

      // A real duplicate claim of a live row
      const duplicate = await checkoutIdempotencyQueries.claimKey(claim).catch((err) => err);
      expect(checkoutIdempotencyQueries.isScopeKeyConflict(duplicate)).toBe(true);

      // A raw unique violation on the (scope, key) index, including when wrapped in `cause`
      const driverError = { code: '23505', constraint_name: 'uq_checkout_idempotency_scope_key' };
      expect(checkoutIdempotencyQueries.isScopeKeyConflict(driverError)).toBe(true);
      expect(checkoutIdempotencyQueries.isScopeKeyConflict({ cause: driverError })).toBe(true);

      // Unrelated errors and other unique constraints are not idempotency conflicts
      expect(checkoutIdempotencyQueries.isScopeKeyConflict(new Error('boom'))).toBe(false);
      expect(
        checkoutIdempotencyQueries.isScopeKeyConflict({ code: '23505', constraint_name: 'other' }),
      ).toBe(false);
      expect(
        checkoutIdempotencyQueries.isScopeKeyConflict({
          code: '40001',
          constraint_name: 'uq_checkout_idempotency_scope_key',
        }),
      ).toBe(false);
      expect(checkoutIdempotencyQueries.isScopeKeyConflict(null)).toBe(false);
    });

    it('reusing an expired idempotency key (>24h) creates a new order and replaces the expired row', async () => {
      const item = await createVariantWithStock({ price: '25.00', onHand: 10 });
      const idempotencyKey = `expired-key-${sequence}`;
      const guestId = `guest-exp-${sequence}`;

      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
      });
      expect(quote.success).toBe(true);
      if (!quote.success) return;

      const orderPayload = {
        source: 'cart' as const,
        lines: [{ variantId: item.variantId, quantity: 1 }],
        confirmation: quote.data.confirmation,
        paymentMethod: 'cod' as const,
        address: validAddress,
        guestEmail: 'expired-key@example.com',
      };

      // 1. Initial successful order
      const firstResult = await checkoutService.accept(orderPayload, { idempotencyKey, guestId });
      expect(firstResult.success).toBe(true);
      if (!firstResult.success) return;

      // 2. Age the row to 25 hours ago
      await testDb.db
        .update(checkoutIdempotency)
        .set({ createdAt: sql`now() - interval '25 hours'` })
        .where(eq(checkoutIdempotency.key, idempotencyKey));

      // 3. New quote and submission with the SAME expired idempotency key
      const secondQuote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
      });
      expect(secondQuote.success).toBe(true);
      if (!secondQuote.success) return;

      const secondResult = await checkoutService.accept(
        {
          ...orderPayload,
          confirmation: secondQuote.data.confirmation,
        },
        { idempotencyKey, guestId },
      );

      expect(secondResult.success).toBe(true);
      if (!secondResult.success) return;

      // A fresh order was created with a different reference
      expect(secondResult.data.order.orderReference).not.toBe(
        firstResult.data.order.orderReference,
      );

      // The old expired row was purged, exactly one active row remains in checkout_idempotency
      const rows = await testDb.db
        .select()
        .from(checkoutIdempotency)
        .where(eq(checkoutIdempotency.key, idempotencyKey));
      expect(rows).toHaveLength(1);
      expect(rows[0].orderReference).toBe(secondResult.data.order.orderReference);
    });

    it('rejects oversized idempotency-key (>255 chars) with 400 invalid-idempotency-key', async () => {
      const item = await createVariantWithStock({ price: '25.00', onHand: 10 });
      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
      });
      expect(quote.success).toBe(true);
      if (!quote.success) return;

      const result = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: item.variantId, quantity: 1 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'oversized@example.com',
        },
        { idempotencyKey: 'x'.repeat(256) },
      );

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.status).toBe(400);
      expect(result.error.code).toBe('invalid-idempotency-key');
    });

    it('rejects oversized guestId (>200 chars) with 400 invalid-guest-id', async () => {
      const item = await createVariantWithStock({ price: '25.00', onHand: 10 });
      const quote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: item.variantId, quantity: 1 }],
      });
      expect(quote.success).toBe(true);
      if (!quote.success) return;

      const result = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: item.variantId, quantity: 1 }],
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'oversized@example.com',
        },
        { idempotencyKey: `valid-key-${sequence}`, guestId: 'g'.repeat(201) },
      );

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.status).toBe(400);
      expect(result.error.code).toBe('invalid-guest-id');
    });
  });

  describe('School Supply List checkout through the checkout seam', () => {
    it('quotes live catalog prices, accepts quantities above the prescription, and omits unposted optional items', async () => {
      const variant = await createVariantWithStock({ price: '37.50', onHand: 20 });
      const source = await createPublishedList([
        { variantId: variant.variantId, quantity: 2 },
        { variantId: variant.variantId, required: false, quantity: 4 },
      ]);

      const result = await checkoutService.validate({
        source: 'list',
        publicCode: source.publicCode,
        lines: [{ listItemId: source.items[0].id, variantId: variant.variantId, quantity: 5 }],
      });

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.lines).toEqual([
        expect.objectContaining({
          listItemId: source.items[0].id,
          variantId: variant.variantId,
          quantity: 5,
          unitPrice: 37.5,
          lineTotal: 187.5,
        }),
      ]);
    });

    it.each(['suspended', 'closed'] as const)(
      "accepts and attributes an Order on a %s Business Partner's list like any other (ADR-0012)",
      async (status) => {
        const variant = await createVariantWithStock({ onHand: 5 });
        const source = await createPublishedList([{ variantId: variant.variantId }]);
        await testDb.db
          .update(businessPartners)
          .set({ status })
          .where(eq(businessPartners.id, source.partner.id));
        const input = {
          source: 'list' as const,
          publicCode: source.publicCode,
          lines: [{ listItemId: source.items[0].id, variantId: variant.variantId, quantity: 1 }],
        };

        const quote = await checkoutService.validate(input);
        expect(quote.success).toBe(true);
        if (!quote.success) return;
        const accepted = await checkoutService.accept(
          {
            ...input,
            confirmation: quote.data.confirmation,
            paymentMethod: 'cod',
            address: validAddress,
            guestEmail: `${status}-partner@example.com`,
          },
          { idempotencyKey: `${status}-partner-${sequence}`, guestId: `${status}-guest` },
        );

        expect(accepted.success).toBe(true);
        if (!accepted.success) return;
        const [order] = await testDb.db
          .select()
          .from(orders)
          .where(eq(orders.id, accepted.data.order.id));
        const [line] = await testDb.db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        expect(order).toMatchObject({
          status: 'pending',
          schoolSupplyListId: source.list.id,
          schoolSupplyListPublicCode: source.publicCode,
          schoolSupplyListPublishedAt: source.publishedAt,
          businessPartnerId: source.partner.id,
        });
        expect(line.schoolSupplyListItemId).toBe(source.items[0].id);
      },
    );

    it('returns list-unavailable and selection-invalid for the matching failures', async () => {
      const variant = await createVariantWithStock();
      const archived = await createPublishedList([{ variantId: variant.variantId }], 'archived');
      const available = await createPublishedList([{ variantId: variant.variantId }]);

      const unavailable = await checkoutService.validate({
        source: 'list',
        publicCode: archived.publicCode,
        lines: [{ listItemId: archived.items[0].id, variantId: variant.variantId, quantity: 1 }],
      });
      expect(unavailable).toMatchObject({
        success: false,
        status: 409,
        error: { code: 'list-unavailable' },
      });

      const duplicate = await checkoutService.validate({
        source: 'list',
        publicCode: available.publicCode,
        lines: [
          { listItemId: available.items[0].id, variantId: variant.variantId, quantity: 1 },
          { listItemId: available.items[0].id, variantId: variant.variantId, quantity: 2 },
        ],
      });
      expect(duplicate).toMatchObject({
        success: false,
        status: 422,
        error: {
          code: 'selection-invalid',
          listItemIds: [available.items[0].id],
        },
      });

      const invalidLines = await checkoutService.validate({
        source: 'list',
        publicCode: available.publicCode,
        lines: [
          { listItemId: available.items[0].id, variantId: variant.variantId, quantity: 1000 },
          { listItemId: 999_999, variantId: variant.variantId, quantity: 1 },
        ],
      });
      expect(invalidLines).toMatchObject({
        success: false,
        status: 422,
        error: {
          code: 'selection-invalid',
          listItemIds: [available.items[0].id, 999_999],
        },
      });

      const empty = await checkoutService.validate({
        source: 'list',
        publicCode: available.publicCode,
        lines: [],
      });
      expect(empty).toMatchObject({
        success: false,
        status: 422,
        error: { code: 'selection-invalid', listItemIds: [] },
      });
    });

    it('snapshots and freezes list and line attribution at Order Acceptance', async () => {
      const defaultVariant = await createVariantWithStock({ price: '25.00', onHand: 10 });
      const substitute = await createVariantWithStock({ price: '30.00', onHand: 10 });
      const source = await createPublishedList([
        {
          variantId: defaultVariant.variantId,
          exactItem: false,
          specification: { categoryId: substitute.categoryId, attributes: {} },
        },
      ]);
      const input = {
        source: 'list' as const,
        publicCode: source.publicCode,
        lines: [{ listItemId: source.items[0].id, variantId: substitute.variantId, quantity: 1 }],
      };
      const quote = await checkoutService.validate(input);
      expect(quote.success).toBe(true);
      if (!quote.success) return;

      const accepted = await checkoutService.accept(
        {
          ...input,
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'list-customer@example.com',
        },
        { idempotencyKey: 'same-key', guestId: 'same-customer' },
      );
      expect(accepted.success).toBe(true);
      if (!accepted.success) return;

      const [order] = await testDb.db
        .select()
        .from(orders)
        .where(eq(orders.id, accepted.data.order.id));
      const [line] = await testDb.db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));
      expect(order).toMatchObject({
        schoolSupplyListId: source.list.id,
        schoolSupplyListPublicCode: source.publicCode,
        schoolSupplyListPublishedAt: source.publishedAt,
        businessPartnerId: source.partner.id,
      });
      expect(line).toMatchObject({
        schoolSupplyListItemId: source.items[0].id,
        isSubstitute: true,
      });

      await expect(
        testDb.db
          .update(orders)
          .set({ schoolSupplyListPublicCode: 'f'.repeat(32) })
          .where(eq(orders.id, order.id)),
      ).rejects.toThrow();
      await expect(
        testDb.db.update(orderItems).set({ isSubstitute: false }).where(eq(orderItems.id, line.id)),
      ).rejects.toThrow();

      const cartVariant = await createVariantWithStock({ onHand: 10 });
      const cartQuote = await checkoutService.validate({
        source: 'cart',
        lines: [{ variantId: cartVariant.variantId, quantity: 1 }],
      });
      expect(cartQuote.success).toBe(true);
      if (!cartQuote.success) return;
      const cartAccepted = await checkoutService.accept(
        {
          source: 'cart',
          lines: [{ variantId: cartVariant.variantId, quantity: 1 }],
          confirmation: cartQuote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'list-customer@example.com',
        },
        { idempotencyKey: 'same-key', guestId: 'same-customer' },
      );
      expect(cartAccepted.success).toBe(true);
    });

    it('scopes idempotency keys independently per list publicCode', async () => {
      const variant = await createVariantWithStock({ price: '25.00', onHand: 10 });
      const listA = await createPublishedList([{ variantId: variant.variantId }]);
      const listB = await createPublishedList([{ variantId: variant.variantId }]);

      const acceptFrom = async (source: typeof listA) => {
        const input = {
          source: 'list' as const,
          publicCode: source.publicCode,
          lines: [{ listItemId: source.items[0].id, variantId: variant.variantId, quantity: 1 }],
        };
        const quote = await checkoutService.validate(input);
        expect(quote.success).toBe(true);
        if (!quote.success) throw new Error('quote failed');
        return checkoutService.accept(
          {
            ...input,
            confirmation: quote.data.confirmation,
            paymentMethod: 'cod',
            address: validAddress,
            guestEmail: 'list-customer@example.com',
          },
          { idempotencyKey: 'shared-key', guestId: 'shared-customer' },
        );
      };

      const first = await acceptFrom(listA);
      const second = await acceptFrom(listB);
      expect(first.success).toBe(true);
      expect(second.success).toBe(true);
      if (!first.success || !second.success) return;
      expect(second.data.order.id).not.toBe(first.data.order.id);

      const replay = await acceptFrom(listA);
      expect(replay.success).toBe(true);
      if (replay.success) expect(replay.data.order.id).toBe(first.data.order.id);
    });
  });
  describe('List Offer pricing through the checkout seam', () => {
    const offerStart = new Date('2026-10-01T00:00:00.000Z');
    const offerEnd = new Date('2026-11-01T00:00:00.000Z');
    let clockNow = new Date('2026-10-15T12:00:00.000Z');
    const offerService = createCheckoutService({ shippingFee: 50, clock: () => clockNow });

    async function setOffer(
      listId: number,
      basisPoints: number,
      window: { startsAt?: Date; endsAt?: Date | null } = {},
    ) {
      const values = {
        basisPoints,
        startsAt: window.startsAt ?? offerStart,
        endsAt: window.endsAt === undefined ? offerEnd : window.endsAt,
        updatedAt: new Date(),
      };
      await testDb.db
        .insert(listOffers)
        .values({ listId, ...values })
        .onConflictDoUpdate({ target: listOffers.listId, set: values });
    }

    async function quoteList(
      source: Awaited<ReturnType<typeof createPublishedList>>,
      lines: Array<{ itemIndex: number; variantId: number; quantity: number }>,
    ) {
      const input = {
        source: 'list' as const,
        publicCode: source.publicCode,
        lines: lines.map((line) => ({
          listItemId: source.items[line.itemIndex].id,
          variantId: line.variantId,
          quantity: line.quantity,
        })),
      };
      const quote = await offerService.validate(input);
      if (!quote.success) throw new Error(`quote failed: ${quote.error.code}`);
      return { input, quote: quote.data };
    }

    function accept(
      input: Awaited<ReturnType<typeof quoteList>>['input'],
      confirmation: string,
      key: string,
    ) {
      return offerService.accept(
        {
          ...input,
          confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'offer-customer@example.com',
        },
        { idempotencyKey: key, guestId: key },
      );
    }

    beforeAll(() => {
      clockNow = new Date('2026-10-15T12:00:00.000Z');
    });

    it('prices an active offer per line, rounding half-up once per line', async () => {
      const a = await createVariantWithStock({ price: '10.05', onHand: 20 });
      const b = await createVariantWithStock({ price: '3.33', onHand: 20 });
      const source = await createPublishedList([
        { variantId: a.variantId },
        { variantId: b.variantId },
      ]);
      await setOffer(source.list.id, 1000);

      const { quote } = await quoteList(source, [
        { itemIndex: 0, variantId: a.variantId, quantity: 1 },
        { itemIndex: 1, variantId: b.variantId, quantity: 3 },
      ]);

      // 1005 x 0.9 = 904.5 -> 905 (half rounds up); 999 x 0.9 = 899.1 -> 899
      expect(quote.lines).toEqual([
        expect.objectContaining({
          unitPrice: 10.05,
          discounts: [{ source: 'list-offer', amount: 1 }],
          lineTotal: 9.05,
        }),
        expect.objectContaining({
          unitPrice: 3.33,
          discounts: [{ source: 'list-offer', amount: 1 }],
          lineTotal: 8.99,
        }),
      ]);
      expect(quote.subtotal).toBe(18.04);
      expect(quote.total).toBe(68.04);
    });

    it('rounds exact half piasters up and 0 and 10000 basis points to the extremes', async () => {
      const v = await createVariantWithStock({ price: '0.03', onHand: 20 });
      const source = await createPublishedList([{ variantId: v.variantId }]);
      const lines = [{ itemIndex: 0, variantId: v.variantId, quantity: 1 }];

      await setOffer(source.list.id, 5000);
      // 3 x 0.5 = 1.5 piasters -> 2
      expect((await quoteList(source, lines)).quote.lines[0].lineTotal).toBe(0.02);

      await setOffer(source.list.id, 0);
      const zero = (await quoteList(source, lines)).quote.lines[0];
      expect(zero.lineTotal).toBe(0.03);
      expect(zero.discounts).toEqual([]);

      await setOffer(source.list.id, 10000);
      const full = (await quoteList(source, lines)).quote.lines[0];
      expect(full.lineTotal).toBe(0);
      expect(full.discounts).toEqual([{ source: 'list-offer', amount: 0.03 }]);
    });

    it('applies only while starts_at <= acceptance time < ends_at', async () => {
      const v = await createVariantWithStock({ price: '100.00', onHand: 20 });
      const source = await createPublishedList([{ variantId: v.variantId }]);
      await setOffer(source.list.id, 2500);
      const lines = [{ itemIndex: 0, variantId: v.variantId, quantity: 1 }];
      const totalAt = async (at: Date) => {
        clockNow = at;
        return (await quoteList(source, lines)).quote.lines[0].lineTotal;
      };

      expect(await totalAt(new Date(offerStart.getTime() - 1))).toBe(100);
      expect(await totalAt(offerStart)).toBe(75);
      expect(await totalAt(new Date(offerEnd.getTime() - 1))).toBe(75);
      expect(await totalAt(offerEnd)).toBe(100);

      await setOffer(source.list.id, 2500, { endsAt: null });
      expect(await totalAt(new Date('2099-01-01T00:00:00.000Z'))).toBe(75);
      clockNow = new Date('2026-10-15T12:00:00.000Z');
    });

    it('applies to every line, Exact Item or substitute', async () => {
      const exact = await createVariantWithStock({ price: '20.00', onHand: 20 });
      const substitute = await createVariantWithStock({ price: '30.00', onHand: 20 });
      const source = await createPublishedList([
        { variantId: exact.variantId },
        {
          variantId: exact.variantId,
          exactItem: false,
          specification: { categoryId: substitute.categoryId, attributes: {} },
        },
      ]);
      await setOffer(source.list.id, 1000);

      const { quote } = await quoteList(source, [
        { itemIndex: 0, variantId: exact.variantId, quantity: 1 },
        { itemIndex: 1, variantId: substitute.variantId, quantity: 1 },
      ]);

      expect(quote.lines.map((line) => line.lineTotal)).toEqual([18, 27]);
      expect(quote.lines.every((line) => line.discounts[0]?.source === 'list-offer')).toBe(true);
    });

    it('forces reconfirmation when the offer changes, starts or ends between Quote and accept', async () => {
      const v = await createVariantWithStock({ price: '100.00', onHand: 50 });
      const source = await createPublishedList([{ variantId: v.variantId }]);
      const lines = [{ itemIndex: 0, variantId: v.variantId, quantity: 1 }];
      await setOffer(source.list.id, 1000);

      const changed = await quoteList(source, lines);
      await setOffer(source.list.id, 2000);
      const afterChange = await accept(changed.input, changed.quote.confirmation, 'offer-changed');
      expect(afterChange).toMatchObject({
        success: false,
        status: 409,
        error: { code: 'reconfirmation-required' },
      });
      if (!afterChange.success) {
        expect(afterChange.error.quote?.lines[0].lineTotal).toBe(80);
      }

      // Created after the Quote
      await testDb.db.delete(listOffers).where(eq(listOffers.listId, source.list.id));
      const noOffer = await quoteList(source, lines);
      await setOffer(source.list.id, 1000);
      expect(
        await accept(noOffer.input, noOffer.quote.confirmation, 'offer-created'),
      ).toMatchObject({
        success: false,
        error: { code: 'reconfirmation-required' },
      });

      // Ends between Quote and accept
      const active = await quoteList(source, lines);
      clockNow = offerEnd;
      expect(await accept(active.input, active.quote.confirmation, 'offer-ended')).toMatchObject({
        success: false,
        error: { code: 'reconfirmation-required' },
      });
      clockNow = new Date('2026-10-15T12:00:00.000Z');

      // Unchanged terms still accept
      const stable = await quoteList(source, lines);
      expect((await accept(stable.input, stable.quote.confirmation, 'offer-stable')).success).toBe(
        true,
      );
    });

    it('freezes the discount snapshot on the Order and its lines', async () => {
      const v = await createVariantWithStock({ price: '10.05', onHand: 20 });
      const w = await createVariantWithStock({ price: '20.00', onHand: 20 });
      const source = await createPublishedList([
        { variantId: v.variantId },
        { variantId: w.variantId },
      ]);
      await setOffer(source.list.id, 1000);
      const { input, quote } = await quoteList(source, [
        { itemIndex: 0, variantId: v.variantId, quantity: 1 },
        { itemIndex: 1, variantId: w.variantId, quantity: 2 },
      ]);

      const accepted = await accept(input, quote.confirmation, 'offer-snapshot');
      expect(accepted.success).toBe(true);
      if (!accepted.success) return;

      const [order] = await testDb.db
        .select()
        .from(orders)
        .where(eq(orders.id, accepted.data.order.id));
      const items = await testDb.db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id))
        .orderBy(orderItems.id);
      expect(order).toMatchObject({
        listOfferBasisPoints: 1000,
        discountTotal: '5.00',
        subtotal: '45.05',
        totalAmount: '95.05',
      });
      expect(items).toEqual([
        expect.objectContaining({ unitPrice: '10.05', discountAmount: '1.00', lineTotal: '9.05' }),
        expect.objectContaining({ unitPrice: '20.00', discountAmount: '4.00', lineTotal: '36.00' }),
      ]);

      await expect(
        testDb.db.update(orders).set({ discountTotal: '0' }).where(eq(orders.id, order.id)),
      ).rejects.toThrow();
      await expect(
        testDb.db.update(orders).set({ listOfferBasisPoints: 0 }).where(eq(orders.id, order.id)),
      ).rejects.toThrow();
      await expect(
        testDb.db
          .update(orderItems)
          .set({ discountAmount: '0' })
          .where(eq(orderItems.id, items[0].id)),
      ).rejects.toThrow();
      await expect(
        testDb.db.update(orderItems).set({ lineTotal: '1' }).where(eq(orderItems.id, items[0].id)),
      ).rejects.toThrow();
    });

    it('records no offer on a list order without an active offer, and on Cart orders', async () => {
      const v = await createVariantWithStock({ price: '12.00', onHand: 20 });
      const source = await createPublishedList([{ variantId: v.variantId }]);
      const { input, quote } = await quoteList(source, [
        { itemIndex: 0, variantId: v.variantId, quantity: 1 },
      ]);
      const accepted = await accept(input, quote.confirmation, 'no-offer-list');
      expect(accepted.success).toBe(true);
      if (!accepted.success) return;
      const [order] = await testDb.db
        .select()
        .from(orders)
        .where(eq(orders.id, accepted.data.order.id));
      expect(order).toMatchObject({ listOfferBasisPoints: null, discountTotal: '0.00' });

      const cartQuote = await offerService.validate({
        source: 'cart',
        lines: [{ variantId: v.variantId, quantity: 2 }],
      });
      if (!cartQuote.success) throw new Error('cart quote failed');
      const cart = await offerService.accept(
        {
          source: 'cart',
          lines: [{ variantId: v.variantId, quantity: 2 }],
          confirmation: cartQuote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'offer-customer@example.com',
        },
        { idempotencyKey: 'cart-no-offer', guestId: 'cart-no-offer' },
      );
      expect(cart.success).toBe(true);
      if (!cart.success) return;
      const [cartOrder] = await testDb.db
        .select()
        .from(orders)
        .where(eq(orders.id, cart.data.order.id));
      const [cartLine] = await testDb.db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, cartOrder.id));
      expect(cartOrder).toMatchObject({ listOfferBasisPoints: null, discountTotal: '0.00' });
      expect(cartLine).toMatchObject({
        unitPrice: '12.00',
        discountAmount: '0.00',
        lineTotal: '24.00',
      });
    });

    it('rejects an inverted or out-of-range offer in the database', async () => {
      const v = await createVariantWithStock();
      const source = await createPublishedList([{ variantId: v.variantId }]);
      await expect(setOffer(source.list.id, 1000, { endsAt: offerStart })).rejects.toThrow();
      await expect(setOffer(source.list.id, 10001)).rejects.toThrow();
      await expect(setOffer(source.list.id, -1)).rejects.toThrow();
    });
  });

  describe('Partner Points through the Order Acceptance seam', () => {
    it('creates one pending Reward Entitlement per attributed line from its post-discount total', async () => {
      const exact = await createVariantWithStock({ price: '10.05', onHand: 20 });
      const substitute = await createVariantWithStock({ price: '30.00', onHand: 20 });
      const source = await createPublishedList([
        { variantId: exact.variantId },
        {
          variantId: exact.variantId,
          exactItem: false,
          specification: { categoryId: substitute.categoryId, attributes: {} },
        },
      ]);
      const [rate] = await testDb.db
        .insert(rewardRates)
        .values({
          businessPartnerId: source.partner.id,
          pointsPerEgp: '2.000000',
          egpPerPoint: '0.0125',
        })
        .returning();
      await testDb.db.insert(listOffers).values({
        listId: source.list.id,
        basisPoints: 1000,
        startsAt: new Date('2026-01-01T00:00:00.000Z'),
        endsAt: null,
      });
      const input = {
        source: 'list' as const,
        publicCode: source.publicCode,
        lines: [
          { listItemId: source.items[0].id, variantId: exact.variantId, quantity: 1 },
          { listItemId: source.items[1].id, variantId: substitute.variantId, quantity: 1 },
        ],
      };

      const quote = await checkoutService.validate(input);
      expect(quote.success).toBe(true);
      if (!quote.success) return;
      expect(Object.keys(quote.data).sort()).toEqual([
        'confirmation',
        'currency',
        'lines',
        'shipping',
        'subtotal',
        'total',
      ]);

      const accepted = await checkoutService.accept(
        {
          ...input,
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'rewards-customer@example.com',
        },
        { idempotencyKey: 'rewards-entitlements', guestId: 'rewards-customer' },
      );
      expect(accepted.success).toBe(true);
      if (!accepted.success) return;

      const entitlements = await testDb.db
        .select()
        .from(rewardEntitlements)
        .where(eq(rewardEntitlements.businessPartnerId, source.partner.id))
        .orderBy(rewardEntitlements.orderItemId);
      expect(entitlements).toEqual([
        expect.objectContaining({
          rewardRateId: rate.id,
          chargedLineTotalPiasters: 905n,
          points: 18n,
          egpValuePiasters: 23n,
        }),
        expect.objectContaining({
          rewardRateId: rate.id,
          chargedLineTotalPiasters: 2700n,
          points: 54n,
          egpValuePiasters: 68n,
        }),
      ]);
      const events = await testDb.db
        .select()
        .from(rewardEvents)
        .where(eq(rewardEvents.businessPartnerId, source.partner.id))
        .orderBy(rewardEvents.entitlementId);
      expect(events).toEqual([
        expect.objectContaining({ eventType: 'accepted', points: 18n, egpValuePiasters: 23n }),
        expect.objectContaining({ eventType: 'accepted', points: 54n, egpValuePiasters: 68n }),
      ]);
      expect(await getPendingRewardTotals(testDb.db, source.partner.id)).toEqual({
        points: 72n,
        egpValuePiasters: 91n,
      });
    });
  });

  describe('Partner Points edge cases at acceptance', () => {
    const accept = (input: Record<string, unknown>, confirmation: string, key: string) =>
      checkoutService.accept(
        {
          ...input,
          confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'rewards-edge@example.com',
        } as never,
        { idempotencyKey: key, guestId: key },
      );

    it('accepts with no entitlement when no rate exists or the line earns zero points', async () => {
      const cheap = await createVariantWithStock({ price: '0.40', onHand: 5 });
      const source = await createPublishedList([{ variantId: cheap.variantId }]);
      const input = {
        source: 'list' as const,
        publicCode: source.publicCode,
        lines: [{ listItemId: source.items[0].id, variantId: cheap.variantId, quantity: 1 }],
      };

      const noRateQuote = await checkoutService.validate(input);
      if (!noRateQuote.success) throw new Error('quote failed');
      expect((await accept(input, noRateQuote.data.confirmation, 'no-rate')).success).toBe(true);

      await testDb.db.insert(rewardRates).values({
        businessPartnerId: source.partner.id,
        pointsPerEgp: '1.000000',
        egpPerPoint: '1.0000',
      });
      const zeroQuote = await checkoutService.validate(input);
      if (!zeroQuote.success) throw new Error('quote failed');
      expect((await accept(input, zeroQuote.data.confirmation, 'zero-pt')).success).toBe(true);

      expect(
        await testDb.db
          .select()
          .from(rewardEntitlements)
          .where(eq(rewardEntitlements.businessPartnerId, source.partner.id)),
      ).toEqual([]);
    });

    it('requires reconfirmation when the rate changes between Quote and accept', async () => {
      const item = await createVariantWithStock({ price: '10.00', onHand: 5 });
      const source = await createPublishedList([{ variantId: item.variantId }]);
      const input = {
        source: 'list' as const,
        publicCode: source.publicCode,
        lines: [{ listItemId: source.items[0].id, variantId: item.variantId, quantity: 1 }],
      };
      const quote = await checkoutService.validate(input);
      if (!quote.success) throw new Error('quote failed');

      await testDb.db.insert(rewardRates).values({
        businessPartnerId: source.partner.id,
        pointsPerEgp: '1.000000',
        egpPerPoint: '1.0000',
      });

      const result = await accept(input, quote.data.confirmation, 'rate-change');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('reconfirmation-required');
      expect(Object.keys((result.error as { quote: object }).quote)).not.toContain('rewardRate');
    });

    it('earns nothing on Cart orders', async () => {
      const item = await createVariantWithStock({ price: '10.00', onHand: 5 });
      const input = {
        source: 'cart' as const,
        lines: [{ variantId: item.variantId, quantity: 1 }],
      };
      const quote = await checkoutService.validate(input);
      if (!quote.success) throw new Error('quote failed');
      expect((await accept(input, quote.data.confirmation, 'cart-none')).success).toBe(true);
    });
  });

  describe('Integer-piaster Quote amounts', () => {
    // Prices where float sums diverge: 0.1 + 0.2 !== 0.3, and ten 0.1 lines sum to 0.9999999999999999.
    it('quotes and persists exact Cart amounts for float-hostile prices', async () => {
      const cheap = await createVariantWithStock({ price: '0.10', onHand: 50 });
      const mid = await createVariantWithStock({ price: '0.20', onHand: 50 });
      const odd = await createVariantWithStock({ price: '19.99', onHand: 50 });
      const lines = [
        { variantId: cheap.variantId, quantity: 3 },
        { variantId: mid.variantId, quantity: 7 },
        { variantId: odd.variantId, quantity: 13 },
      ];

      const quote = await checkoutService.validate({ source: 'cart', lines });
      expect(quote.success).toBe(true);
      if (!quote.success) return;
      // 0.30 + 1.40 + 259.87 = 261.57; +50 shipping
      expect(quote.data.subtotal).toBe(261.57);
      expect(quote.data.shipping).toBe(50);
      expect(quote.data.total).toBe(311.57);

      const accepted = await checkoutService.accept(
        {
          source: 'cart',
          lines,
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'piasters@example.com',
        },
        { idempotencyKey: 'piasters-cart-1' },
      );
      expect(accepted.success).toBe(true);
      if (!accepted.success) return;

      const [order] = await testDb.db
        .select()
        .from(orders)
        .where(eq(orders.id, accepted.data.order.id));
      expect(order.subtotal).toBe('261.57');
      expect(order.shippingCost).toBe('50.00');
      expect(order.totalAmount).toBe('311.57');
      expect(order.discountTotal).toBe('0.00');
      const items = await testDb.db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));
      expect(items.map((i) => i.lineTotal).sort()).toEqual(['0.30', '1.40', '259.87']);
    });

    it('sums many 0.10 Cart lines exactly', async () => {
      const lines = [];
      for (let i = 0; i < 12; i += 1) {
        const v = await createVariantWithStock({ price: '0.10', onHand: 5 });
        lines.push({ variantId: v.variantId, quantity: 1 });
      }
      const quote = await checkoutService.validate({ source: 'cart', lines });
      expect(quote.success).toBe(true);
      if (!quote.success) return;
      expect(quote.data.subtotal).toBe(1.2);
      expect(quote.data.total).toBe(51.2);
    });

    it('persists List amounts exactly as quoted, with a fractional shipping fee and an offer', async () => {
      const service = createCheckoutService({
        shippingFee: 49.99,
        clock: () => new Date('2026-10-15T12:00:00.000Z'),
      });
      const a = await createVariantWithStock({ price: '10.05', onHand: 20 });
      const b = await createVariantWithStock({ price: '0.10', onHand: 20 });
      const c = await createVariantWithStock({ price: '0.20', onHand: 20 });
      const source = await createPublishedList([
        { variantId: a.variantId },
        { variantId: b.variantId },
        { variantId: c.variantId },
      ]);
      await testDb.db.insert(listOffers).values({
        listId: source.list.id,
        basisPoints: 1000,
        startsAt: new Date('2026-10-01T00:00:00.000Z'),
        endsAt: new Date('2026-11-01T00:00:00.000Z'),
      });
      const input = {
        source: 'list' as const,
        publicCode: source.publicCode,
        lines: [a, b, c].map((v, index) => ({
          listItemId: source.items[index].id,
          variantId: v.variantId,
          quantity: 3,
        })),
      };

      const quote = await service.validate(input);
      expect(quote.success).toBe(true);
      if (!quote.success) return;
      // 3015x0.9=2713.5->2714; 30x0.9=27; 60x0.9=54 => 2795 piasters
      expect(quote.data.subtotal).toBe(27.95);
      expect(quote.data.shipping).toBe(49.99);
      expect(quote.data.total).toBe(77.94);

      const accepted = await service.accept(
        {
          ...input,
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address: validAddress,
          guestEmail: 'piasters-list@example.com',
        },
        { idempotencyKey: 'piasters-list-1' },
      );
      expect(accepted.success).toBe(true);
      if (!accepted.success) return;

      const [order] = await testDb.db
        .select()
        .from(orders)
        .where(eq(orders.id, accepted.data.order.id));
      expect(order.subtotal).toBe('27.95');
      expect(order.shippingCost).toBe('49.99');
      expect(order.totalAmount).toBe('77.94');
      // gross 3015+30+60 = 3105 piasters, net 2795, discount 310
      expect(order.discountTotal).toBe('3.10');
      const listItems = await testDb.db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));
      expect(listItems.map((i) => [i.unitPrice, i.discountAmount, i.lineTotal]).sort()).toEqual(
        [
          ['0.10', '0.03', '0.27'],
          ['0.20', '0.06', '0.54'],
          ['10.05', '3.01', '27.14'],
        ].sort(),
      );
    });

    it('reads the CHECKOUT_FLAT_SHIPPING_FEE override once as piasters', async () => {
      const previous = process.env.CHECKOUT_FLAT_SHIPPING_FEE;
      process.env.CHECKOUT_FLAT_SHIPPING_FEE = '35.5';
      try {
        const service = createCheckoutService();
        const v = await createVariantWithStock({ price: '1.10', onHand: 5 });
        const quote = await service.validate({
          source: 'cart',
          lines: [{ variantId: v.variantId, quantity: 1 }],
        });
        expect(quote.success && quote.data.shipping).toBe(35.5);
        process.env.CHECKOUT_FLAT_SHIPPING_FEE = '1.005';
        expect(() => createCheckoutService()).toThrow(/Invalid shipping fee/);
      } finally {
        if (previous === undefined) delete process.env.CHECKOUT_FLAT_SHIPPING_FEE;
        else process.env.CHECKOUT_FLAT_SHIPPING_FEE = previous;
      }
    });

    it('refuses to start with a fractional-piaster or invalid shipping fee', () => {
      expect(() => createCheckoutService({ shippingFee: 10.005 })).toThrow(/Invalid shipping fee/);
      expect(() => createCheckoutService({ shippingFee: Number.NaN })).toThrow(
        /Invalid shipping fee/,
      );
    });
  });
});
