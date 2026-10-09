import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SessionPayload } from '@findeg/backend/features/core';

const { getSession, orders, updateTag } = vi.hoisted(() => ({
  getSession: vi.fn(),
  updateTag: vi.fn(),
  orders: { changeStatus: vi.fn(), changePaymentStatus: vi.fn() },
}));

vi.mock('@lib/session', () => ({ getSession }));
vi.mock('next/cache', () => ({ updateTag }));
vi.mock('@findeg/orders', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@findeg/orders')>()),
  createOrders: () => orders,
}));

import {
  InvalidOrderStatusTransitionError,
  InvalidPaymentStatusTransitionError,
} from '@findeg/orders';
import { updateOrderPaymentStatusAction, updateOrderStatusAction } from '@data/orders/actions';

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
    orders.changeStatus.mockResolvedValue(undefined);
    orders.changePaymentStatus.mockResolvedValue(undefined);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('refuses a status change without a session and never reaches the order service', async () => {
    getSession.mockResolvedValue(null);

    const result = await updateOrderStatusAction(7, { status: 'cancelled' });

    expect(result).toEqual(refused);
    expect(orders.changeStatus).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
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

  it('passes the permitted Staff member to the order service as the actor', async () => {
    getSession.mockResolvedValue(staffSession(['admin.orders.write']));

    await expect(updateOrderStatusAction(7, { status: 'confirmed' })).resolves.toMatchObject({
      success: true,
    });
    await expect(updateOrderPaymentStatusAction(7, 'paid')).resolves.toMatchObject({
      success: true,
    });

    const actor = {
      kind: 'staff',
      userId: 42,
      permissionCodes: ['admin.orders.write'],
      activeRoleIds: [],
    };
    expect(orders.changeStatus).toHaveBeenCalledWith(actor, 7, { status: 'confirmed' });
    expect(orders.changePaymentStatus).toHaveBeenCalledWith(actor, 7, 'paid');
  });
});

describe('stale Order reads after rejected concurrent changes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orders.changeStatus.mockResolvedValue(undefined);
    orders.changePaymentStatus.mockResolvedValue(undefined);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  it('expires cached reads when the persisted status rejects a stale target', async () => {
    getSession.mockResolvedValue(staffSession(['admin.orders.write']));
    orders.changeStatus.mockRejectedValueOnce(
      new InvalidOrderStatusTransitionError('cancelled', 'confirmed', []),
    );

    const result = await updateOrderStatusAction(7, { status: 'confirmed' });

    expect(result).toEqual({
      success: false,
      error: 'Invalid status transition from cancelled to confirmed. Allowed: none.',
    });
    expect(updateTag.mock.calls).toEqual([['orders'], ['dashboard']]);
  });

  it('expires cached reads when the persisted payment rejects a stale target', async () => {
    getSession.mockResolvedValue(staffSession(['admin.orders.write']));
    orders.changePaymentStatus.mockRejectedValueOnce(
      new InvalidPaymentStatusTransitionError('refunded', 'paid', []),
    );

    const result = await updateOrderPaymentStatusAction(7, 'paid');

    expect(result).toEqual({
      success: false,
      error: 'Invalid payment status transition from refunded to paid. Allowed: none.',
    });
    expect(updateTag.mock.calls).toEqual([['orders'], ['dashboard']]);
  });
});
