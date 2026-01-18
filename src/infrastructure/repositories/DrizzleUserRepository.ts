import { db } from "@/infrastructure/config/database.config";
import { users, type User as DbUser } from "@/infrastructure/database/schema";
import { IUserRepository } from "@/application/repositories/IUserRepository";
import { User } from "@/domain/entities/User";
import { eq } from "drizzle-orm";

export class DrizzleUserRepository implements IUserRepository {
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

  async getById(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (result.length === 0) return null;
    return this.mapToDomain(result[0]);
  }

  async getByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (result.length === 0) return null;
    return this.mapToDomain(result[0]);
  }

  async create(user: Partial<User>): Promise<User> {
    const result = await db.insert(users).values(user as any).returning();
    return this.mapToDomain(result[0]);
  }

  async update(id: number, user: Partial<User>): Promise<User> {
    const result = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() } as any)
      .where(eq(users.id, id))
      .returning();
    return this.mapToDomain(result[0]);
  }
}
