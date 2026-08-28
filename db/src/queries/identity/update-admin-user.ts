import { eq } from 'drizzle-orm';

import { db } from '../../connection';
import { userRoles, users } from '../../schema';
import { advanceAuthorizationVersion } from './authorization-version';

export interface UpdateAdminUserRawInput {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roleIds?: number[];
}

export async function updateAdminUserRaw(
  userId: number,
  input: UpdateAdminUserRawInput,
): Promise<void> {
  await db.transaction(async (tx) => {
    const changesAuthorization = input.isActive !== undefined || input.roleIds !== undefined;

    if (
      input.firstName !== undefined ||
      input.lastName !== undefined ||
      input.isActive !== undefined ||
      input.roleIds !== undefined
    ) {
      const updates: Record<string, unknown> = {};
      if (input.firstName !== undefined) updates.firstName = input.firstName;
      if (input.lastName !== undefined) updates.lastName = input.lastName;
      if (input.isActive !== undefined) updates.isActive = input.isActive;

      await tx
        .update(users)
        .set(
          changesAuthorization
            ? advanceAuthorizationVersion(updates)
            : ({ ...updates, updatedAt: new Date() } as Partial<typeof users.$inferInsert>),
        )
        .where(eq(users.id, userId));
    }

    if (input.roleIds !== undefined) {
      await tx.delete(userRoles).where(eq(userRoles.userId, userId));

      if (input.roleIds.length > 0) {
        await tx.insert(userRoles).values(
          input.roleIds.map((roleId) => ({
            userId,
            roleId,
            scope: 'global' as const,
          })),
        );
      }
    }
  });
}
