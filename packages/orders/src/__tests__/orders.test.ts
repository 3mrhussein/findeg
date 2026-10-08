import { describe, expect, it } from 'vitest';
import { createOrders, NotAuthorizedError } from '@findeg/orders';

describe('Orders before database resolution', () => {
  it('constructs without application configuration and rejects unauthorised commands', async () => {
    const orders = createOrders();
    await expect(
      orders.changeStatus({ kind: 'staff', userId: 1 }, 1, { status: 'confirmed' }),
    ).rejects.toBeInstanceOf(NotAuthorizedError);
  });
});

const writer = { kind: 'staff' as const, userId: 1, activeRoleIds: ['system_admin'] };
it.each([0, -1, NaN, Infinity, 1.1, '1x', ''])(
  'rejects invalid Order ID %s before loading a database',
  async (id) => {
    await expect(createOrders().get(id as number)).rejects.toMatchObject({ name: 'ZodError' });
  },
);
it('rejects invalid runtime command statuses before loading a database', async () => {
  const api = createOrders();
  await expect(api.changeStatus(writer, 1, { status: 'unknown' as never })).rejects.toMatchObject({
    name: 'ZodError',
  });
  await expect(api.changePaymentStatus(writer, 1, 'unknown' as never)).rejects.toMatchObject({
    name: 'ZodError',
  });
});
it.each([
  { limit: 0 },
  { limit: 101 },
  { offset: -1 },
  { startDate: new Date('invalid') },
  { startDate: new Date('2026-10-09'), endDate: new Date('2026-10-01') },
])('rejects invalid list inputs before loading a database', async (filters) => {
  await expect(createOrders().list(filters)).rejects.toMatchObject({ name: 'ZodError' });
});
