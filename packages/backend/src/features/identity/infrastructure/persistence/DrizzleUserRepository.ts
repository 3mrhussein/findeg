import { ID, Email, PortalRole } from "@/features/core/domain/types/common";
import { UserWithPassword } from "@/features/core/domain/auth";
import { db } from "@/features/core/infrastructure/persistence";
import {
  users,
  userRoles,
  userPermissions,
  rolePermissions,
  permissions,
  passwordCredentials,
  roles,
  type User as DbUser,
} from "@/features/core/infrastructure/persistence/schema";
import { IUserRepository } from "../../application/interfaces/IUserRepository";
import { User } from "../../domain/entities/User";
import { PasswordCredentials, HashStrategy } from "../../domain/entities/PasswordCredentials";
import { eq } from "drizzle-orm";
import type { PermissionCode, RoleId } from "@/features/core/domain/value-objects";

/**
 * Drizzle User Repository
 *
 * PostgreSQL implementation of user data access using Drizzle ORM.
 */
export class DrizzleUserRepository implements IUserRepository {
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
        db
          .select({
            roleCode: roles.code,
            scope: userRoles.scope,
            organizationId: userRoles.organizationId,
          })
          .from(userRoles)
          .innerJoin(roles, eq(roles.id, userRoles.roleId))
          .where(eq(userRoles.userId, userId)),
        db
          .select({
            permissionCode: permissions.code,
          })
          .from(userRoles)
          .innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
          .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
          .where(eq(userRoles.userId, userId)),
        // Fetch per-user permission overrides
        db
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
            .filter((value): value is string => Boolean(value)),
        ),
      ) as RoleId[];

      // Start with role-based permissions
      const effectivePermissions = new Set(
        permissionRows
          .map((row) => row.permissionCode?.trim())
          .filter((value): value is string => Boolean(value)),
      );

      // Apply user-level overrides: 'grant' adds, 'revoke' removes
      for (const override of overrideRows) {
        if (!override.permissionCode) continue;
        if (override.action === "grant") {
          effectivePermissions.add(override.permissionCode);
        } else if (override.action === "revoke") {
          effectivePermissions.delete(override.permissionCode);
        }
      }

      const permissionCodes = Array.from(effectivePermissions) as PermissionCode[];

      const scopedRole = roleRows.find(
        (row) => row.scope === "organization" && row.organizationId !== null,
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
   * Handles null/undefined fields and type conversions.
   *
   * @param dbUser - Raw user record from the database.
   * @returns Domain User entity.
   */
  private mapToDomain(dbUser: DbUser): User {
    return {
      id: dbUser.id,
      email: dbUser.email as Email,
      firstName: dbUser.firstName || null,
      lastName: dbUser.lastName || null,
      phone: dbUser.phone || null,
      portalRole: dbUser.portalRole as PortalRole,
      image: dbUser.image || undefined,
      isActive: dbUser.isActive,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };
  }

  /**
   * Retrieves a user by their unique numerical ID.
   *
   * @param id - The user ID.
   * @returns User entity or null if not found.
   */
  async getById(id: ID): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (result.length === 0) return null;
    return this.mapToDomain(result[0]);
  }

  /**
   * Retrieves a user by their email address.
   *
   * @param email - The email address to search for.
   * @returns User entity or null if not found.
   */
  async getByEmail(email: Email): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (result.length === 0) return null;
    return this.mapToDomain(result[0]);
  }

  /**
   * Retrieves a user explicitly including the password hash.
   * Intended ONLY for internal authentication logic (login).
   *
   * @param email - The email address.
   * @returns User entity with password field populated, or null.
   */
  async getByEmailWithPassword(email: Email): Promise<UserWithPassword | null> {
    // Note: Temporary shim while AuthService transition occurs
    // Combines users and passwordCredentials
    const result = await db
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
      id: dbUser.id,
      email: dbUser.email as Email,
      firstName: dbUser.firstName || null,
      lastName: dbUser.lastName || null,
      phone: dbUser.phone || null,
      portalRole: dbUser.portalRole as PortalRole,
      password: passwordHash || null,
    };
  }

  /**
   * Creates a new user record in the database.
   *
   * @param user - Partial user object containing required fields (email, role, etc.).
   * @returns The newly created Domain User entity.
   */
  async create(user: Partial<User>): Promise<User> {
    const result = await db
      .insert(users)
      .values(user as typeof users.$inferInsert)
      .returning();
    return this.mapToDomain(result[0]);
  }

  /**
   * Updates an existing user's profile information.
   * Automatically updates the 'updatedAt' timestamp.
   *
   * @param id - The ID of the user to update.
   * @param user - Partial object with fields to change.
   * @returns The updated Domain User entity.
   */
  async update(id: ID, user: Partial<User>): Promise<User> {
    const result = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() } as Partial<typeof users.$inferInsert>)
      .where(eq(users.id, id))
      .returning();
    return this.mapToDomain(result[0]);
  }

  async findPasswordCredentials(userId: ID): Promise<PasswordCredentials | null> {
    const result = await db
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
    payload: Omit<PasswordCredentials, "userId" | "createdAt" | "updatedAt">,
  ): Promise<void> {
    await db
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
