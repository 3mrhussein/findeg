import { db } from '../../connection';
import { rolePermissions, roles } from '../../schema';

export async function createRoleRaw(
  code: string,
  name: string,
  permissionIds: number[],
): Promise<number> {
  return db.transaction(async (tx) => {
    const [newRole] = await tx.insert(roles).values({ code, name }).returning({ id: roles.id });

    if (permissionIds.length > 0) {
      await tx.insert(rolePermissions).values(
        permissionIds.map((permissionId) => ({
          roleId: newRole.id,
          permissionId,
        })),
      );
    }

    return newRole.id;
  });
}