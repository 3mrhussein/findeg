import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import {
  auditLog,
  businessPartners,
  categories,
  inventoryBalances,
  orderItems,
  orders,
  outbox,
  products,
  productVariants,
  rewardEntitlements,
  rewardEvents,
  rewardRates,
  stockMovements,
  users,
  warehouses,
} from '@findeg/db/schema';
import { PERMISSION_CODES } from '@findeg/db';
import { createCheckoutService } from '../../checkout';
import { createAdministrationServices, OrderWriteForbiddenError, type OrderStaffActor } from '..';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';

describe('Staff authorization for Dashboard order writes', () => {
  let testDb: TestDatabase;
  let sequence = 0;
  const checkout = createCheckoutService({ shippingFee: 50 });
  const readOnlyStaff: OrderStaffActor = {
    kind: 'staff',
    userId: 1,
    permissionCodes: [PERMISSION_CODES.ADMIN_ORDERS_READ],
    activeRoleIds: [],
  };

  let partnerId: number;
  let rateId: number;

  beforeAll(async () => {
    testDb = connectToTestDatabase();
    const [partner] = await testDb.db
      .insert(businessPartners)
      .values({ code: 'authz-school', nameEn: 'Authz School', nameAr: 'مدرسة' })
      .returning();
    partnerId = partner.id;
    const [rate] = await testDb.db
      .insert(rewardRates)
      .values({ businessPartnerId: partnerId, pointsPerEgp: '1.000000', egpPerPoint: '0.0100' })
      .returning();
    rateId = rate.id;
  });
  afterAll(async () => testDb.close());

  async function acceptOrder() {
    sequence += 1;
    const [category] = await testDb.db
      .insert(categories)
      .values({ slug: `authz-category-${sequence}` })
      .returning();
    const [product] = await testDb.db
      .insert(products)
      .values({
        slug: `authz-product-${sequence}`,
        localizedName: { en: 'Notebook', ar: 'كشكول' },
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
        sku: `AUTHZ-${sequence}`,
        basePrice: '25.00',
        localizedLabel: { en: 'Default' },
      })
      .returning();
    const [warehouse] = await testDb.db
      .insert(warehouses)
      .values({ code: `authz-warehouse-${sequence}`, name: 'Cairo Main' })
      .returning();
    await testDb.db
      .insert(inventoryBalances)
      .values({ variantId: variant.id, warehouseId: warehouse.id, onHand: 10 });

    const lines = [{ variantId: variant.id, quantity: 2 }];
    const quote = await checkout.validate({ source: 'cart', lines });
    if (!quote.success) throw new Error(`Quote failed: ${quote.error.message}`);
    const accepted = await checkout.accept(
      {
        source: 'cart',
        lines,
        confirmation: quote.data.confirmation,
        paymentMethod: 'cod',
        guestEmail: `authz-${sequence}@example.com`,
        address: {
          fullName: 'Ahmed Hassan',
          phone: '01012345678',
          city: 'Cairo',
          area: 'Nasr City',
          street: 'Abbas El Akkad',
          building: '15',
        },
      },
      { idempotencyKey: `authz-${sequence}` },
    );
    if (!accepted.success) throw new Error(`Acceptance failed: ${accepted.error.message}`);
    return {
      orderId: accepted.data.order.id,
      orderReference: accepted.data.order.orderReference,
      variantId: variant.id,
    };
  }

  /** An Order holding an accepted reward, one status or payment change away from earning it. */
  async function rewardedOrder(state: {
    status: 'shipped' | 'delivered';
    paymentStatus: 'unpaid' | 'paid';
  }) {
    sequence += 1;
    const [order] = await testDb.db
      .insert(orders)
      .values({
        orderReference: `FE-AZ${String(sequence).padStart(4, '0')}`,
        totalAmount: '100.00',
        ...state,
      })
      .returning();
    const [item] = await testDb.db
      .insert(orderItems)
      .values({ orderId: order.id, quantity: 1, lineTotal: '100.00' })
      .returning();
    const [entitlement] = await testDb.db
      .insert(rewardEntitlements)
      .values({
        businessPartnerId: partnerId,
        orderItemId: item.id,
        rewardRateId: rateId,
        chargedLineTotalPiasters: 10_000n,
        points: 100n,
        egpValuePiasters: 100n,
      })
      .returning();
    await testDb.db.insert(rewardEvents).values({
      businessPartnerId: partnerId,
      entitlementId: entitlement.id,
      eventType: 'accepted',
      points: 100n,
      egpValuePiasters: 100n,
    });
    return {
      orderId: order.id,
      orderReference: order.orderReference,
      entitlementId: entitlement.id,
    };
  }

  async function rewardEventTypes(entitlementId: number) {
    const events = await testDb.db
      .select({ eventType: rewardEvents.eventType })
      .from(rewardEvents)
      .where(eq(rewardEvents.entitlementId, entitlementId));
    return events.map((event) => event.eventType).sort();
  }

  /** Everything a status or payment change could write for the Order. */
  async function orderFootprint(orderId: number, orderReference: string, variantId: number) {
    const [order] = await testDb.db
      .select({ status: orders.status, paymentStatus: orders.paymentStatus })
      .from(orders)
      .where(eq(orders.id, orderId));
    const [balance] = await testDb.db
      .select({ onHand: inventoryBalances.onHand, reserved: inventoryBalances.reserved })
      .from(inventoryBalances)
      .where(eq(inventoryBalances.variantId, variantId));
    const movements = await testDb.db
      .select({ movementType: stockMovements.movementType })
      .from(stockMovements)
      .where(eq(stockMovements.referenceId, String(orderId)));
    const outboxRows = (await testDb.db.select({ id: outbox.id }).from(outbox)).filter((row) =>
      row.id.includes(orderReference),
    );
    const audits = await testDb.db
      .select({ action: auditLog.action })
      .from(auditLog)
      .where(eq(auditLog.entityId, String(orderId)));
    return { order, balance, movements, outboxRows, audits };
  }

  it('refuses a status change from Staff without order-write permission and changes nothing', async () => {
    const { orderId, orderReference, variantId } = await acceptOrder();
    const before = await orderFootprint(orderId, orderReference, variantId);

    await expect(
      createAdministrationServices().orders.updateStatus(readOnlyStaff, orderId, {
        status: 'cancelled',
      }),
    ).rejects.toBeInstanceOf(OrderWriteForbiddenError);

    const after = await orderFootprint(orderId, orderReference, variantId);
    expect(after).toEqual(before);
    expect(after.order).toEqual({ status: 'pending', paymentStatus: 'unpaid' });
    expect(after.balance).toEqual({ onHand: 10, reserved: 2 });
  });

  it('refuses a payment change from Staff without order-write permission and earns nothing', async () => {
    const { orderId, orderReference, entitlementId } = await rewardedOrder({
      status: 'delivered',
      paymentStatus: 'unpaid',
    });
    const before = await orderFootprint(orderId, orderReference, 0);

    await expect(
      createAdministrationServices().orders.updatePaymentStatus(readOnlyStaff, orderId, 'paid'),
    ).rejects.toBeInstanceOf(OrderWriteForbiddenError);

    expect(await orderFootprint(orderId, orderReference, 0)).toEqual(before);
    expect(before.order).toEqual({ status: 'delivered', paymentStatus: 'unpaid' });
    expect(await rewardEventTypes(entitlementId)).toEqual(['accepted']);
  });

  it('refuses a status change with no Staff actor and earns nothing', async () => {
    const { orderId, orderReference, entitlementId } = await rewardedOrder({
      status: 'shipped',
      paymentStatus: 'paid',
    });
    const before = await orderFootprint(orderId, orderReference, 0);

    await expect(
      createAdministrationServices().orders.updateStatus(undefined as never, orderId, {
        status: 'delivered',
      }),
    ).rejects.toBeInstanceOf(OrderWriteForbiddenError);

    expect(await orderFootprint(orderId, orderReference, 0)).toEqual(before);
    expect(before.order).toEqual({ status: 'shipped', paymentStatus: 'paid' });
    expect(await rewardEventTypes(entitlementId)).toEqual(['accepted']);
  });

  async function orderWriter(): Promise<OrderStaffActor> {
    sequence += 1;
    const [user] = await testDb.db
      .insert(users)
      .values({ email: `order-writer-${sequence}@example.com`, portalRole: 'staff' })
      .returning();
    return {
      kind: 'staff',
      userId: user.id,
      permissionCodes: [PERMISSION_CODES.ADMIN_ORDERS_WRITE],
      activeRoleIds: [],
    };
  }

  it('records the Staff member who changed the status on its audit row', async () => {
    const writer = await orderWriter();
    const { orderId } = await acceptOrder();
    const administration = createAdministrationServices();

    await administration.orders.updateStatus(writer, orderId, { status: 'confirmed' });

    expect(await administration.auditLog.getEntityLogs('order', String(orderId))).toEqual([
      expect.objectContaining({ action: 'update_status', adminUserId: writer.userId }),
    ]);
  });
});
