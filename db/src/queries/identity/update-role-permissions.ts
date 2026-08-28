import { eq } from 'drizzle-orm';

import { db } from '../../connection';
import { rolePermissions } from '../../schema';

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
  });
}