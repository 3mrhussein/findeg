import { eq, desc, or, sql } from "drizzle-orm";
import { ID, Slug } from "@/features/core/domain/types/common";
import { db } from "@/features/core/infrastructure/persistence";
import { brands } from "@/features/core/infrastructure/persistence/schema";
import {
  IBrandRepository,
  BrandCreateInput,
  BrandUpdateInput,
} from "../../application/interfaces/IBrandRepository";
import { Brand } from "../../domain/entities/Brand";
import {
  DEFAULT_LOCALE,
  resolveLocalizedString,
  toLocalizedString,
  type Locale,
} from "@/features/core/domain/value-objects";

type DbBrand = typeof brands.$inferSelect;

/**
 * Drizzle Brand Repository
 *
 * PostgreSQL implementation of brand management using Drizzle ORM.
 * Results for list queries are ordered by creation date descending.
 */
export class DrizzleBrandRepository implements IBrandRepository {
  private mapToDomain(dbBrand: DbBrand): Brand {
    const localizedNameDraft = (dbBrand.localizedName || {}) as Record<string, string>;
    const localizedContent = {
      name: toLocalizedString(
        Object.keys(localizedNameDraft).length > 0
          ? localizedNameDraft
          : { en: dbBrand.name, ar: dbBrand.name },
        dbBrand.name,
      ),
    };

    return {
      id: dbBrand.id,
      slug: dbBrand.slug as Slug,
      name: localizedContent.name?.en ?? dbBrand.name,
      locale: undefined,
      localizedContent,
      logoUrl: dbBrand.logoUrl,
      isActive: dbBrand.isActive,
      createdAt: dbBrand.createdAt,
      updatedAt: dbBrand.updatedAt,
    };
  }

  async getAll(activeOnly: boolean = false, language: Locale = DEFAULT_LOCALE): Promise<Brand[]> {
    const whereClause = activeOnly ? eq(brands.isActive, true) : undefined;
    const dbBrands = await db
      .select()
      .from(brands)
      .where(whereClause)
      .orderBy(desc(brands.createdAt));
    return dbBrands.map((brand) => this.mapToDomain(brand));
  }

  async getById(id: ID, language: Locale = DEFAULT_LOCALE): Promise<Brand | null> {
    const result = await db.select().from(brands).where(eq(brands.id, id));
    return result[0] ? this.mapToDomain(result[0]) : null;
  }

  async getBySlug(slug: Slug, language: Locale = DEFAULT_LOCALE): Promise<Brand | null> {
    const result = await db.select().from(brands).where(eq(brands.slug, slug));
    return result[0] ? this.mapToDomain(result[0]) : null;
  }

  async create(data: BrandCreateInput): Promise<Brand> {
    const result = await db
      .insert(brands)
      .values({
        ...data,
        localizedName: { en: data.name, ar: data.name },
      })
      .returning();
    return this.mapToDomain(result[0]);
  }

  async update(id: ID, data: BrandUpdateInput): Promise<Brand> {
    const localizedName = data.name ? { en: data.name, ar: data.name } : undefined;

    const result = await db
      .update(brands)
      .set({
        ...data,
        localizedName,
        updatedAt: new Date(),
      })
      .where(eq(brands.id, id))
      .returning();
    return this.mapToDomain(result[0]);
  }

  async delete(id: ID): Promise<void> {
    await db.delete(brands).where(eq(brands.id, id));
  }

  async count(): Promise<number> {
    const result = await db.select({ count: brands.id }).from(brands);
    return result.length;
  }
}
