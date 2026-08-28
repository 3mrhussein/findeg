import { eq } from 'drizzle-orm';

import { db } from '../../connection';
import { users } from '../../schema';
import { advanceAuthorizationVersion } from './authorization-version';

export async function deactivateAdminUserRaw(userId: number): Promise<void> {
  await db
    .update(users)
    .set(advanceAuthorizationVersion({ isActive: false }))
    .where(eq(users.id, userId));
}
