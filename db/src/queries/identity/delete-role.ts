import { eq } from 'drizzle-orm';

import { db } from '../../connection';
import { roles } from '../../schema';

export async function deleteRoleRaw(roleId: number): Promise<void> {
  await db.delete(roles).where(eq(roles.id, roleId));
}