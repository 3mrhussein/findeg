import { beforeEach, describe, expect, it, vi } from 'vitest';

const authorization = vi.hoisted(() => ({
  adminSession: vi.fn(),
  getSession: vi.fn(),
  hasPermission: vi.fn(),
}));

vi.mock('@findeg/backend/features/core', () => ({
  adminSession: authorization.adminSession,
}));
vi.mock('@findeg/backend/features/identity', () => ({
  createIdentityServices: () => ({
    permissions: {
      hasPermission: authorization.hasPermission,
    },
  }),
}));
vi.mock('@lib/session', () => ({ getSession: authorization.getSession }));

describe('requireDashboardPermission', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    authorization.adminSession.mockReturnValue(true);
  });

  it('returns the authenticated user when the application permission service allows access', async () => {
    authorization.getSession.mockResolvedValue({ userId: 42 });
    authorization.hasPermission.mockResolvedValue(true);
    const { requireDashboardPermission } = await import('./require-dashboard-permission');

    await expect(requireDashboardPermission('admin.orders.write')).resolves.toEqual({ userId: 42 });

    expect(authorization.hasPermission).toHaveBeenCalledWith(42, 'admin.orders.write');
  });

  it('rejects a non-Dashboard Current Session before checking permissions', async () => {
    authorization.getSession.mockResolvedValue({ userId: 42, portalRole: 'customer' });
    authorization.adminSession.mockReturnValue(false);
    const { requireDashboardPermission } = await import('./require-dashboard-permission');

    await expect(requireDashboardPermission('admin.orders.write')).rejects.toThrow(
      'Forbidden: Missing permission admin.orders.write',
    );

    expect(authorization.hasPermission).not.toHaveBeenCalled();
  });
});
