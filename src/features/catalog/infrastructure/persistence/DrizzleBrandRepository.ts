import { eq, desc, and } from "drizzle-orm";
import { ID, Slug } from "@/features/core/domain/types/common";
import { db } from "@/features/core/infrastructure/persistence";
import { brands } from "@/features/core/infrastructure/persistence/schema";
import {
  IBrandRepository,
  BrandCreateInput,
  BrandUpdateInput,
} from "../../application/interfaces/IBrandRepository";
import { Brand } from "../../domain/entities/Brand";

type DbBrand = typeof brands.$inferSelect;

/**
 * Drizzle Brand Repository
 *
 * PostgreSQL implementation of brand management using Drizzle ORM.
 * Results for list queries are ordered by creation date descending.
 */
export class DrizzleBrandRepository implements IBrandRepository {
  /**
   * Maps a database Brand record to the domain Brand entity.
   */
  private mapToDomain(dbBrand: DbBrand): Brand {
    return {
      id: dbBrand.id,
      slug: dbBrand.slug as Slug,
      name: dbBrand.name,
      logoUrl: dbBrand.logoUrl,
      isActive: dbBrand.isActive,
      createdAt: dbBrand.createdAt,
      updatedAt: dbBrand.updatedAt,
    };
  }

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

    const dbBrands = await query.orderBy(desc(brands.createdAt));
    return dbBrands.map(this.mapToDomain);
  }

  /**
   * Retrieves a brand by ID
   *
   * @param id - Brand ID
   * @returns Brand entity or null if not found
   */
  async getById(id: ID): Promise<Brand | null> {
    const result = await db.select().from(brands).where(eq(brands.id, id));
    return result[0] ? this.mapToDomain(result[0]) : null;
  }

  /**
   * Retrieves a brand by slug
   *
   * @param slug - Brand URL slug
   * @returns Brand entity or null if not found
   */
  async getBySlug(slug: Slug): Promise<Brand | null> {
    const result = await db.select().from(brands).where(eq(brands.slug, slug));
    return result[0] ? this.mapToDomain(result[0]) : null;
  }

  /**
   * Creates a new brand
   *
   * @param data - Brand data
   * @returns Created brand entity
   */
  async create(data: BrandCreateInput): Promise<Brand> {
    const result = await db.insert(brands).values(data).returning();
    return this.mapToDomain(result[0]);
  }

  /**
   * Updates an existing brand
   *
   * @param id - Brand ID
   * @param data - Partial brand data to update
   * @returns Updated brand entity
   */
  async update(id: ID, data: BrandUpdateInput): Promise<Brand> {
    const result = await db
      .update(brands)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(brands.id, id))
      .returning();
    return this.mapToDomain(result[0]);
  }

  /**
   * Deletes a brand
   *
   * @param id - Brand ID
   */
  async delete(id: ID): Promise<void> {
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
