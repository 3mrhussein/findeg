import { and, eq } from 'drizzle-orm';
import type { TransactionDatabase } from '@findeg/db/transactions';
import {
  sessions,
  users,
  staffRoleGrants,
  passwordCredentials,
} from '@findeg/db/modules/identity-access';
import { isStaffRole, type IdentityStore } from '../public.js';

export function bindIdentityStore(database: TransactionDatabase): IdentityStore {
  return {
    async readSession(digest) {
      const [session] = await database
        .select()
        .from(sessions)
        .where(eq(sessions.tokenDigest, digest));
      return session;
    },
    async readUser(id) {
      // Access writers lock this same User before changing grants. Hold through the operation.
      const [user] = await database.select().from(users).where(eq(users.id, id)).for('update');
      if (!user) return undefined;
      const grants = await database
        .select({ role: staffRoleGrants.role })
        .from(staffRoleGrants)
        .where(eq(staffRoleGrants.userId, id));
      return { ...user, staffRoles: grants.map(({ role }) => role).filter(isStaffRole) };
    },
    async refreshSession(digest, version) {
      await database
        .update(sessions)
        .set({ authorizationVersion: version })
        .where(eq(sessions.tokenDigest, digest));
    },
    async findCredentials(email) {
      const [credential] = await database
        .select({ userId: users.id, passwordHash: passwordCredentials.passwordHash })
        .from(users)
        .innerJoin(passwordCredentials, eq(passwordCredentials.userId, users.id))
        .where(and(eq(users.email, email), eq(passwordCredentials.hashStrategy, 'bcrypt')))
        .for('update');
      return credential;
    },
    async insertSession(digest, session) {
      await database.insert(sessions).values({ tokenDigest: digest, ...session });
    },
    async updateStaffAccess(userId, roles, isActive) {
      const [user] = await database
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .for('update');
      if (!user) return false;
      await database.update(users).set({ isActive }).where(eq(users.id, userId));
      await database.delete(staffRoleGrants).where(eq(staffRoleGrants.userId, userId));
      if (roles.length)
        await database.insert(staffRoleGrants).values(roles.map((role) => ({ userId, role })));
      return true;
    },
    async deleteSession(digest) {
      const [session] = await database
        .select({ userId: sessions.userId })
        .from(sessions)
        .where(eq(sessions.tokenDigest, digest));
      if (session)
        await database
          .select({ id: users.id })
          .from(users)
          .where(eq(users.id, session.userId))
          .for('update');
      await database.delete(sessions).where(eq(sessions.tokenDigest, digest));
    },
  };
}
