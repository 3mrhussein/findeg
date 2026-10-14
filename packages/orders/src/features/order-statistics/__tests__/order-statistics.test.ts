import { describe, expect, it } from 'vitest';
import { createOrders } from '../../../helpers';
import { fakeDatabase } from '../../../__tests__/fixture';

const instant = new Date('2026-10-14T08:00:00Z');

describe('Order statistics', () => {
  it('summarises totals, status counts, the revenue trend and top products', async () => {
    const fake = fakeDatabase(
      [{ totalOrders: 3, revenue: '300.00', todayOrders: 1, todayRevenue: '100.00' }],
      [
        { status: 'pending', count: 2 },
        { status: 'delivered', count: 1 },
      ],
      [
        { date: '2026-10-13', revenue: '0.00' },
        { date: '2026-10-14', revenue: '300.00' },
      ],
      [{ id: 3, name: 'Notebook', sold: 2, revenue: '100.00' }],
    );
    const stats = await createOrders({ db: fake.db as never, now: () => instant }).getStats({
      from: '2026-10-01',
      to: '2026-10-14',
      trendDays: 2,
      topProductsLimit: 1,
    });
    expect(stats).toEqual({
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      totalOrders: 3,
      totalRevenue: 30_000n,
      todayOrders: 1,
      todayRevenue: 10_000n,
      ordersByStatus: {
        pending: 2,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 1,
        cancelled: 0,
        refunded: 0,
      },
      revenueByPeriod: [
        { date: '2026-10-13', revenue: 0n },
        { date: '2026-10-14', revenue: 30_000n },
      ],
      topProducts: [{ id: 3, name: 'Notebook', sold: 2, revenue: 10_000n }],
    });
  });

  it('runs the statistics in one read-only repeatable-read transaction', async () => {
    const fake = fakeDatabase(
      [{ totalOrders: 0, revenue: '0', todayOrders: 0, todayRevenue: '0' }],
      [],
      [],
      [],
    );
    const stats = await createOrders({ db: fake.db as never, now: () => instant }).getStats();
    expect(stats.totalRevenue).toBe(0n);
    expect(stats.revenueByPeriod).toEqual([]);
    expect(stats.topProducts).toEqual([]);
    expect(fake.callsTo('execute')).toHaveLength(1);
  });

  it('rejects an invalid date range before reading the database', async () => {
    await expect(
      createOrders({ db: fakeDatabase().db as never }).getStats({
        from: '2026-10-02',
        to: '2026-10-01',
      }),
    ).rejects.toMatchObject({ name: 'ZodError' });
  });
});

describe('Order statistics live filter', () => {
  it('counts only live Order statuses when liveOnly is requested', async () => {
    const fake = fakeDatabase(
      [{ totalOrders: 1, revenue: '100.00', todayOrders: 0, todayRevenue: '0.00' }],
      [{ status: 'confirmed', count: 1 }],
      [{ date: '2026-10-14', revenue: '100.00' }],
      [],
    );
    const stats = await createOrders({ db: fake.db as never, now: () => instant }).getStats({
      trendDays: 1,
      liveOnly: true,
    });
    expect(stats.totalRevenue).toBe(10_000n);
    expect(stats.revenueByPeriod).toEqual([{ date: '2026-10-14', revenue: 10_000n }]);
    expect(fake.pendingReads()).toBe(0);
  });
});
