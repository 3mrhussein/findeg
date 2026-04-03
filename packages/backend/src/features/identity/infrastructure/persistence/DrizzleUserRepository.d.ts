import { ID, Email } from "@/features/core/domain/types/common";
import { UserWithPassword } from "@/features/core/domain/auth";
import { IUserRepository } from "../../application/interfaces/IUserRepository";
import { User } from "../../domain/entities/User";
import { PasswordCredentials } from "../../domain/entities/PasswordCredentials";
import type { PermissionCode, RoleId } from "@/features/core/domain/value-objects";
/**
 * Drizzle User Repository
 *
 * PostgreSQL implementation of user data access using Drizzle ORM.
 */
export declare class DrizzleUserRepository implements IUserRepository {
    /**
     * Resolves role and permission context from RBAC tables for a user.
     * Falls back safely if identity-access tables are not available yet.
     */
    getAuthorizationContext(userId: ID): Promise<{
        activeRoleIds: RoleId[];
        permissionCodes: PermissionCode[];
        organizationId?: string;
    }>;
    /**
     * Transforms a database user record into a clean Domain User entity.
     * Handles null/undefined fields and type conversions.
     *
     * @param dbUser - Raw user record from the database.
     * @returns Domain User entity.
     */
    private mapToDomain;
    /**
     * Retrieves a user by their unique numerical ID.
     *
     * @param id - The user ID.
     * @returns User entity or null if not found.
     */
    getById(id: ID): Promise<User | null>;
    /**
     * Retrieves a user by their email address.
     *
     * @param email - The email address to search for.
     * @returns User entity or null if not found.
     */
    getByEmail(email: Email): Promise<User | null>;
    /**
     * Retrieves a user explicitly including the password hash.
     * Intended ONLY for internal authentication logic (login).
     *
     * @param email - The email address.
     * @returns User entity with password field populated, or null.
     */
    getByEmailWithPassword(email: Email): Promise<UserWithPassword | null>;
    /**
     * Creates a new user record in the database.
     *
     * @param user - Partial user object containing required fields (email, role, etc.).
     * @returns The newly created Domain User entity.
     */
    create(user: Partial<User>): Promise<User>;
    /**
     * Updates an existing user's profile information.
     * Automatically updates the 'updatedAt' timestamp.
     *
     * @param id - The ID of the user to update.
     * @param user - Partial object with fields to change.
     * @returns The updated Domain User entity.
     */
    update(id: ID, user: Partial<User>): Promise<User>;
    findPasswordCredentials(userId: ID): Promise<PasswordCredentials | null>;
    upsertPasswordCredentials(userId: ID, payload: Omit<PasswordCredentials, "userId" | "createdAt" | "updatedAt">): Promise<void>;
}
