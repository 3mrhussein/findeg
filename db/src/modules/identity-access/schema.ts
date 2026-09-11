/** Owner-scoped schema construction surface. Legacy mappings are retained until replacement. */
export { users } from '../../schema/identity/users.js';
export {
  authAccounts,
  passwordCredentials,
  roles,
  permissions,
  rolePermissions,
  userRoles,
  userPermissions,
  guestPrincipals,
} from '../../schema/identity/identity-access.js';

import { integer, varchar, timestamp, primaryKey, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { identitySchema } from '../../schema/schemas.js';
import { users } from '../../schema/identity/users.js';

/** An opaque credential identifies authentication only; portal context belongs to a request. */
export const sessions = identitySchema.table(
  'sessions',
  {
    tokenDigest: varchar('token_digest', { length: 64 }).primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    authorizationVersion: integer('authorization_version').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_sessions_user').on(table.userId)],
);

/** Fixed additive target roles; legacy configurable RBAC does not authorize the target host. */
export const staffRoleGrants = identitySchema.table(
  'staff_role_grants',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 40 }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.role] }),
    check(
      'staff_role_fixed',
      sql`${table.role} in ('access-administrator', 'catalog-manager', 'fulfillment-operator', 'finance-manager')`,
    ),
  ],
);
