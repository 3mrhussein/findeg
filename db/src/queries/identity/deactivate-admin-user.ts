import { eq } from 'drizzle-orm';

import { db } from '../../connection';
import { users } from '../../schema';

export async function deactivateAdminUserRaw(userId: number): Promise<void> {
  await db
    .update(users)
    .set({ isActive: false, updatedAt: new Date() } as Partial<typeof users.$inferInsert>)
    .where(eq(users.id, userId));
}