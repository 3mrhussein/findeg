import { ID } from '../../../core/domain/types/common';
import { BaseDrizzleRepository } from '../../../core/infrastructure/persistence/BaseDrizzleRepository';
import {
  users,
  userRoles,
  userPermissions,
  rolePermissions,
  permissions,
  passwordCredentials,
  roles,
  type User as DbUser,
} from '@findeg/db/schema';
import { IUserRepository } from '../../application/interfaces/IUserRepository';
import { User } from '../../domain/entities/User';
import { PasswordCredentials, HashStrategy } from '../../domain/entities/PasswordCredentials';
import { eq } from 'drizzle-orm';
import type { PermissionCode, RoleId } from '../../../core/domain/value-objects';

/**
 * Drizzle User Repository
 *
 * PostgreSQL implementation of user data access using Drizzle ORM.
 * Leveraging BaseDrizzleRepository for standard CRUD operations.
 */
export class DrizzleUserRepository
  extends BaseDrizzleRepository<typeof users, User, number>
  implements IUserRepository
{
  constructor() {
    super(users);
  }
  /**
   * Resolves role and permission context from RBAC tables for a user.
   * Falls back safely if identity-access tables are not available yet.
   */
  async getAuthorizationContext(userId: ID): Promise<{
    activeRoleIds: RoleId[];
    permissionCodes: PermissionCode[];
    organizationId?: string;
  }> {
    try {
      const [roleRows, permissionRows, overrideRows] = await Promise.all([
        this.db
          .select({
            roleCode: roles.code,
            scope: userRoles.scope,
            organizationId: userRoles.organizationId,
          })
          .from(userRoles)
          .innerJoin(roles, eq(roles.id, userRoles.roleId))
          .where(eq(userRoles.userId, userId)),
        this.db
          .select({
            permissionCode: permissions.code,
          })
          .from(userRoles)
          .innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
          .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
          .where(eq(userRoles.userId, userId)),
        // Fetch per-user permission overrides
        this.db
          .select({
            permissionCode: permissions.code,
            action: userPermissions.action,
          })
          .from(userPermissions)
          .innerJoin(permissions, eq(permissions.id, userPermissions.permissionId))
          .where(eq(userPermissions.userId, userId)),
      ]);

      const activeRoleIds = Array.from(
        new Set(
          roleRows
            .map((row) => row.roleCode?.trim())
            .filter((value: string | null | undefined): value is string => Boolean(value)),
        ),
      ) as RoleId[];

      // Start with role-based permissions
      const effectivePermissions = new Set(
        permissionRows
          .map((row) => row.permissionCode?.trim())
          .filter((value: string | null | undefined): value is string => Boolean(value)),
      );

      // Apply user-level overrides: 'grant' adds, 'revoke' removes
      for (const override of overrideRows) {
        if (!override.permissionCode) continue;
        if (override.action === 'grant') {
          effectivePermissions.add(override.permissionCode);
        } else if (override.action === 'revoke') {
          effectivePermissions.delete(override.permissionCode);
        }
      }

      const permissionCodes = Array.from(effectivePermissions) as PermissionCode[];

      const scopedRole = roleRows.find(
        (row) => row.scope === 'organization' && row.organizationId !== null,
      );

      return {
        activeRoleIds,
        permissionCodes,
        organizationId: scopedRole?.organizationId ? String(scopedRole.organizationId) : undefined,
      };
    } catch {
      return {
        activeRoleIds: [],
        permissionCodes: [],
      };
    }
  }

  /**
   * Transforms a database user record into a clean Domain User entity.
   */
  protected mapToDomain(dbUser: DbUser): User {
    return {
      ...dbUser,
    };
  }

  /**
   * Retrieves a user by their email address.
   */
  async getByEmail(email: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    if (result.length === 0) return null;
    return this.mapToDomain(result[0]);
  }

  /**
   * Retrieves a user explicitly including the password hash.
   */
  async getByEmailWithPassword(email: string): Promise<(User & { password: string | null }) | null> {
    const result = await this.db
      .select({
        user: users,
        passwordHash: passwordCredentials.passwordHash,
      })
      .from(users)
      .leftJoin(passwordCredentials, eq(users.id, passwordCredentials.userId))
      .where(eq(users.email, email))
      .limit(1);

    if (result.length === 0) return null;
    const { user: dbUser, passwordHash } = result[0];

    return {
      ...this.mapToDomain(dbUser),
      password: passwordHash || null,
    };
  }

  async findPasswordCredentials(userId: ID): Promise<PasswordCredentials | null> {
    const result = await this.db
      .select()
      .from(passwordCredentials)
      .where(eq(passwordCredentials.userId, userId))
      .limit(1);

    if (result.length === 0) return null;
    const pc = result[0];

    return {
      userId: pc.userId,
      passwordHash: pc.passwordHash,
      hashStrategy: pc.hashStrategy as HashStrategy,
      createdAt: pc.createdAt,
      updatedAt: pc.updatedAt,
    };
  }

  async upsertPasswordCredentials(
    userId: ID,
    payload: Omit<PasswordCredentials, 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<void> {
    await this.db
      .insert(passwordCredentials)
      .values({
        userId,
        passwordHash: payload.passwordHash,
        hashStrategy: payload.hashStrategy,
      })
      .onConflictDoUpdate({
        target: passwordCredentials.userId,
        set: {
          passwordHash: payload.passwordHash,
          hashStrategy: payload.hashStrategy,
          updatedAt: new Date(),
        },
      });
  }
}
