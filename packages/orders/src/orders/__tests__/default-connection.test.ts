import { describe, expect, it, vi } from 'vitest';
import { PERMISSION_CODES } from '@findeg/db/types';
import { createOrders } from '../helpers';
import { fakeDatabase, storedOrder } from './fixture';

// Without an injected database, Orders resolves the application connection lazily; this test
// stands in for that connection so the default path runs without PostgreSQL.
vi.mock('@findeg/db/connection', async () => {
  const { fakeDatabase: connect, storedItem } = await import('./fixture');
  return { db: connect([{ order: storedOrder(), user: null }], [storedItem()]).db };
});

describe('Orders with the default connection', () => {
  it('resolves the application connection on the first query', async () => {
    const orders = createOrders();
    const found = await orders.get(9);
    expect(found).toMatchObject({ id: 9 });
  });

  it('stamps status changes with the current time when no clock is injected', async () => {
    const before = Date.now();
    const fake = fakeDatabase([storedOrder({ status: 'confirmed' })]);
    await createOrders({ db: fake.db as never }).changeStatus(
      { kind: 'staff', userId: 1, permissionCodes: [PERMISSION_CODES.ADMIN_ORDERS_WRITE] },
      9,
      { status: 'processing' },
    );
    const [update] = fake.callsTo('set');
    expect((update.args[0] as { updatedAt: Date }).updatedAt.getTime()).toBeGreaterThanOrEqual(
      before,
    );
  });
});
