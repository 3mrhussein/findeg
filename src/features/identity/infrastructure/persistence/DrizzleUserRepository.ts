import { ID, Email, UserRole } from "@/features/core/domain/types/common";
import { UserWithPassword } from "@/features/core/domain/auth";
import { db } from "@/features/core/infrastructure/persistence";
import { users, type User as DbUser } from "@/features/core/infrastructure/persistence/schema";
import { IUserRepository } from "../../application/interfaces/IUserRepository";
import { User } from "../../domain/entities/User";
import { eq } from "drizzle-orm";

/**
 * Drizzle User Repository
 *
 * PostgreSQL implementation of user data access using Drizzle ORM.
 */
export class DrizzleUserRepository implements IUserRepository {
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
      firstName: dbUser.firstName || undefined,
      lastName: dbUser.lastName || undefined,
      name: dbUser.name || undefined,
      phone: dbUser.phone || undefined,
      role: dbUser.role as UserRole,
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
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (result.length === 0) return null;
    const dbUser = result[0];
    return {
      id: dbUser.id,
      email: dbUser.email as Email,
      firstName: dbUser.firstName || undefined,
      lastName: dbUser.lastName || undefined,
      name: dbUser.name || undefined,
      phone: dbUser.phone || undefined,
      role: dbUser.role as UserRole,
      password: dbUser.password,
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
}
