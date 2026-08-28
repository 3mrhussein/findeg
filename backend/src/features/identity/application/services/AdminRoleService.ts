/**
 * Admin Role Service
 *
 * Manages roles and their permission assignments.
 * All operations require system_admin privileges (enforced at the API layer).
 */

import {
  createRoleRaw,
  deleteRoleRaw,
  getAdminRolesSnapshotRaw,
  getRoleUserCountRaw,
  listPermissionItemsRaw,
  listRoleIdsRaw,
  updateRolePermissionsRaw,
} from '@findeg/db/queries';

import type {
  RoleWithPermissions,
  PermissionItem,
  IAdminRoleService,
} from '../interfaces/IAdminRoleService';

/**
 *
 */
export class AdminRoleService implements IAdminRoleService {
  /**
   * Returns all roles with their permissions and how many users are assigned.
   */
  async listRoles(): Promise<RoleWithPermissions[]> {
    const roleIds = await listRoleIdsRaw();
    return this.enrichRoles(roleIds);
  }

  /**
   * Returns a single role by ID or null.
   */
  async getRole(roleId: number): Promise<RoleWithPermissions | null> {
    const results = await this.enrichRoles([roleId]);
    return results[0] ?? null;
  }

  /**
   * Creates a new role and assigns permissions.
   */
  async createRole(
    code: string,
    name: string,
    permissionIds: number[],
  ): Promise<RoleWithPermissions> {
    const roleId = await createRoleRaw(code, name, permissionIds);

    const result = await this.getRole(roleId);
    if (!result) throw new Error('Failed to fetch created role');
    return result;
  }

  /**
   * Replaces all permissions for a role.
   */
  async updateRolePermissions(
    roleId: number,
    permissionIds: number[],
  ): Promise<RoleWithPermissions> {
    await updateRolePermissionsRaw(roleId, permissionIds);

    const result = await this.getRole(roleId);
    if (!result) throw new Error('Role not found after update');
    return result;
  }

  /**
   * Deletes a role. Throws if any users are currently assigned to it.
   */
  async deleteRole(roleId: number): Promise<void> {
    const userCount = await getRoleUserCountRaw(roleId);

    if (userCount > 0) {
      throw new Error(
        'Cannot delete role: users are currently assigned to it. Remove all user assignments first.',
      );
    }

    await deleteRoleRaw(roleId);
  }

  /**
   * Returns all available permissions.
   */
  async listPermissions(): Promise<PermissionItem[]> {
    return listPermissionItemsRaw();
  }

  /**
   * Internal helper — enriches role IDs with permissions and user count.
   */
  private async enrichRoles(roleIds: number[]): Promise<RoleWithPermissions[]> {
    const snapshot = await getAdminRolesSnapshotRaw(roleIds);
    const userCountMap = new Map(snapshot.userCounts.map((row) => [row.roleId, row.userCount]));

    return snapshot.roles.map((role) => ({
      id: role.id,
      code: role.code,
      name: role.name,
      permissions: snapshot.permissions
        .filter((p) => p.roleId === role.id)
        .map((p) => ({ id: p.permissionId, code: p.permissionCode, name: p.permissionName })),
      userCount: userCountMap.get(role.id) ?? 0,
    }));
  }
}
