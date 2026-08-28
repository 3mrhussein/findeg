import { eq } from 'drizzle-orm';

import { db } from '../../connection';
import { userPermissions } from '../../schema';

export interface PermissionOverrideMutationRawInput {
  permissionId: number;
  action: 'grant' | 'revoke';
}

export async function setAdminPermissionOverridesRaw(
  userId: number,
  overrides: PermissionOverrideMutationRawInput[],
  grantedBy: number,
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(userPermissions).where(eq(userPermissions.userId, userId));

    if (overrides.length > 0) {
      await tx.insert(userPermissions).values(
        overrides.map((override) => ({
          userId,
          permissionId: override.permissionId,
          action: override.action,
          grantedBy,
        })),
      );
    }
  });
}