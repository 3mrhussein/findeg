import { eq, inArray } from 'drizzle-orm';

import { db } from '../../connection';
import { permissions, roles, userPermissions, userRoles, users } from '../../schema';

export interface AdminUserRowRaw {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface AdminUserRoleRowRaw {
  userId: number;
  roleId: number;
  roleCode: string;
  roleName: string;
}

export interface AdminUserPermissionOverrideRowRaw {
  userId: number;
  permissionCode: string;
  action: string;
}

export interface AdminUsersSnapshotRaw {
  users: AdminUserRowRaw[];
  roles: AdminUserRoleRowRaw[];
  permissionOverrides: AdminUserPermissionOverrideRowRaw[];
}

export async function listAdminUserIdsRaw(): Promise<number[]> {
  const rows = await db.selectDistinct({ userId: userRoles.userId }).from(userRoles);

  return rows.map((row) => row.userId);
}

export async function getAdminUsersSnapshotRaw(
  userIds: number[],
): Promise<AdminUsersSnapshotRaw> {
  if (userIds.length === 0) {
    return {
      users: [],
      roles: [],
      permissionOverrides: [],
    };
  }

  const [userRows, roleRows, overrideRows] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(inArray(users.id, userIds)),
    db
      .select({
        userId: userRoles.userId,
        roleId: roles.id,
        roleCode: roles.code,
        roleName: roles.name,
      })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(inArray(userRoles.userId, userIds)),
    db
      .select({
        userId: userPermissions.userId,
        permissionCode: permissions.code,
        action: userPermissions.action,
      })
      .from(userPermissions)
      .innerJoin(permissions, eq(permissions.id, userPermissions.permissionId))
      .where(inArray(userPermissions.userId, userIds)),
  ]);

  return {
    users: userRows,
    roles: roleRows,
    permissionOverrides: overrideRows,
  };
}
