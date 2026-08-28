import { beforeEach, describe, expect, it, vi } from 'vitest';

const orders = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  updateStatus: vi.fn(),
}));

vi.mock('@findeg/backend/features/core', () => ({
  PERMISSION_CODES: { ADMIN_ORDERS_WRITE: 'admin.orders.write' },
}));
vi.mock('@findeg/backend/features/administration', () => ({
  createAdministrationServices: () => ({ orders: { updateStatus: orders.updateStatus } }),
}));
vi.mock('@lib/require-dashboard-permission', () => ({
  requireDashboardPermission: orders.requirePermission,
}));
vi.mock('@lib/type-guards', () => ({
  getErrorMessage: (error: unknown) => (error instanceof Error ? error.message : 'Unknown error'),
}));
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));

describe('Dashboard order actions', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('requires the current orders-write permission before changing an order', async () => {
    orders.requirePermission.mockRejectedValue(new Error('Forbidden: Missing permission admin.orders.write'));
    const { updateOrderStatusAction } = await import('./order-actions');

    await expect(updateOrderStatusAction(12, { status: 'processing' })).resolves.toEqual({
      success: false,
      error: 'Forbidden: Missing permission admin.orders.write',
    });

    expect(orders.requirePermission).toHaveBeenCalledWith('admin.orders.write');
    expect(orders.updateStatus).not.toHaveBeenCalled();
  });
});
