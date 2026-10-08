import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateTag } from 'next/cache';
import type { SessionPayload } from '@findeg/backend/features/core';

const { getSession, orders } = vi.hoisted(() => ({
  getSession: vi.fn(),
  orders: { changeStatus: vi.fn(), changePaymentStatus: vi.fn() },
}));

vi.mock('@lib/session', () => ({ getSession }));
vi.mock('next/cache', () => ({ updateTag: vi.fn() }));
vi.mock('@findeg/backend/features/order', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@findeg/backend/features/order')>()),
  createOrders: () => orders,
}));

import { updateOrderPaymentStatusAction, updateOrderStatusAction } from './actions';

const refused = { success: false, error: 'Not authorized to change orders' };

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

    expect(result).toEqual(refused);
    expect(orders.changeStatus).not.toHaveBeenCalled();
  });

  it('refuses a status change from Staff without order-write permission', async () => {
    getSession.mockResolvedValue(staffSession(['admin.orders.read']));

    const result = await updateOrderStatusAction(7, { status: 'cancelled' });

    expect(result).toEqual(refused);
    expect(orders.changeStatus).not.toHaveBeenCalled();
  });

  it('refuses a payment change without a session and never reaches the order service', async () => {
    getSession.mockResolvedValue(null);

    const result = await updateOrderPaymentStatusAction(7, 'paid');

    expect(result).toEqual(refused);
    expect(orders.changePaymentStatus).not.toHaveBeenCalled();
  });

  it('refuses a payment change from Staff without order-write permission', async () => {
    getSession.mockResolvedValue(staffSession(['admin.orders.read']));

    const result = await updateOrderPaymentStatusAction(7, 'paid');

    expect(result).toEqual(refused);
    expect(orders.changePaymentStatus).not.toHaveBeenCalled();
  });

  it('refuses a signed-in Customer even when they hold order-write permission', async () => {
    getSession.mockResolvedValue({
      ...staffSession(['admin.orders.write']),
      portalRole: 'customer',
    });

    const statusResult = await updateOrderStatusAction(7, { status: 'cancelled' });
    const paymentResult = await updateOrderPaymentStatusAction(7, 'paid');

    expect(statusResult).toEqual(refused);
    expect(paymentResult).toEqual(statusResult);
    expect(orders.changeStatus).not.toHaveBeenCalled();
    expect(orders.changePaymentStatus).not.toHaveBeenCalled();
  });

  it('rejects an unknown lifecycle status before writing or invalidating caches', async () => {
    getSession.mockResolvedValue(staffSession(['admin.orders.write']));
    const result = await updateOrderStatusAction(7, { status: 'unknown' } as never);
    expect(result.success).toBe(false);
    expect(orders.changeStatus).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
  });

  it('passes the permitted Staff member to the order service as the actor', async () => {
    getSession.mockResolvedValue(staffSession(['admin.orders.write']));

    await expect(updateOrderStatusAction(7, { status: 'confirmed' })).resolves.toEqual({
      success: true,
      data: undefined,
    });
    await expect(updateOrderPaymentStatusAction(7, 'paid')).resolves.toEqual({
      success: true,
      data: undefined,
    });

    const actor = {
      kind: 'staff',
      userId: 42,
      permissionCodes: ['admin.orders.write'],
      activeRoleIds: [],
    };
    expect(orders.changeStatus).toHaveBeenCalledWith(actor, 7, { status: 'confirmed' });
    expect(orders.changePaymentStatus).toHaveBeenCalledWith(actor, 7, 'paid');
    expect(updateTag).toHaveBeenCalledWith('orders');
    expect(updateTag).toHaveBeenCalledWith('dashboard');
    expect(updateTag).toHaveBeenCalledWith('recent-orders');
  });
});
