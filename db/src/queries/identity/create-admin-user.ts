import { db } from '../../connection';
import { passwordCredentials, userRoles, users } from '../../schema';

export interface CreateAdminUserRawInput {
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  roleIds: number[];
}

export async function createAdminUserRaw(input: CreateAdminUserRawInput): Promise<number> {
  return db.transaction(async (tx) => {
    const [newUser] = await tx
      .insert(users)
      .values({
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        portalRole: 'staff',
        isActive: true,
      })
      .returning({ id: users.id });

    await tx.insert(passwordCredentials).values({
      userId: newUser.id,
      passwordHash: input.passwordHash,
      hashStrategy: 'bcrypt',
    });

    if (input.roleIds.length > 0) {
      await tx.insert(userRoles).values(
        input.roleIds.map((roleId) => ({
          userId: newUser.id,
          roleId,
          scope: 'global' as const,
        })),
      );
    }

    return newUser.id;
  });
}