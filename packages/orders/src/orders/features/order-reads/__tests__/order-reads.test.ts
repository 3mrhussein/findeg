import { describe, expect, it } from 'vitest';
import { createOrders } from '../../../helpers';
import { fakeDatabase, storedItem, storedOrder } from '../../../__tests__/fixture';

const row = (overrides: Record<string, unknown> = {}) => ({
  order: storedOrder(overrides),
  user: null,
});

describe('Order reads', () => {
  it('returns null for an unknown Order and accepts a numeric string id', async () => {
    const fake = fakeDatabase([]);
    expect(await createOrders({ db: fake.db as never }).get('12')).toBeNull();
    expect(fake.callsTo('where')[0].args).toHaveLength(1);
  });

  it('loads an Order with its items in piasters', async () => {
    const fake = fakeDatabase([row()], [storedItem()]);
    const order = await createOrders({ db: fake.db as never }).get(9);
    expect(order).toMatchObject({
      id: 9,
      orderReference: 'FE-000009',
      totalAmount: 15_000n,
      customerName: 'Nour Hassan',
    });
    expect(order?.items).toEqual([expect.objectContaining({ id: 1, lineTotal: 10_000n })]);
  });

  it('lists Orders with a default page of 50 and reports the total', async () => {
    const fake = fakeDatabase([row()], [{ count: 1 }], [storedItem()]);
    const result = await createOrders({ db: fake.db as never }).list();
    expect(result.total).toBe(1);
    expect(result.orders).toHaveLength(1);
    expect(fake.callsTo('limit')[0].args).toEqual([50]);
    expect(fake.callsTo('offset')[0].args).toEqual([0]);
  });

  it('applies explicit page size, offset and every filter', async () => {
    const fake = fakeDatabase([], [{ count: 0 }]);
    const result = await createOrders({ db: fake.db as never }).list({
      status: 'pending',
      paymentStatus: 'unpaid',
      userId: 4,
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-31'),
      search: '50%_',
      limit: 5,
      offset: 10,
    });
    expect(result).toEqual({ orders: [], total: 0 });
    expect(fake.callsTo('limit')[0].args).toEqual([5]);
    expect(fake.callsTo('offset')[0].args).toEqual([10]);
  });

  it('matches a numeric search against the Order id as well as the text fields', async () => {
    const fake = fakeDatabase([], [{ count: 0 }]);
    await createOrders({ db: fake.db as never }).list({ search: '9' });
    expect(fake.callsTo('where')).toHaveLength(2);
  });

  it('lists a customer history with their items', async () => {
    const fake = fakeDatabase([{ order: storedOrder({ userId: 4 }), user: null }], [storedItem()]);
    const orders = await createOrders({ db: fake.db as never }).listForCustomer(4);
    expect(orders).toEqual([expect.objectContaining({ id: 9, userId: 4 })]);
  });

  it('returns no customer history without rows and skips the item query', async () => {
    const fake = fakeDatabase([]);
    expect(await createOrders({ db: fake.db as never }).listForCustomer(4)).toEqual([]);
    expect(fake.pendingReads()).toBe(0);
  });

  it('returns the five most recent Orders by default', async () => {
    const fake = fakeDatabase([], [{ count: 0 }]);
    await createOrders({ db: fake.db as never }).recent();
    expect(fake.callsTo('limit')[0].args).toEqual([5]);
  });

  it('returns the latest shipping address, or null when the customer has none', async () => {
    const address = { fullName: 'Nour Hassan', city: 'Cairo' };
    expect(
      await createOrders({ db: fakeDatabase([{ address }]).db as never }).latestShippingAddress(4),
    ).toEqual(address);
    expect(
      await createOrders({ db: fakeDatabase([]).db as never }).latestShippingAddress(4),
    ).toBeNull();
    await expect(createOrders().latestShippingAddress(0)).rejects.toMatchObject({
      name: 'ZodError',
    });
  });

  it('returns null detail for an unknown Order', async () => {
    expect(await createOrders({ db: fakeDatabase([]).db as never }).detail(9)).toBeNull();
  });

  it('builds the activity trail with the admin name and the changed value', async () => {
    const when = new Date('2026-10-02T09:00:00Z');
    const fake = fakeDatabase(
      [row()],
      [storedItem()],
      [
        {
          log: {
            id: 2,
            action: 'update_status',
            adminUserId: 5,
            oldValues: { status: 'pending' },
            newValues: { status: 'confirmed' },
            createdAt: when,
          },
          firstName: 'Amina',
          lastName: null,
        },
        {
          log: {
            id: 1,
            action: 'update_notes',
            adminUserId: null,
            oldValues: null,
            newValues: { adminNotes: 'packed' },
            createdAt: when,
          },
          firstName: null,
          lastName: null,
        },
      ],
    );
    const detail = await createOrders({ db: fake.db as never }).detail(9);
    expect(detail?.activity).toEqual([
      expect.objectContaining({
        id: 2,
        adminId: 5,
        adminName: 'Amina',
        oldValue: 'pending',
        newValue: 'confirmed',
        createdAt: when,
      }),
      expect.objectContaining({
        id: 1,
        adminId: undefined,
        adminName: undefined,
        oldValue: undefined,
        newValue: undefined,
      }),
    ]);
  });
});
