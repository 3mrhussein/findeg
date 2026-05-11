import { count, eq } from 'drizzle-orm';

import { db } from '../../connection';
import { userRoles } from '../../schema';

export async function getRoleUserCountRaw(roleId: number): Promise<number> {
  const [result] = await db
    .select({ userCount: count() })
    .from(userRoles)
    .where(eq(userRoles.roleId, roleId));

  return Number(result?.userCount ?? 0);
}