import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userQueries } from '@findeg/db/queries';
import {
  createIdentityServices,
  getMyAccountData,
  login,
  logout,
  updateMyProfile,
  updateProfile,
} from '../helpers';

vi.mock('@findeg/db/queries', () => ({
  userQueries: {
    getByEmailWithPassword: vi.fn(),
    getAuthorizationContext: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
  },
  getAdminUsersSnapshotRaw: vi.fn(),
  listAdminUserIdsRaw: vi.fn(),
  updateAdminUserRaw: vi.fn(),
}));

vi.mock('@findeg/orders', () => ({
  createOrders: () => ({ listForCustomer: vi.fn().mockResolvedValue([]) }),
}));

describe('identity composition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates each identity service once per call', () => {
    const first = createIdentityServices();
    const second = createIdentityServices();

    expect(first.auth).not.toBe(second.auth);
    expect(first.permissions).toBeDefined();
    expect(first.adminUsers).toBeDefined();
    expect(first.adminRoles).toBeDefined();
    expect(first.userService).toBeDefined();
  });

  it('logs in with either the (email, password) or the object signature', async () => {
    vi.mocked(userQueries.getByEmailWithPassword).mockResolvedValue(undefined as never);

    expect(await login('a@example.com', 'pw')).toEqual({
      success: false,
      error: 'Invalid email or password.',
    });
    expect(await login({ email: 'a@example.com', password: 'pw' })).toEqual({
      success: false,
      error: 'Invalid email or password.',
    });
    expect(userQueries.getByEmailWithPassword).toHaveBeenCalledTimes(2);
  });

  it('logs out by returning success, since sessions are cleared in the app layer', async () => {
    expect(await logout()).toEqual({ success: true });
  });

  it('delegates profile facades to the account service', async () => {
    vi.mocked(userQueries.update).mockResolvedValue(undefined as never);
    vi.mocked(userQueries.getById).mockResolvedValue({ id: 2 } as never);

    await updateProfile(2, { firstName: 'Per' });
    expect(userQueries.update).toHaveBeenCalledWith(2, { firstName: 'Per' });

    expect(await getMyAccountData(2)).toEqual({ user: { id: 2 }, orders: [] });
  });

  it('delegates admin self-updates to the admin user service', async () => {
    const { getAdminUsersSnapshotRaw, updateAdminUserRaw } = await import('@findeg/db/queries');
    vi.mocked(updateAdminUserRaw).mockResolvedValue(undefined);
    vi.mocked(getAdminUsersSnapshotRaw).mockResolvedValue({
      users: [],
      roles: [],
      permissionOverrides: [],
    });

    await expect(updateMyProfile(2, { isActive: true })).rejects.toThrow(
      'Admin user not found after update',
    );
    expect(updateAdminUserRaw).toHaveBeenCalledWith(2, { isActive: true });
  });
});
