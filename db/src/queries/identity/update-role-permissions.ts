import { eq, inArray } from 'drizzle-orm';

import { db } from '../../connection';
import { rolePermissions, userRoles, users } from '../../schema';
import { advanceAuthorizationVersion } from './authorization-version';

export async function updateRolePermissionsRaw(
  roleId: number,
  permissionIds: number[],
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

    if (permissionIds.length > 0) {
      await tx.insert(rolePermissions).values(
        permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      );
    }

    // Query after the permission write: a concurrent role assignment either appears
    // here and is advanced with this mutation, or advances its User independently.
    const affectedUsers = await tx
      .selectDistinct({ userId: userRoles.userId })
      .from(userRoles)
      .where(eq(userRoles.roleId, roleId));

    const affectedUserIds = affectedUsers.map((user) => user.userId);
    if (affectedUserIds.length > 0) {
      await tx
        .update(users)
        .set(advanceAuthorizationVersion())
        .where(inArray(users.id, affectedUserIds));
    }
  });
}
