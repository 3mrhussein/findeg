import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import {
  createAdminUserRaw,
  getAdminUsersSnapshotRaw,
  listAdminUserIdsRaw,
  setAdminPermissionOverridesRaw,
  updateAdminUserRaw,
  userQueries,
} from '@findeg/db/queries';
import { ResourceNotFoundError } from '@findeg/domain-errors';
import { createOrders } from '@findeg/orders';
import { UserService, getUserFullName } from '../helpers';

vi.mock('bcryptjs', () => ({ default: { hash: vi.fn() } }));

vi.mock('@findeg/db/queries', () => ({
  userQueries: { getById: vi.fn(), update: vi.fn() },
  listAdminUserIdsRaw: vi.fn(),
  getAdminUsersSnapshotRaw: vi.fn(),
  createAdminUserRaw: vi.fn(),
  updateAdminUserRaw: vi.fn(),
  setAdminPermissionOverridesRaw: vi.fn(),
}));

vi.mock('@findeg/orders', () => ({ createOrders: vi.fn() }));

const emptySnapshot = { users: [], roles: [], permissionOverrides: [] };
const adminSnapshot = {
  users: [
    {
      id: 5,
      email: 'staff@example.com',
      firstName: 'Sana',
      lastName: 'Ali',
      isActive: true,
      createdAt: new Date('2026-01-01'),
    },
  ],
  roles: [{ userId: 5, roleId: 1, roleCode: 'catalog_manager', roleName: 'Catalog' }],
  permissionOverrides: [{ userId: 5, permissionCode: 'orders.write', action: 'grant' }],
};

describe('UserService', () => {
  let service: UserService;
  const listForCustomer = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserService();
    vi.mocked(createOrders).mockReturnValue({ listForCustomer } as never);
  });

  it('updates a Customer profile through the user query', async () => {
    vi.mocked(userQueries.update).mockResolvedValue(undefined as never);

    await service.updateProfile(2, { firstName: 'Per', phone: '0100' });

    expect(userQueries.update).toHaveBeenCalledWith(2, { firstName: 'Per', phone: '0100' });
  });

  it('returns the profile for a known user', async () => {
    vi.mocked(userQueries.getById).mockResolvedValue({ id: 2, email: 'a@example.com' } as never);

    expect(await service.getProfile(2)).toMatchObject({ id: 2, email: 'a@example.com' });
  });

  it('raises a resource-not-found error for an unknown profile', async () => {
    vi.mocked(userQueries.getById).mockResolvedValue(undefined as never);

    await expect(service.getProfile(404)).rejects.toBeInstanceOf(ResourceNotFoundError);
    await expect(service.getProfileData(404)).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('reads the profile and Orders together for My Account', async () => {
    vi.mocked(userQueries.getById).mockResolvedValue({ id: 2 } as never);
    listForCustomer.mockResolvedValue([{ id: 10 }]);

    const data = await service.getProfileData(2);

    expect(listForCustomer).toHaveBeenCalledWith(2);
    expect(data).toEqual({ user: { id: 2 }, orders: [{ id: 10 }] });
  });

  it('lists admins with roles and overrides, and skips the snapshot when there are none', async () => {
    vi.mocked(listAdminUserIdsRaw).mockResolvedValueOnce([]);
    expect(await service.listAdmins()).toEqual([]);
    expect(getAdminUsersSnapshotRaw).not.toHaveBeenCalled();

    vi.mocked(listAdminUserIdsRaw).mockResolvedValueOnce([5]);
    vi.mocked(getAdminUsersSnapshotRaw).mockResolvedValueOnce(adminSnapshot as never);
    const admins = await service.listAdmins();
    expect(admins[0]).toMatchObject({
      id: 5,
      roles: [{ id: 1, code: 'catalog_manager', name: 'Catalog' }],
      permissionOverrides: [{ permissionCode: 'orders.write', action: 'grant' }],
    });
  });

  it('returns null for an unknown admin', async () => {
    vi.mocked(getAdminUsersSnapshotRaw).mockResolvedValue(emptySnapshot as never);

    expect(await service.getAdmin(404)).toBeNull();
  });

  it('creates an admin with a bcrypt hash and throws if it cannot be read back', async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hash' as never);
    vi.mocked(createAdminUserRaw).mockResolvedValue(5);
    vi.mocked(getAdminUsersSnapshotRaw).mockResolvedValueOnce(adminSnapshot as never);

    const admin = await service.createAdmin({
      email: 'staff@example.com',
      firstName: 'Sana',
      lastName: 'Ali',
      password: 'secret-password',
      roleIds: [1],
    });
    expect(bcrypt.hash).toHaveBeenCalledWith('secret-password', 12);
    expect(createAdminUserRaw).toHaveBeenCalledWith(
      expect.objectContaining({ passwordHash: 'hash', roleIds: [1] }),
    );
    expect(admin.id).toBe(5);

    vi.mocked(getAdminUsersSnapshotRaw).mockResolvedValueOnce(emptySnapshot as never);
    await expect(
      service.createAdmin({
        email: 'x@example.com',
        firstName: 'X',
        lastName: 'Y',
        password: 'secret-password',
        roleIds: [],
      }),
    ).rejects.toThrow('Failed to fetch created admin user');
  });

  it('updates an admin and throws if the record disappears', async () => {
    vi.mocked(updateAdminUserRaw).mockResolvedValue(undefined as never);
    vi.mocked(getAdminUsersSnapshotRaw).mockResolvedValueOnce(adminSnapshot as never);
    expect((await service.updateAdmin(5, { firstName: 'Sana' })).id).toBe(5);
    expect(updateAdminUserRaw).toHaveBeenCalledWith(5, { firstName: 'Sana' });

    vi.mocked(getAdminUsersSnapshotRaw).mockResolvedValueOnce(emptySnapshot as never);
    await expect(service.updateAdmin(5, { isActive: false })).rejects.toThrow(
      'Admin user not found after update',
    );
  });

  it('deactivates a user and replaces permission overrides', async () => {
    vi.mocked(userQueries.update).mockResolvedValue(undefined as never);
    vi.mocked(setAdminPermissionOverridesRaw).mockResolvedValue(undefined as never);

    await service.deactivateAdmin(2);
    await service.setPermissionOverrides(2, [{ permissionId: 3, action: 'grant' }], 1);

    expect(userQueries.update).toHaveBeenCalledWith(2, { isActive: false });
    expect(setAdminPermissionOverridesRaw).toHaveBeenCalledWith(
      2,
      [{ permissionId: 3, action: 'grant' }],
      1,
    );
  });

  it('derives a display name from the present name parts only', () => {
    expect(getUserFullName({ firstName: 'Sana', lastName: 'Ali' })).toBe('Sana Ali');
    expect(getUserFullName({ firstName: null, lastName: 'Ali' })).toBe('Ali');
    expect(getUserFullName({ firstName: null, lastName: null })).toBe('');
  });
});
