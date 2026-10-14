import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import {
  createAdminUserRaw,
  deactivateAdminUserRaw,
  getAdminUsersSnapshotRaw,
  listAdminUserIdsRaw,
  setAdminPermissionOverridesRaw,
  updateAdminUserRaw,
} from '@findeg/db/queries';
import { AdminUserService } from '../helpers';

vi.mock('bcryptjs', () => ({ default: { hash: vi.fn() } }));

vi.mock('@findeg/db/queries', () => ({
  listAdminUserIdsRaw: vi.fn(),
  getAdminUsersSnapshotRaw: vi.fn(),
  createAdminUserRaw: vi.fn(),
  updateAdminUserRaw: vi.fn(),
  deactivateAdminUserRaw: vi.fn(),
  setAdminPermissionOverridesRaw: vi.fn(),
}));

const snapshot = {
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

describe('AdminUserService', () => {
  let service: AdminUserService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminUserService();
    vi.mocked(getAdminUsersSnapshotRaw).mockResolvedValue(snapshot);
  });

  it('lists admins from their ids and maps roles and overrides', async () => {
    vi.mocked(listAdminUserIdsRaw).mockResolvedValue([5]);

    const admins = await service.listAdmins();

    expect(getAdminUsersSnapshotRaw).toHaveBeenCalledWith([5]);
    expect(admins).toEqual([
      {
        id: 5,
        email: 'staff@example.com',
        firstName: 'Sana',
        lastName: 'Ali',
        isActive: true,
        createdAt: new Date('2026-01-01'),
        roles: [{ id: 1, code: 'catalog_manager', name: 'Catalog' }],
        permissionOverrides: [{ permissionCode: 'orders.write', action: 'grant' }],
      },
    ]);
  });

  it('returns an empty list without reading a snapshot when no admins exist', async () => {
    vi.mocked(listAdminUserIdsRaw).mockResolvedValue([]);

    expect(await service.listAdmins()).toEqual([]);
    expect(getAdminUsersSnapshotRaw).not.toHaveBeenCalled();
  });

  it('returns null for an unknown admin', async () => {
    vi.mocked(getAdminUsersSnapshotRaw).mockResolvedValue({
      users: [],
      roles: [],
      permissionOverrides: [],
    });

    expect(await service.getAdmin(99)).toBeNull();
  });

  it('creates an admin with a bcrypt hash and returns the stored shape', async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hash' as never);
    vi.mocked(createAdminUserRaw).mockResolvedValue(5);
    vi.mocked(listAdminUserIdsRaw).mockResolvedValue([]);

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
  });

  it('throws when the created admin cannot be read back', async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hash' as never);
    vi.mocked(createAdminUserRaw).mockResolvedValue(9);
    vi.mocked(getAdminUsersSnapshotRaw).mockResolvedValue({
      users: [],
      roles: [],
      permissionOverrides: [],
    });

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

  it('updates an admin and returns the refreshed record', async () => {
    vi.mocked(updateAdminUserRaw).mockResolvedValue(undefined);

    const admin = await service.updateAdmin(5, { firstName: 'Sana' });

    expect(updateAdminUserRaw).toHaveBeenCalledWith(5, { firstName: 'Sana' });
    expect(admin.id).toBe(5);
  });

  it('throws when an updated admin disappears', async () => {
    vi.mocked(updateAdminUserRaw).mockResolvedValue(undefined);
    vi.mocked(getAdminUsersSnapshotRaw).mockResolvedValue({
      users: [],
      roles: [],
      permissionOverrides: [],
    });

    await expect(service.updateAdmin(5, { isActive: false })).rejects.toThrow(
      'Admin user not found after update',
    );
  });

  it('deactivates an admin and replaces permission overrides', async () => {
    vi.mocked(deactivateAdminUserRaw).mockResolvedValue(undefined);
    vi.mocked(setAdminPermissionOverridesRaw).mockResolvedValue(undefined);

    await service.deactivateAdmin(5);
    await service.setPermissionOverrides(5, [{ permissionId: 2, action: 'revoke' }], 1);

    expect(deactivateAdminUserRaw).toHaveBeenCalledWith(5);
    expect(setAdminPermissionOverridesRaw).toHaveBeenCalledWith(
      5,
      [{ permissionId: 2, action: 'revoke' }],
      1,
    );
  });
});
