import { db } from "@/infrastructure/config/database.config";
import { users, type User as DbUser } from "@/infrastructure/database/schema";
import { IUserRepository } from "@/application/repositories/IUserRepository";
import { User } from "@/domain/entities/User";
import { UserWithPassword } from "@/domain/types/admin";
import { eq } from "drizzle-orm";

/**
 * Drizzle User Repository
 *
 * PostgreSQL implementation of user data access using Drizzle ORM.
 * Handles user authentication and profile management.
 */
export class DrizzleUserRepository implements IUserRepository {
  /**
   * Maps database user to domain entity
   *
   * Excludes sensitive fields like password from the domain model.
   *
   * @param dbUser - Database user record
   * @returns Domain user entity
   */
  private mapToDomain(dbUser: DbUser): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || undefined,
      role: dbUser.role,
      image: dbUser.image || undefined,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };
  }

  /**
   * Retrieves a user by ID
   *
   * @param id - User ID
   * @returns User entity or null if not found
   */
  async getById(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (result.length === 0) return null;
    return this.mapToDomain(result[0]);
  }

  /**
   * Retrieves a user by email
   *
   * @param email - User email address
   * @returns User entity or null if not found
   */
  async getByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (result.length === 0) return null;
    return this.mapToDomain(result[0]);
  }

  /**
   * Retrieves a user by email with password hash
   *
   * Used for authentication. Includes the password field.
   *
   * @param email - User email address
   * @returns User with password or null if not found
   */
  async getByEmailWithPassword(email: string): Promise<UserWithPassword | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (result.length === 0) return null;
    const dbUser = result[0];
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || undefined,
      role: dbUser.role,
      password: dbUser.password,
    };
  }

  /**
   * Creates a new user
   *
   * @param user - Partial user data
   * @returns Created user entity
   */
  async create(user: Partial<User>): Promise<User> {
    const result = await db
      .insert(users)
      .values(user as typeof users.$inferInsert)
      .returning();
    return this.mapToDomain(result[0]);
  }

  /**
   * Updates an existing user
   *
   * @param id - User ID
   * @param user - Partial user data to update
   * @returns Updated user entity
   */
  async update(id: number, user: Partial<User>): Promise<User> {
    const result = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() } as Partial<typeof users.$inferInsert>)
      .where(eq(users.id, id))
      .returning();
    return this.mapToDomain(result[0]);
  }
}
