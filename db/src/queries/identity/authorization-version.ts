import { sql } from 'drizzle-orm';

import { users } from '../../schema';

/** Use in the same mutation that changes a User's access-affecting identity data. */
export function advanceAuthorizationVersion(
  updates: object = {},
): Partial<typeof users.$inferInsert> {
  return {
    ...updates,
    authorizationVersion: sql`${users.authorizationVersion} + 1`,
    updatedAt: new Date(),
  } as unknown as Partial<typeof users.$inferInsert>;
}
