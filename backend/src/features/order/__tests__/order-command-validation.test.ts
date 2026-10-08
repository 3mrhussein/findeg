import { describe, expect, it, vi } from 'vitest';
vi.mock('@findeg/db/connection', () => {
  throw new Error('Validation must precede connection access');
});
vi.mock('@findeg/env', () => {
  throw new Error('Orders must not import backend environment');
});
import { createOrders } from '..';

const actor = { kind: 'staff' as const, userId: 1, activeRoleIds: ['system_admin'] };
describe('Orders command validation before database access', () => {
  it.each([0, -1, 1.5, NaN, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid order ID %s',
    async (id) => {
      const service = createOrders();
      await expect(service.changeStatus(actor, id, { status: 'confirmed' })).rejects.toBeInstanceOf(
        RangeError,
      );
      await expect(service.changePaymentStatus(actor, id, 'paid')).rejects.toBeInstanceOf(
        RangeError,
      );
    },
  );
  it('validates the complete status update DTO', async () => {
    await expect(
      createOrders().changeStatus(actor, 1, { status: 'confirmed', trackingNumber: 123 as never }),
    ).rejects.toMatchObject({ name: 'ZodError' });
    await expect(
      createOrders().changeStatus(actor, 1, { status: 'confirmed', adminNotes: null as never }),
    ).rejects.toMatchObject({ name: 'ZodError' });
  });
});
