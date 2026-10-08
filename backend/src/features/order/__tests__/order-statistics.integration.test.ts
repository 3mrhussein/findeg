import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { orders, orderItems, products, users, auditLog } from '@findeg/db/schema';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import { createOrderStatistics } from '../statistics';
import { createOrders } from '../factory';

describe('Order statistics on the injected Postgres database', () => {
  let database: TestDatabase;
  beforeAll(() => {
    database = connectToTestDatabase();
  });
  afterAll(async () => database.close());

  async function seed(
    at: string,
    totalAmount: string,
    status: 'pending' | 'cancelled' = 'pending',
  ) {
    const [order] = await database.db
      .insert(orders)
      .values({
        createdAt: new Date(at),
        totalAmount,
        subtotal: totalAmount,
        status,
      })
      .returning();
    return order;
  }

  it('sums exact decimal amounts across every status and uses canonical charged line totals', async () => {
    const [product] = await database.db
      .insert(products)
      .values({
        slug: 'order-statistics-canonical',
        localizedName: { en: 'Discounted notebook' },
        localizedDescription: { en: '' },
        localizedLongDescription: { en: '' },
      })
      .returning();
    const first = await seed('2096-01-09T22:00:00Z', '10.05');
    const second = await seed('2096-01-10T10:00:00Z', '0.10', 'cancelled');
    await database.db.insert(orderItems).values([
      {
        orderId: first.id,
        productId: product.id,
        quantity: 1,
        unitPrice: '20.00',
        discountAmount: '9.95',
        lineTotal: '10.05',
        totalPrice: '20.00',
      },
      {
        orderId: second.id,
        productId: product.id,
        quantity: 1,
        unitPrice: '0.10',
        lineTotal: '0.10',
        totalPrice: '7.00',
      },
    ]);
    const stats = await createOrderStatistics({
      db: database.db,
      now: () => new Date('2096-01-10T12:00:00Z'),
    }).getStats({ from: '2096-01-10', to: '2096-01-10', trendDays: 2 });
    expect(stats.totalOrders).toBe(2);
    expect(stats.totalRevenue).toBe(1015n);
    expect(stats.todayRevenue).toBe(1015n);
    expect(stats.ordersByStatus).toEqual({
      pending: 1,
      cancelled: 1,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      refunded: 0,
    });
    expect(stats.revenueByPeriod).toEqual([{ date: '2096-01-10', revenue: 1015n }]);
    expect(stats.topProducts).toEqual([
      { id: product.id, name: 'Discounted notebook', sold: 2, revenue: 1015n },
    ]);
  });

  it('uses Cairo summer day boundaries and excludes the following midnight', async () => {
    await seed('2096-07-09T20:59:59Z', '100.00');
    await seed('2096-07-09T21:00:00Z', '0.01');
    await seed('2096-07-10T20:59:59Z', '0.02');
    await seed('2096-07-10T21:00:00Z', '100.00');
    const stats = await createOrderStatistics({
      db: database.db,
      now: () => new Date('2096-07-10T12:00:00Z'),
    }).getStats({ from: '2096-07-10', to: '2096-07-10' });
    expect(stats.totalOrders).toBe(2);
    expect(stats.totalRevenue).toBe(3n);
    expect(stats.todayOrders).toBe(2);
    expect(stats.revenueByPeriod).toEqual([{ date: '2096-07-10', revenue: 3n }]);
  });

  it('zero fills the calendar trend and returns every empty status', async () => {
    const stats = await createOrderStatistics({
      db: database.db,
      now: () => new Date('2097-03-02T12:00:00Z'),
    }).getStats({ from: '2097-03-01', to: '2097-03-02', trendDays: 2 });
    expect(stats.totalOrders).toBe(0);
    expect(stats.totalRevenue).toBe(0n);
    expect(Object.values(stats.ordersByStatus)).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(stats.revenueByPeriod).toEqual([
      { date: '2097-03-01', revenue: 0n },
      { date: '2097-03-02', revenue: 0n },
    ]);
    expect(stats.topProducts).toEqual([]);
  });

  it('shares Cairo skipped-midnight and repeated-hour boundaries between lists and statistics', async () => {
    // Egypt starts DST on the last Friday in April: 27 April in 2096.
    await seed('2096-04-26T21:59:59Z', '100.00');
    const afterSkip = await seed('2096-04-26T22:00:00Z', '0.03');
    const service = createOrders({ db: database.db, now: () => new Date('2096-04-27T12:00:00Z') });
    const skippedDay = { from: '2096-04-27', to: '2096-04-27' };
    expect((await service.list(skippedDay)).orders.map((order) => order.id)).toEqual([
      afterSkip.id,
    ]);
    expect((await service.getStats(skippedDay)).todayRevenue).toBe(3n);

    // Both instances of Cairo 23:30 on 25 October belong to that same day.
    const firstHour = await seed('2096-10-25T20:30:00Z', '0.04');
    const repeatedHour = await seed('2096-10-25T21:30:00Z', '0.05');
    await seed('2096-10-25T22:00:00Z', '100.00');
    const repeatedDay = { from: '2096-10-25', to: '2096-10-25' };
    expect((await service.list(repeatedDay)).orders.map((order) => order.id)).toEqual([
      repeatedHour.id,
      firstHour.id,
    ]);
    expect((await service.getStats(repeatedDay)).totalRevenue).toBe(9n);
  });

  it('returns an empty trend when the requested range does not intersect the trend window', async () => {
    const stats = await createOrders({
      db: database.db,
      now: () => new Date('2097-03-02T12:00:00Z'),
    }).getStats({ from: '2098-01-01', to: '2098-01-02' });
    expect(stats.revenueByPeriod).toEqual([]);
  });

  it.each([0, -1, 0.5, NaN, Infinity, 2147483648])(
    'rejects invalid IDs before loading the default database: %s',
    async (id) => {
      const service = createOrders();
      await expect(service.get(id)).rejects.toThrow(RangeError);
      await expect(service.detail(id)).rejects.toThrow(RangeError);
      await expect(service.listForCustomer(id)).rejects.toThrow(RangeError);
      await expect(service.latestShippingAddress(id)).rejects.toThrow(RangeError);
    },
  );

  it.each([
    { from: '2096-02-30' },
    { from: '2096-3-1' },
    { from: '2096-03-02', to: '2096-03-01' },
    { trendDays: 0 },
    { trendDays: 1.5 },
    { trendDays: 367 },
    { topProductsLimit: 0 },
    { topProductsLimit: 101 },
  ])('rejects invalid options before resolving a connection: %j', async (options) => {
    await expect(createOrderStatistics().getStats(options)).rejects.toThrow(RangeError);
  });

  it('uses injected reads, batches canonical lines and selects the latest non-null shipping snapshot', async () => {
    const [customer] = await database.db
      .insert(users)
      .values({
        email: 'order-statistics-reader@example.com',
        firstName: 'Read',
        lastName: 'Customer',
      })
      .returning();
    const address = {
      fullName: 'Shipping Name',
      phone: '01012345678',
      city: 'Cairo',
      area: 'Nasr City',
      street: 'Street',
      building: '5',
    };
    const [older, latest, withoutAddress] = await database.db
      .insert(orders)
      .values([
        {
          userId: customer.id,
          totalAmount: '15.05',
          subtotal: '10.05',
          shippingCost: '5.00',
          discountTotal: '9.95',
          createdAt: new Date('2098-01-01T10:00:00Z'),
          shippingAddressSnapshot: address,
        },
        {
          userId: customer.id,
          totalAmount: '0.00',
          createdAt: new Date('2098-01-02T10:00:00Z'),
          shippingAddressSnapshot: { ...address, building: '6' },
        },
        { userId: customer.id, totalAmount: '0.00', createdAt: new Date('2098-01-03T10:00:00Z') },
      ])
      .returning();
    await database.db.insert(orderItems).values({
      orderId: older.id,
      quantity: 1,
      unitPrice: '20.00',
      discountAmount: '9.95',
      lineTotal: '10.05',
      totalPrice: '20.00',
      productNameSnapshot: 'Deleted product',
      productId: null,
    });
    const service = createOrders({ db: database.db });
    expect(await service.get(older.id)).toEqual(
      expect.objectContaining({
        subtotal: 1005n,
        shippingCost: 500n,
        discountTotal: 995n,
        totalAmount: 1505n,
        customerName: 'Read Customer',
        customerEmail: customer.email,
        items: [
          expect.objectContaining({
            productId: null,
            unitPrice: 2000n,
            discountAmount: 995n,
            lineTotal: 1005n,
          }),
        ],
      }),
    );
    expect((await service.listForCustomer(customer.id)).map((order) => order.id)).toEqual([
      withoutAddress.id,
      latest.id,
      older.id,
    ]);
    const page = await service.list({ userId: customer.id, limit: 1, offset: 1 });
    expect(page.total).toBe(3);
    expect(page.orders.map((order) => order.id)).toEqual([latest.id]);
    expect(await service.latestShippingAddress(customer.id)).toEqual({ ...address, building: '6' });
    expect(
      (await service.list({ search: older.orderReference })).orders.map((order) => order.id),
    ).toEqual([older.id]);
    expect(await service.get(2147483647)).toBeNull();
  });

  it('returns ordered activity with Staff identity and tolerates missing Staff', async () => {
    const order = await seed('2099-01-01T10:00:00Z', '0.00');
    const [staff] = await database.db
      .insert(users)
      .values({
        email: 'order-statistics-staff@example.com',
        firstName: 'Order',
        lastName: 'Staff',
      })
      .returning();
    const [first, second] = await database.db
      .insert(auditLog)
      .values([
        {
          entityType: 'order',
          entityId: String(order.id),
          action: 'update_status',
          adminUserId: staff.id,
          oldValues: { status: 'pending' },
          newValues: { status: 'confirmed' },
          createdAt: new Date('2099-01-01T12:00:00Z'),
        },
        {
          entityType: 'order',
          entityId: String(order.id),
          action: 'update_payment_status',
          oldValues: { paymentStatus: 'unpaid' },
          newValues: { paymentStatus: 'paid' },
          createdAt: new Date('2099-01-01T12:00:00Z'),
        },
      ])
      .returning();
    const detail = await createOrders({ db: database.db }).detail(order.id);
    expect(detail?.activity).toEqual([
      expect.objectContaining({
        id: second.id,
        adminName: undefined,
        oldValue: 'unpaid',
        newValue: 'paid',
      }),
      expect.objectContaining({
        id: first.id,
        adminId: staff.id,
        adminName: 'Order Staff',
        adminEmail: staff.email,
        oldValue: 'pending',
        newValue: 'confirmed',
      }),
    ]);
  });
});
