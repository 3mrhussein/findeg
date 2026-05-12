/**
 * Query Primitives for Users
 *
 * Pure database queries for user operations.
 * No ORM abstraction - direct Drizzle SQL operations.
 *
 * Note: Returns raw database rows. Domain mapping handled by services.
 */

import { db } from '../../connection';
import {
    users,
    userRoles,
    userPermissions,
    rolePermissions,
    permissions,
    passwordCredentials,
    roles,
} from '../../schema';
import { eq } from 'drizzle-orm';
import { type ID } from '@findeg/db/types';

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserRow = typeof users.$inferSelect;

export interface PasswordCredentialsRow {
    userId: number;
    passwordHash: string;
    hashStrategy: 'bcrypt' | 'argon2';
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthorizationContext {
    activeRoleIds: string[];
    permissionCodes: string[];
    organizationId?: string;
}

// ─── Read Operations ─────────────────────────────────────────────────────────

/**
 * Get a user by ID
 */
export async function getById(userId: ID): Promise<UserRow | null> {
    const [user] = await db.select().from(users).where(eq(users.id, userId as number)).limit(1);
    return user || null;
}

/**
 * Get a user by email
 */
export async function getByEmail(email: string): Promise<UserRow | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user || null;
}

/**
 * Get a user by email including password hash
 */
export async function getByEmailWithPassword(
    email: string,
): Promise<(UserRow & { password: string | null }) | null> {
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
        ...dbUser,
        password: passwordHash || null,
    };
}

/**
 * Find password credentials for a user
 */
export async function findPasswordCredentials(userId: ID): Promise<PasswordCredentialsRow | null> {
    const [pc] = await db
        .select()
        .from(passwordCredentials)
        .where(eq(passwordCredentials.userId, userId as number))
        .limit(1);

    if (!pc) return null;

    return {
        userId: pc.userId,
        passwordHash: pc.passwordHash,
        hashStrategy: pc.hashStrategy as 'bcrypt' | 'argon2',
        createdAt: pc.createdAt,
        updatedAt: pc.updatedAt,
    };
}

/**
 * Get authorization context for a user (roles, permissions, organization)
 */
export async function getAuthorizationContext(userId: ID): Promise<AuthorizationContext> {
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
                .where(eq(userRoles.userId, userId as number)),
            db
                .select({
                    permissionCode: permissions.code,
                })
                .from(userRoles)
                .innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
                .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
                .where(eq(userRoles.userId, userId as number)),
            db
                .select({
                    permissionCode: permissions.code,
                    action: userPermissions.action,
                })
                .from(userPermissions)
                .innerJoin(permissions, eq(permissions.id, userPermissions.permissionId))
                .where(eq(userPermissions.userId, userId as number)),
        ]);

        const activeRoleIds = Array.from(
            new Set(
                roleRows
                    .map((row) => row.roleCode?.trim())
                    .filter((value: string | null | undefined): value is string => Boolean(value)),
            ),
        );

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

        const permissionCodes = Array.from(effectivePermissions);

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

// ─── Write Operations ────────────────────────────────────────────────────────

export interface CreateUserInput {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    image?: string;
    portalRole?: 'customer' | 'staff' | 'school_staff';
}

/**
 * Create a new user
 */
export async function create(input: CreateUserInput): Promise<UserRow> {
    const [created] = await db
        .insert(users)
        .values({
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            image: input.image,
            portalRole: input.portalRole || 'customer',
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        .returning();

    return created;
}

export interface UpdateUserInput {
    firstName?: string;
    lastName?: string;
    phone?: string;
    image?: string;
    emailVerified?: Date;
    verifiedPhone?: boolean;
    isActive?: boolean;
}

/**
 * Update a user
 */
export async function update(userId: ID, input: UpdateUserInput): Promise<UserRow> {
    const [updated] = await db
        .update(users)
        .set({
            ...input,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId as number))
        .returning();

    return updated;
}

/**
 * Insert or update password credentials
 */
export async function upsertPasswordCredentials(
    userId: ID,
    payload: {
        passwordHash: string;
        hashStrategy: 'bcrypt' | 'argon2';
    },
): Promise<void> {
    await db
        .insert(passwordCredentials)
        .values({
            userId: userId as number,
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
