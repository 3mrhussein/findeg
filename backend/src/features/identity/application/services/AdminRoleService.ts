/**
 * Admin Role Service
 *
 * Manages roles and their permission assignments.
 * All operations require system_admin privileges (enforced at the API layer).
 */

import { eq, inArray, count } from "drizzle-orm";

import { db } from "../../../core/infrastructure/persistence";
import {
  roles,
  permissions,
  rolePermissions,
  userRoles,
} from "../../../core/infrastructure/persistence/schema";

import type {
  RoleWithPermissions,
  PermissionItem,
  IAdminRoleService,
} from "../interfaces/IAdminRoleService";

/**
 *
 */
export class AdminRoleService implements IAdminRoleService {
  /**
   * Returns all roles with their permissions and how many users are assigned.
   */
  async listRoles(): Promise<RoleWithPermissions[]> {
    const allRoles = await db.select().from(roles).orderBy(roles.id);
    return this.enrichRoles(allRoles.map((r) => r.id));
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
    const [newRole] = await db.insert(roles).values({ code, name }).returning({ id: roles.id });

    if (permissionIds.length > 0) {
      await db.insert(rolePermissions).values(
        permissionIds.map((permissionId) => ({
          roleId: newRole.id,
          permissionId,
        })),
      );
    }

    const result = await this.getRole(newRole.id);
    if (!result) throw new Error("Failed to fetch created role");
    return result;
  }

  /**
   * Replaces all permissions for a role.
   */
  async updateRolePermissions(
    roleId: number,
    permissionIds: number[],
  ): Promise<RoleWithPermissions> {
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

    if (permissionIds.length > 0) {
      await db.insert(rolePermissions).values(
        permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      );
    }

    const result = await this.getRole(roleId);
    if (!result) throw new Error("Role not found after update");
    return result;
  }

  /**
   * Deletes a role. Throws if any users are currently assigned to it.
   */
  async deleteRole(roleId: number): Promise<void> {
    const [{ userCount }] = await db
      .select({ userCount: count() })
      .from(userRoles)
      .where(eq(userRoles.roleId, roleId));

    if (Number(userCount) > 0) {
      throw new Error(
        "Cannot delete role: users are currently assigned to it. Remove all user assignments first.",
      );
    }

    await db.delete(roles).where(eq(roles.id, roleId));
  }

  /**
   * Returns all available permissions.
   */
  async listPermissions(): Promise<PermissionItem[]> {
    const rows = await db.select().from(permissions).orderBy(permissions.id);
    return rows.map((p) => ({ id: p.id, code: p.code, name: p.name }));
  }

  /**
   * Internal helper — enriches role IDs with permissions and user count.
   */
  private async enrichRoles(roleIds: number[]): Promise<RoleWithPermissions[]> {
    if (roleIds.length === 0) return [];

    const [roleRows, permissionRows, userCountRows] = await Promise.all([
      db.select().from(roles).where(inArray(roles.id, roleIds)).orderBy(roles.id),
      db
        .select({
          roleId: rolePermissions.roleId,
          permissionId: permissions.id,
          permissionCode: permissions.code,
          permissionName: permissions.name,
        })
        .from(rolePermissions)
        .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
        .where(inArray(rolePermissions.roleId, roleIds)),
      db
        .select({
          roleId: userRoles.roleId,
          userCount: count(),
        })
        .from(userRoles)
        .where(inArray(userRoles.roleId, roleIds))
        .groupBy(userRoles.roleId),
    ]);

    const userCountMap = new Map(userCountRows.map((r) => [r.roleId, Number(r.userCount)]));

    return roleRows.map((role) => ({
      id: role.id,
      code: role.code,
      name: role.name,
      permissions: permissionRows
        .filter((p) => p.roleId === role.id)
        .map((p) => ({ id: p.permissionId, code: p.permissionCode, name: p.permissionName })),
      userCount: userCountMap.get(role.id) ?? 0,
    }));
  }
}
