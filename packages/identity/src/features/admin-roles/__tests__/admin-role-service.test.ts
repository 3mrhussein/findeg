import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createRoleRaw,
  deleteRoleRaw,
  getAdminRolesSnapshotRaw,
  getRoleUserCountRaw,
  listPermissionItemsRaw,
  listRoleIdsRaw,
  updateRolePermissionsRaw,
} from '@findeg/db/queries';
import { AdminRoleService } from '../helpers';

vi.mock('@findeg/db/queries', () => ({
  createRoleRaw: vi.fn(),
  deleteRoleRaw: vi.fn(),
  getAdminRolesSnapshotRaw: vi.fn(),
  getRoleUserCountRaw: vi.fn(),
  listPermissionItemsRaw: vi.fn(),
  listRoleIdsRaw: vi.fn(),
  updateRolePermissionsRaw: vi.fn(),
}));

const snapshot = {
  roles: [{ id: 1, code: 'catalog_manager', name: 'Catalog' }],
  permissions: [
    { roleId: 1, permissionId: 7, permissionCode: 'catalog.write', permissionName: 'Write' },
  ],
  userCounts: [{ roleId: 1, userCount: 3 }],
};

describe('AdminRoleService', () => {
  let service: AdminRoleService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminRoleService();
    vi.mocked(getAdminRolesSnapshotRaw).mockResolvedValue(snapshot);
  });

  it('lists roles with permissions and user counts', async () => {
    vi.mocked(listRoleIdsRaw).mockResolvedValue([1]);

    expect(await service.listRoles()).toEqual([
      {
        id: 1,
        code: 'catalog_manager',
        name: 'Catalog',
        permissions: [{ id: 7, code: 'catalog.write', name: 'Write' }],
        userCount: 3,
      },
    ]);
  });

  it('returns null for an unknown role and a count of zero when no users hold it', async () => {
    vi.mocked(getAdminRolesSnapshotRaw).mockResolvedValueOnce({
      roles: [{ id: 2, code: 'empty', name: 'Empty' }],
      permissions: [],
      userCounts: [],
    });
    expect(await service.getRole(2)).toEqual({
      id: 2,
      code: 'empty',
      name: 'Empty',
      permissions: [],
      userCount: 0,
    });

    vi.mocked(getAdminRolesSnapshotRaw).mockResolvedValueOnce({
      roles: [],
      permissions: [],
      userCounts: [],
    });
    expect(await service.getRole(99)).toBeNull();
  });

  it('creates a role and returns it', async () => {
    vi.mocked(createRoleRaw).mockResolvedValue(1);

    const role = await service.createRole('catalog_manager', 'Catalog', [7]);

    expect(createRoleRaw).toHaveBeenCalledWith('catalog_manager', 'Catalog', [7]);
    expect(role.id).toBe(1);
  });

  it('throws when a created role cannot be read back', async () => {
    vi.mocked(createRoleRaw).mockResolvedValue(9);
    vi.mocked(getAdminRolesSnapshotRaw).mockResolvedValue({
      roles: [],
      permissions: [],
      userCounts: [],
    });

    await expect(service.createRole('x', 'X', [])).rejects.toThrow('Failed to fetch created role');
  });

  it('replaces role permissions and returns the updated role', async () => {
    vi.mocked(updateRolePermissionsRaw).mockResolvedValue(undefined);

    const role = await service.updateRolePermissions(1, [7]);

    expect(updateRolePermissionsRaw).toHaveBeenCalledWith(1, [7]);
    expect(role.id).toBe(1);
  });

  it('throws when an updated role disappears', async () => {
    vi.mocked(updateRolePermissionsRaw).mockResolvedValue(undefined);
    vi.mocked(getAdminRolesSnapshotRaw).mockResolvedValue({
      roles: [],
      permissions: [],
      userCounts: [],
    });

    await expect(service.updateRolePermissions(1, [])).rejects.toThrow(
      'Role not found after update',
    );
  });

  it('refuses to delete a role that users still hold', async () => {
    vi.mocked(getRoleUserCountRaw).mockResolvedValue(2);

    await expect(service.deleteRole(1)).rejects.toThrow('Cannot delete role');
    expect(deleteRoleRaw).not.toHaveBeenCalled();
  });

  it('deletes an unassigned role and lists the permission catalogue', async () => {
    vi.mocked(getRoleUserCountRaw).mockResolvedValue(0);
    vi.mocked(deleteRoleRaw).mockResolvedValue(undefined);
    vi.mocked(listPermissionItemsRaw).mockResolvedValue([
      { id: 7, code: 'catalog.write', name: 'Write' },
    ] as never);

    await service.deleteRole(1);

    expect(deleteRoleRaw).toHaveBeenCalledWith(1);
    expect(await service.listPermissions()).toEqual([
      { id: 7, code: 'catalog.write', name: 'Write' },
    ]);
  });
});
