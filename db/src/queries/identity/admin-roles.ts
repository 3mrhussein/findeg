import { count, eq, inArray } from 'drizzle-orm';

import { db } from '../../connection';
import { permissions, rolePermissions, roles, userRoles } from '../../schema';

export interface AdminRoleRowRaw {
  id: number;
  code: string;
  name: string;
}

export interface AdminRolePermissionRowRaw {
  roleId: number;
  permissionId: number;
  permissionCode: string;
  permissionName: string;
}

export interface AdminRoleUserCountRowRaw {
  roleId: number;
  userCount: number;
}

export interface PermissionItemRaw {
  id: number;
  code: string;
  name: string;
}

export interface AdminRolesSnapshotRaw {
  roles: AdminRoleRowRaw[];
  permissions: AdminRolePermissionRowRaw[];
  userCounts: AdminRoleUserCountRowRaw[];
}

export async function listRoleIdsRaw(): Promise<number[]> {
  const rows = await db.select({ id: roles.id }).from(roles).orderBy(roles.id);

  return rows.map((row) => row.id);
}

export async function getAdminRolesSnapshotRaw(
  roleIds: number[],
): Promise<AdminRolesSnapshotRaw> {
  if (roleIds.length === 0) {
    return {
      roles: [],
      permissions: [],
      userCounts: [],
    };
  }

  const [roleRows, permissionRows, userCountRows] = await Promise.all([
    db
      .select({
        id: roles.id,
        code: roles.code,
        name: roles.name,
      })
      .from(roles)
      .where(inArray(roles.id, roleIds))
      .orderBy(roles.id),
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

  return {
    roles: roleRows,
    permissions: permissionRows,
    userCounts: userCountRows.map((row) => ({
      roleId: row.roleId,
      userCount: Number(row.userCount),
    })),
  };
}

export async function listPermissionItemsRaw(): Promise<PermissionItemRaw[]> {
  return db
    .select({
      id: permissions.id,
      code: permissions.code,
      name: permissions.name,
    })
    .from(permissions)
    .orderBy(permissions.id);
}
