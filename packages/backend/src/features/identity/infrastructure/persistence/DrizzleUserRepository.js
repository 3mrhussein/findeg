import { db } from "@/features/core/infrastructure/persistence";
import { users, userRoles, userPermissions, rolePermissions, permissions, passwordCredentials, roles, } from "@/features/core/infrastructure/persistence/schema";
import { eq } from "drizzle-orm";
/**
 * Drizzle User Repository
 *
 * PostgreSQL implementation of user data access using Drizzle ORM.
 */
export class DrizzleUserRepository {
    /**
     * Resolves role and permission context from RBAC tables for a user.
     * Falls back safely if identity-access tables are not available yet.
     */
    async getAuthorizationContext(userId) {
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
            const activeRoleIds = Array.from(new Set(roleRows
                .map((row) => { var _a; return (_a = row.roleCode) === null || _a === void 0 ? void 0 : _a.trim(); })
                .filter((value) => Boolean(value))));
            // Start with role-based permissions
            const effectivePermissions = new Set(permissionRows
                .map((row) => { var _a; return (_a = row.permissionCode) === null || _a === void 0 ? void 0 : _a.trim(); })
                .filter((value) => Boolean(value)));
            // Apply user-level overrides: 'grant' adds, 'revoke' removes
            for (const override of overrideRows) {
                if (!override.permissionCode)
                    continue;
                if (override.action === "grant") {
                    effectivePermissions.add(override.permissionCode);
                }
                else if (override.action === "revoke") {
                    effectivePermissions.delete(override.permissionCode);
                }
            }
            const permissionCodes = Array.from(effectivePermissions);
            const scopedRole = roleRows.find((row) => row.scope === "organization" && row.organizationId !== null);
            return {
                activeRoleIds,
                permissionCodes,
                organizationId: (scopedRole === null || scopedRole === void 0 ? void 0 : scopedRole.organizationId) ? String(scopedRole.organizationId) : undefined,
            };
        }
        catch (_a) {
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
    mapToDomain(dbUser) {
        return {
            id: dbUser.id,
            email: dbUser.email,
            firstName: dbUser.firstName || null,
            lastName: dbUser.lastName || null,
            phone: dbUser.phone || null,
            portalRole: dbUser.portalRole,
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
    async getById(id) {
        const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
        if (result.length === 0)
            return null;
        return this.mapToDomain(result[0]);
    }
    /**
     * Retrieves a user by their email address.
     *
     * @param email - The email address to search for.
     * @returns User entity or null if not found.
     */
    async getByEmail(email) {
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (result.length === 0)
            return null;
        return this.mapToDomain(result[0]);
    }
    /**
     * Retrieves a user explicitly including the password hash.
     * Intended ONLY for internal authentication logic (login).
     *
     * @param email - The email address.
     * @returns User entity with password field populated, or null.
     */
    async getByEmailWithPassword(email) {
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
        if (result.length === 0)
            return null;
        const { user: dbUser, passwordHash } = result[0];
        return {
            id: dbUser.id,
            email: dbUser.email,
            firstName: dbUser.firstName || null,
            lastName: dbUser.lastName || null,
            phone: dbUser.phone || null,
            portalRole: dbUser.portalRole,
            password: passwordHash || null,
        };
    }
    /**
     * Creates a new user record in the database.
     *
     * @param user - Partial user object containing required fields (email, role, etc.).
     * @returns The newly created Domain User entity.
     */
    async create(user) {
        const result = await db
            .insert(users)
            .values(user)
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
    async update(id, user) {
        const result = await db
            .update(users)
            .set(Object.assign(Object.assign({}, user), { updatedAt: new Date() }))
            .where(eq(users.id, id))
            .returning();
        return this.mapToDomain(result[0]);
    }
    async findPasswordCredentials(userId) {
        const result = await db
            .select()
            .from(passwordCredentials)
            .where(eq(passwordCredentials.userId, userId))
            .limit(1);
        if (result.length === 0)
            return null;
        const pc = result[0];
        return {
            userId: pc.userId,
            passwordHash: pc.passwordHash,
            hashStrategy: pc.hashStrategy,
            createdAt: pc.createdAt,
            updatedAt: pc.updatedAt,
        };
    }
    async upsertPasswordCredentials(userId, payload) {
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
