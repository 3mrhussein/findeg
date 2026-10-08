import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { orders, orderItems, users, outbox } from '@findeg/db/schema';
import {
  createOrders,
  InvalidOrderStatusTransitionError,
  InvalidPaymentStatusTransitionError,
  type OrderStatus,
  type PaymentStatus,
  type OrderStaffActor,
} from '@findeg/orders';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';

vi.mock('@findeg/db/connection', () => {
  throw new Error('Injected Orders must never load default connection');
});

const statusTargets: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};
const paymentTargets: Record<PaymentStatus, readonly PaymentStatus[]> = {
  unpaid: ['paid'],
  paid: ['refunded'],
  refunded: [],
};

describe('public injected Orders package on PostgreSQL', () => {
  let testDb: TestDatabase;
  let writer: OrderStaffActor;
  let sequence = 0;
  const instant = new Date('2026-10-09T07:00:00Z');
  const api = () => createOrders({ db: testDb.db, now: () => instant });
  beforeAll(async () => {
    testDb = connectToTestDatabase();
    const [staff] = await testDb.db
      .insert(users)
      .values({
        email: 'package-staff@example.com',
        firstName: 'Mona',
        lastName: 'Saleh',
        portalRole: 'staff',
      })
      .returning();
    writer = { kind: 'staff', userId: staff.id, activeRoleIds: ['system_admin'] };
  });
  afterAll(async () => testDb.close());
  async function seed(status: OrderStatus = 'pending', paymentStatus: PaymentStatus = 'unpaid') {
    const [row] = await testDb.db
      .insert(orders)
      .values({
        orderReference: `FE-PK${String(++sequence).padStart(4, '0')}`,
        status,
        paymentStatus,
        userId: writer.userId,
        subtotal: '37.50',
        discountTotal: '2.50',
        shippingCost: '10.00',
        totalAmount: '45.00',
        trackingNumber: 'old-tracking',
        adminNotes: 'old-notes',
        shippingAddressSnapshot: {
          fullName: 'Ahmed Hassan',
          phone: '01012345678',
          city: 'Cairo',
          area: 'Nasr City',
          street: 'Abbas El Akkad',
        },
      })
      .returning();
    await testDb.db.insert(orderItems).values({
      orderId: row.id,
      productId: null,
      quantity: 3,
      unitPrice: '12.50',
      discountAmount: '2.50',
      lineTotal: '35.00',
      productNameSnapshot: 'Historical Notebook',
    });
    return row;
  }
  it.each(
    Object.keys(statusTargets).flatMap((from) =>
      Object.keys(statusTargets).map((to) => [from as OrderStatus, to as OrderStatus]),
    ),
  )('Order Status %s → %s', async (from, to) => {
    const row = await seed(from);
    if (from !== to && !statusTargets[from].includes(to)) {
      await expect(api().changeStatus(writer, row.id, { status: to })).rejects.toBeInstanceOf(
        InvalidOrderStatusTransitionError,
      );
      expect((await api().detail(row.id))?.activity).toEqual([]);
    } else {
      expect(await api().changeStatus(writer, row.id, { status: to })).toMatchObject({
        changed: from !== to,
        previousStatus: from,
        status: to,
      });
      expect((await api().get(row.id))?.status).toBe(to);
      expect((await api().detail(row.id))?.activity).toHaveLength(from === to ? 0 : 1);
    }
  });
  it.each(
    Object.keys(paymentTargets).flatMap((from) =>
      Object.keys(paymentTargets).map((to) => [from as PaymentStatus, to as PaymentStatus]),
    ),
  )('Payment Status %s → %s', async (from, to) => {
    const row = await seed('pending', from);
    if (from !== to && !paymentTargets[from].includes(to)) {
      await expect(api().changePaymentStatus(writer, row.id, to)).rejects.toBeInstanceOf(
        InvalidPaymentStatusTransitionError,
      );
    } else {
      expect(await api().changePaymentStatus(writer, row.id, to)).toMatchObject({
        changed: from !== to,
      });
      expect((await api().get(row.id))?.paymentStatus).toBe(to);
      expect((await api().detail(row.id))?.activity).toHaveLength(from === to ? 0 : 1);
    }
  });
  it('maps canonical snapshots exactly, retains deleted products and Staff identity', async () => {
    const row = await seed();
    await api().changeStatus(writer, row.id, {
      status: 'confirmed',
      trackingNumber: 'new-tracking',
      adminNotes: 'new-notes',
    });
    const detail = await api().detail(row.id);
    expect(detail?.order).toMatchObject({
      subtotal: 3750n,
      discountTotal: 250n,
      shippingCost: 1000n,
      totalAmount: 4500n,
      updatedAt: instant,
    });
    expect(detail?.order.items[0]).toMatchObject({
      productId: null,
      unitPrice: 1250n,
      discountAmount: 250n,
      lineTotal: 3500n,
      productNameSnapshot: 'Historical Notebook',
    });
    expect(detail?.activity[0]).toMatchObject({
      adminId: writer.userId,
      adminName: 'Mona Saleh',
      createdAt: instant,
      oldValues: { status: 'pending', trackingNumber: 'old-tracking', adminNotes: 'old-notes' },
      newValues: { status: 'confirmed', trackingNumber: 'new-tracking', adminNotes: 'new-notes' },
    });
    expect(await api().latestShippingAddress(writer.userId)).toMatchObject({ city: 'Cairo' });
    expect((await api().list({ search: row.orderReference, limit: 1 })).total).toBe(1);
    expect(await api().listForCustomer(writer.userId)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: row.id })]),
    );
    expect(await api().recent(1)).toHaveLength(1);
  });
  it('same status preserves metadata, timestamp and history', async () => {
    const row = await seed();
    const before = await api().detail(row.id);
    await api().changeStatus(writer, row.id, {
      status: 'pending',
      adminNotes: 'discard',
      trackingNumber: 'discard',
    });
    await api().changePaymentStatus(writer, row.id, 'unpaid');
    expect(await api().detail(row.id)).toEqual(before);
  });
  it('audit failure rolls back status metadata and durable enqueue', async () => {
    const row = await seed('shipped');
    const before = await api().detail(row.id);
    await expect(
      api().changeStatus({ ...writer, userId: 2_000_000_000 }, row.id, {
        status: 'delivered',
        adminNotes: 'must roll back',
      }),
    ).rejects.toThrow();
    expect(await api().detail(row.id)).toEqual(before);
    expect(
      await testDb.db
        .select()
        .from(outbox)
        .where(eq(outbox.id, `order-status:${row.orderReference}:delivered`)),
    ).toEqual([]);
    await expect(
      api().changePaymentStatus({ ...writer, userId: 2_000_000_000 }, row.id, 'paid'),
    ).rejects.toThrow();
    expect(await api().detail(row.id)).toEqual(before);
  });
  it('serializes concurrent commands with exactly one audit and notification', async () => {
    const row = await seed();
    const results = await Promise.all([
      api().changeStatus(writer, row.id, { status: 'cancelled' }),
      api().changeStatus(writer, row.id, { status: 'cancelled' }),
    ]);
    expect(results.filter((result) => result.changed)).toHaveLength(1);
    expect((await api().detail(row.id))?.activity).toHaveLength(1);
    expect(
      await testDb.db
        .select()
        .from(outbox)
        .where(eq(outbox.id, `order-status:${row.orderReference}:cancelled`)),
    ).toHaveLength(1);
  });
  it('unauthorized attempts return while the Order is locked', async () => {
    const row = await seed();
    await testDb.db.transaction(async (tx) => {
      await tx.select().from(orders).where(eq(orders.id, row.id)).for('update');
      await expect(
        api().changeStatus({ kind: 'staff', userId: writer.userId }, row.id, {
          status: 'cancelled',
        }),
      ).rejects.toMatchObject({ name: 'NotAuthorizedError' });
    });
    expect((await api().detail(row.id))?.activity).toEqual([]);
  });
  it('base statistics are exact and include zero counts', async () => {
    const result = await api().getStats();
    expect(result.totalOrders).toBeGreaterThan(0);
    expect(typeof result.totalRevenue).toBe('bigint');
    expect(Object.keys(result.ordersByStatus).sort()).toEqual([
      'cancelled',
      'confirmed',
      'delivered',
      'pending',
      'processing',
      'refunded',
      'shipped',
    ]);
  });
});
