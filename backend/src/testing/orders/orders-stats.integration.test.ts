import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { orders, orderItems, products } from '@findeg/db/schema';
import { createOrders } from '@findeg/orders';
import { connectToTestDatabase, type TestDatabase } from '../postgres';

describe('Orders statistics through the public PostgreSQL API', () => {
  let database: TestDatabase;
  beforeAll(() => {
    database = connectToTestDatabase();
  });
  afterAll(() => database.close());
  it('returns exact empty aggregates and a Cairo calendar trend', async () => {
    const result = await createOrders({
      db: database.db,
      now: () => new Date('2026-04-24T12:00:00Z'),
    }).getStats({ from: '2026-04-23', to: '2026-04-24', trendDays: 2 });
    expect(result).toMatchObject({
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      totalOrders: 0,
      totalRevenue: 0n,
      todayOrders: 0,
      todayRevenue: 0n,
      topProducts: [],
      revenueByPeriod: [
        { date: '2026-04-23', revenue: 0n },
        { date: '2026-04-24', revenue: 0n },
      ],
    });
  });
  it('includes every status at exact accepted value and intersects trend/today with inclusive Cairo dates across DST', async () => {
    const statuses = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
    ] as const;
    for (const [index, status] of statuses.entries()) {
      await database.db.insert(orders).values({
        orderReference: `FE-ST${String(index).padStart(4, '0')}`,
        status,
        subtotal: '0.10',
        shippingCost: '0.00',
        discountTotal: '0.00',
        totalAmount: '0.10',
        createdAt: new Date('2026-04-23T22:00:00Z'),
      });
    }
    // Cairo starts DST at local midnight on April 24: the day starts at 22:00 UTC,
    // and its next midnight is at 21:00 UTC. Both edges must use the local calendar.
    await database.db.insert(orders).values([
      {
        orderReference: 'FE-STE001',
        subtotal: '0.01',
        totalAmount: '0.01',
        createdAt: new Date('2026-04-23T21:59:59Z'),
      },
      {
        orderReference: 'FE-STE002',
        subtotal: '0.02',
        totalAmount: '0.02',
        createdAt: new Date('2026-04-24T20:59:59Z'),
      },
      {
        orderReference: 'FE-STE003',
        subtotal: '0.03',
        totalAmount: '0.03',
        createdAt: new Date('2026-04-24T21:00:00Z'),
      },
    ]);
    const api = createOrders({ db: database.db, now: () => new Date('2026-04-24T18:00:00Z') });
    expect(await api.getStats({ from: '2026-04-24', to: '2026-04-24' })).toMatchObject({
      totalOrders: 8,
      totalRevenue: 72n,
      todayOrders: 8,
      todayRevenue: 72n,
      ordersByStatus: {
        pending: 2,
        confirmed: 1,
        processing: 1,
        shipped: 1,
        delivered: 1,
        cancelled: 1,
        refunded: 1,
      },
      revenueByPeriod: [{ date: '2026-04-24', revenue: 72n }],
    });
    expect(await api.getStats({ from: '2026-04-23', to: '2026-04-23' })).toMatchObject({
      totalOrders: 1,
      totalRevenue: 1n,
      todayOrders: 0,
      todayRevenue: 0n,
      revenueByPeriod: [{ date: '2026-04-23', revenue: 1n }],
    });
    expect((await api.getStats({ from: '2026-05-01' })).revenueByPeriod).toEqual([]);
  });
  it('ranks current catalog products by units with ID ties and canonical line revenue', async () => {
    const [first, second, deleted] = await database.db
      .insert(products)
      .values([
        {
          localizedName: { en: 'First' },
          localizedDescription: { en: '' },
          localizedLongDescription: { en: '' },
        },
        {
          localizedName: { en: 'Second' },
          localizedDescription: { en: '' },
          localizedLongDescription: { en: '' },
        },
        {
          localizedName: { en: 'Deleted' },
          localizedDescription: { en: '' },
          localizedLongDescription: { en: '' },
        },
      ])
      .returning();
    const [row] = await database.db
      .insert(orders)
      .values({
        orderReference: 'FE-STP001',
        subtotal: '50.37',
        totalAmount: '50.37',
        createdAt: new Date('2025-02-19T08:00:00Z'),
      })
      .returning();
    await database.db.insert(orderItems).values([
      {
        orderId: row.id,
        productId: first.id,
        quantity: 3,
        unitPrice: '9.99',
        discountAmount: '1.01',
        lineTotal: '28.96',
        productNameSnapshot: 'Old first',
      },
      {
        orderId: row.id,
        productId: second.id,
        quantity: 3,
        unitPrice: '7.14',
        discountAmount: '0.01',
        lineTotal: '21.41',
      },
      { orderId: row.id, productId: deleted.id, quantity: 10, unitPrice: '0', lineTotal: '0' },
    ]);
    await database.sql`delete from catalog.products where id = ${deleted.id}`;
    const api = createOrders({ db: database.db, now: () => new Date('2025-02-19T08:00:00Z') });
    expect((await api.getStats({ from: '2025-02-19', to: '2025-02-19' })).topProducts).toEqual([
      { id: first.id, name: 'First', sold: 3, revenue: 2896n },
      { id: second.id, name: 'Second', sold: 3, revenue: 2141n },
    ]);
    expect(
      (await api.getStats({ from: '2025-02-19', to: '2025-02-19', topProductsLimit: 1 }))
        .topProducts,
    ).toHaveLength(1);
    expect((await api.getStats({ from: '2025-02-01', to: '2025-02-18' })).topProducts).toEqual([]);
  });

  it('handles the repeated Cairo hour at the autumn DST boundary', async () => {
    await database.db.insert(orders).values([
      {
        orderReference: 'FE-STF001',
        subtotal: '1.00',
        totalAmount: '1.00',
        createdAt: new Date('2026-10-29T20:59:59Z'),
      },
      {
        orderReference: 'FE-STF002',
        subtotal: '2.00',
        totalAmount: '2.00',
        createdAt: new Date('2026-10-29T21:00:00Z'),
      },
      {
        orderReference: 'FE-STF003',
        subtotal: '3.00',
        totalAmount: '3.00',
        createdAt: new Date('2026-10-29T21:59:59Z'),
      },
      {
        orderReference: 'FE-STF004',
        subtotal: '4.00',
        totalAmount: '4.00',
        createdAt: new Date('2026-10-29T22:00:00Z'),
      },
    ]);
    const api = createOrders({ db: database.db, now: () => new Date('2026-10-30T12:00:00Z') });
    expect(
      await api.getStats({ from: '2026-10-29', to: '2026-10-29', trendDays: 2 }),
    ).toMatchObject({
      totalOrders: 3,
      totalRevenue: 600n,
      todayOrders: 0,
      todayRevenue: 0n,
      revenueByPeriod: [{ date: '2026-10-29', revenue: 600n }],
    });
    expect(await api.getStats({ from: '2026-10-30', to: '2026-10-30' })).toMatchObject({
      totalOrders: 1,
      totalRevenue: 400n,
    });
  });
  it('uses one coherent snapshot while new Orders are accepted concurrently', async () => {
    const [product] = await database.db
      .insert(products)
      .values({
        localizedName: { en: 'Concurrent' },
        localizedDescription: { en: '' },
        localizedLongDescription: { en: '' },
      })
      .returning();
    const [row] = await database.db
      .insert(orders)
      .values({
        orderReference: 'FE-STC001',
        subtotal: '1.00',
        totalAmount: '1.00',
        createdAt: new Date('2027-01-01T08:00:00Z'),
      })
      .returning();
    await database.db.insert(orderItems).values({
      orderId: row.id,
      productId: product.id,
      quantity: 1,
      unitPrice: '1.00',
      lineTotal: '1.00',
    });
    const api = createOrders({ db: database.db, now: () => new Date('2027-01-01T12:00:00Z') });
    await Promise.all([
      (async () => {
        for (let index = 0; index < 30; index++) {
          await database.db.transaction(async (tx) => {
            const [accepted] = await tx
              .insert(orders)
              .values({
                orderReference: `FE-SC${String(index).padStart(4, '0')}`,
                subtotal: '1.00',
                totalAmount: '1.00',
                createdAt: new Date('2027-01-01T08:00:00Z'),
              })
              .returning();
            await tx.insert(orderItems).values({
              orderId: accepted.id,
              productId: product.id,
              quantity: 1,
              unitPrice: '1.00',
              lineTotal: '1.00',
            });
          });
        }
      })(),
      (async () => {
        for (let index = 0; index < 15; index++) {
          const result = await api.getStats({ from: '2027-01-01', to: '2027-01-01' });
          expect(result.totalRevenue).toBe(BigInt(result.totalOrders) * 100n);
          expect(result.todayRevenue).toBe(result.totalRevenue);
          expect(result.topProducts[0].revenue).toBe(result.totalRevenue);
          expect(result.revenueByPeriod[0].revenue).toBe(result.totalRevenue);
          expect(result.ordersByStatus.pending).toBe(result.totalOrders);
        }
      })(),
    ]);
  });
});
