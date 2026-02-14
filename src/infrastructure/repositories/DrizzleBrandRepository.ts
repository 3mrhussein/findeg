import { eq, desc, and } from "drizzle-orm";
import { db } from "@/infrastructure/database";
import { brands, NewBrand, Brand } from "@/infrastructure/database/schema/brands";
import { IBrandRepository } from "@/application/repositories/IBrandRepository";

/**
 * Drizzle Brand Repository
 *
 * PostgreSQL implementation of brand data access using Drizzle ORM.
 */
export class DrizzleBrandRepository implements IBrandRepository {
  /**
   * Retrieves all brands
   *
   * @param activeOnly - If true, returns only active brands
   * @returns Array of brands sorted by creation date (newest first)
   */
  async getAll(activeOnly: boolean = false): Promise<Brand[]> {
    const query = db.select().from(brands);

    if (activeOnly) {
      query.where(eq(brands.isActive, true));
    }

    return query.orderBy(desc(brands.createdAt));
  }

  /**
   * Retrieves a brand by ID
   *
   * @param id - Brand ID
   * @returns Brand entity or null if not found
   */
  async getById(id: number): Promise<Brand | null> {
    const result = await db.select().from(brands).where(eq(brands.id, id));
    return result[0] || null;
  }

  /**
   * Retrieves a brand by slug
   *
   * @param slug - Brand URL slug
   * @returns Brand entity or null if not found
   */
  async getBySlug(slug: string): Promise<Brand | null> {
    const result = await db.select().from(brands).where(eq(brands.slug, slug));
    return result[0] || null;
  }

  /**
   * Creates a new brand
   *
   * @param data - Brand data
   * @returns Created brand entity
   */
  async create(data: NewBrand): Promise<Brand> {
    const result = await db.insert(brands).values(data).returning();
    return result[0];
  }

  /**
   * Updates an existing brand
   *
   * @param id - Brand ID
   * @param data - Partial brand data to update
   * @returns Updated brand entity
   */
  async update(id: number, data: Partial<NewBrand>): Promise<Brand> {
    const result = await db
      .update(brands)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(brands.id, id))
      .returning();
    return result[0];
  }

  /**
   * Deletes a brand
   *
   * @param id - Brand ID
   */
  async delete(id: number): Promise<void> {
    await db.delete(brands).where(eq(brands.id, id));
  }

  /**
   * Counts total number of brands
   *
   * @returns Total brand count
   */
  async count(): Promise<number> {
    const result = await db.select({ count: brands.id }).from(brands);
    return result.length;
  }
}
