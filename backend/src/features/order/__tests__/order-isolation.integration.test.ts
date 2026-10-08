import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { orders } from '@findeg/db/schema';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';

vi.mock('@findeg/db/connection', () => {
  throw new Error('Default database connection must not initialize for injected Orders');
});
vi.mock('@findeg/env', () => {
  throw new Error('Backend environment must not initialize for injected Orders');
});

import { createOrders } from '..';
import { users } from '@findeg/db/schema';

describe('Orders injected dependency isolation', () => {
  let testDb: TestDatabase;
  beforeAll(() => {
    testDb = connectToTestDatabase();
  });
  afterAll(async () => testDb.close());

  it('reads, aggregates and changes status/payment without loading the global connection or environment', async () => {
    const [staff] = await testDb.db
      .insert(users)
      .values({ email: 'orders-isolation-staff@example.com', portalRole: 'staff' })
      .returning();
    const [order] = await testDb.db
      .insert(orders)
      .values({ totalAmount: '12.34', adminNotes: 'before', trackingNumber: 'old' })
      .returning();
    const service = createOrders({ db: testDb.db });
    const actor = { kind: 'staff' as const, userId: staff.id, activeRoleIds: ['system_admin'] };
    expect(await service.get(order.id)).toMatchObject({ id: order.id, totalAmount: 1234n });
    expect((await service.getStats()).totalOrders).toBeGreaterThan(0);
    await service.changeStatus(actor, order.id, {
      status: 'cancelled',
      adminNotes: 'after',
      trackingNumber: 'new',
    });
    await service.changePaymentStatus(actor, order.id, 'paid');
    expect(await service.get(order.id)).toMatchObject({
      status: 'cancelled',
      paymentStatus: 'paid',
    });
    expect((await service.detail(order.id))?.activity).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'update_status',
          oldValues: { status: 'pending', adminNotes: 'before', trackingNumber: 'old' },
        }),
        expect.objectContaining({ action: 'update_payment_status' }),
      ]),
    );
  });
});
