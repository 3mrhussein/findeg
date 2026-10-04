import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SessionPayload } from '@findeg/backend/features/core';

const { getSession, orders } = vi.hoisted(() => ({
  getSession: vi.fn(),
  orders: { updateStatus: vi.fn(), updatePaymentStatus: vi.fn() },
}));

vi.mock('@lib/session', () => ({ getSession }));
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));
vi.mock('@findeg/backend/features/administration', () => ({
  createAdministrationServices: () => ({ orders }),
}));

import { updateOrderPaymentStatusAction, updateOrderStatusAction } from './order-actions';

function staffSession(permissionCodes: string[]): SessionPayload {
  return {
    userId: 42,
    user: { id: 42, email: 'staff@example.com' },
    portalRole: 'staff',
    permissionCodes,
    activeRoleIds: [],
  } as unknown as SessionPayload;
}

describe('Dashboard order server actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('refuses a status change without a session and never reaches the order service', async () => {
    getSession.mockResolvedValue(null);

    const result = await updateOrderStatusAction(7, { status: 'cancelled' });

    expect(result).toEqual({
      success: false,
      error: 'Unauthorized: Order write permission required',
    });
    expect(orders.updateStatus).not.toHaveBeenCalled();
  });

  it('refuses a status change from Staff without order-write permission', async () => {
    getSession.mockResolvedValue(staffSession(['admin.orders.read']));

    const result = await updateOrderStatusAction(7, { status: 'cancelled' });

    expect(result).toEqual({
      success: false,
      error: 'Unauthorized: Order write permission required',
    });
    expect(orders.updateStatus).not.toHaveBeenCalled();
  });

  it('refuses a payment change without a session and never reaches the order service', async () => {
    getSession.mockResolvedValue(null);

    const result = await updateOrderPaymentStatusAction(7, 'paid');

    expect(result).toEqual({
      success: false,
      error: 'Unauthorized: Order write permission required',
    });
    expect(orders.updatePaymentStatus).not.toHaveBeenCalled();
  });

  it('refuses a payment change from Staff without order-write permission', async () => {
    getSession.mockResolvedValue(staffSession(['admin.orders.read']));

    const result = await updateOrderPaymentStatusAction(7, 'paid');

    expect(result).toEqual({
      success: false,
      error: 'Unauthorized: Order write permission required',
    });
    expect(orders.updatePaymentStatus).not.toHaveBeenCalled();
  });

  it('refuses a signed-in Customer even when they hold order-write permission', async () => {
    getSession.mockResolvedValue({
      ...staffSession(['admin.orders.write']),
      portalRole: 'customer',
    });

    const statusResult = await updateOrderStatusAction(7, { status: 'cancelled' });
    const paymentResult = await updateOrderPaymentStatusAction(7, 'paid');

    expect(statusResult).toEqual({
      success: false,
      error: 'Unauthorized: Order write permission required',
    });
    expect(paymentResult).toEqual(statusResult);
    expect(orders.updateStatus).not.toHaveBeenCalled();
    expect(orders.updatePaymentStatus).not.toHaveBeenCalled();
  });

  it('passes the permitted Staff member to the order service as the actor', async () => {
    getSession.mockResolvedValue(staffSession(['admin.orders.write']));

    await expect(updateOrderStatusAction(7, { status: 'confirmed' })).resolves.toEqual({
      success: true,
    });
    await expect(updateOrderPaymentStatusAction(7, 'paid')).resolves.toEqual({ success: true });

    const actor = {
      kind: 'staff',
      userId: 42,
      permissionCodes: ['admin.orders.write'],
      activeRoleIds: [],
    };
    expect(orders.updateStatus).toHaveBeenCalledWith(actor, 7, { status: 'confirmed' });
    expect(orders.updatePaymentStatus).toHaveBeenCalledWith(actor, 7, 'paid');
  });
});
