import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import {
  auditLog,
  categories,
  inventoryBalances,
  orderItems,
  orders,
  outbox,
  products,
  productVariants,
  stockMovements,
  users,
  warehouses,
} from '@findeg/db/schema';
import { PERMISSION_CODES } from '@findeg/db';
import { createCheckoutService } from '../../checkout';
import { createOrders, type OrderStaffActor } from '@findeg/orders';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';

const notAuthorized = { code: 'NOT_AUTHORIZED', message: 'Not authorized to change orders' };

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

  beforeAll(() => {
    testDb = connectToTestDatabase();
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

  /** An Order one status or payment change away from delivered and paid. */
  async function orderInState(state: {
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
    await testDb.db
      .insert(orderItems)
      .values({ orderId: order.id, quantity: 1, lineTotal: '100.00' });
    return { orderId: order.id, orderReference: order.orderReference };
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
      createOrders({ db: testDb.db }).changeStatus(readOnlyStaff, orderId, {
        status: 'cancelled',
      }),
    ).rejects.toMatchObject(notAuthorized);

    const after = await orderFootprint(orderId, orderReference, variantId);
    expect(after).toEqual(before);
    expect(after.order).toEqual({ status: 'pending', paymentStatus: 'unpaid' });
    expect(after.balance).toEqual({ onHand: 10, reserved: 2 });
  });

  it('refuses delivering a paid Order for Staff without order-write permission', async () => {
    const { orderId, orderReference } = await orderInState({
      status: 'shipped',
      paymentStatus: 'paid',
    });
    const before = await orderFootprint(orderId, orderReference, 0);

    await expect(
      createOrders({ db: testDb.db }).changeStatus(readOnlyStaff, orderId, {
        status: 'delivered',
      }),
    ).rejects.toMatchObject(notAuthorized);

    expect(await orderFootprint(orderId, orderReference, 0)).toEqual(before);
    expect(before.order).toEqual({ status: 'shipped', paymentStatus: 'paid' });
  });

  it('refuses a payment change from Staff without order-write permission and changes nothing', async () => {
    const { orderId, orderReference } = await orderInState({
      status: 'delivered',
      paymentStatus: 'unpaid',
    });
    const before = await orderFootprint(orderId, orderReference, 0);

    await expect(
      createOrders({ db: testDb.db }).changePaymentStatus(readOnlyStaff, orderId, 'paid'),
    ).rejects.toMatchObject(notAuthorized);

    expect(await orderFootprint(orderId, orderReference, 0)).toEqual(before);
    expect(before.order).toEqual({ status: 'delivered', paymentStatus: 'unpaid' });
  });

  it('refuses a status change with no Staff actor and changes nothing', async () => {
    const { orderId, orderReference } = await orderInState({
      status: 'shipped',
      paymentStatus: 'paid',
    });
    const before = await orderFootprint(orderId, orderReference, 0);

    await expect(
      createOrders({ db: testDb.db }).changeStatus(undefined as never, orderId, {
        status: 'delivered',
      }),
    ).rejects.toMatchObject(notAuthorized);

    expect(await orderFootprint(orderId, orderReference, 0)).toEqual(before);
    expect(before.order).toEqual({ status: 'shipped', paymentStatus: 'paid' });
  });

  it('refuses a payment change with no Staff actor and changes nothing', async () => {
    const { orderId, orderReference } = await orderInState({
      status: 'delivered',
      paymentStatus: 'unpaid',
    });
    const before = await orderFootprint(orderId, orderReference, 0);

    await expect(
      createOrders({ db: testDb.db }).changePaymentStatus(undefined as never, orderId, 'paid'),
    ).rejects.toMatchObject(notAuthorized);

    expect(await orderFootprint(orderId, orderReference, 0)).toEqual(before);
    expect(before.order).toEqual({ status: 'delivered', paymentStatus: 'unpaid' });
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
    const ordersApi = createOrders({ db: testDb.db });

    await ordersApi.changeStatus(writer, orderId, { status: 'confirmed' });

    expect((await ordersApi.detail(orderId))!.activity).toEqual([
      expect.objectContaining({ action: 'update_status', adminId: writer.userId }),
    ]);
  });
});
