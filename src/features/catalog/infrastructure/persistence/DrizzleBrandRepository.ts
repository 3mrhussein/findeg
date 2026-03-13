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
  private mapToDomain(dbBrand: DbBrand, language: Locale = DEFAULT_LOCALE): Brand {
    const localizedSlugDraft = (dbBrand.localizedSlug || {}) as Record<string, string>;
    const localizedNameDraft = (dbBrand.localizedName || {}) as Record<string, string>;
    const localizedContent = {
      slug: toLocalizedString(
        Object.keys(localizedSlugDraft).length > 0
          ? localizedSlugDraft
          : { en: dbBrand.slug, ar: dbBrand.slug },
        dbBrand.slug,
      ),
      name: toLocalizedString(
        Object.keys(localizedNameDraft).length > 0
          ? localizedNameDraft
          : { en: dbBrand.name, ar: dbBrand.name },
        dbBrand.name,
      ),
    };

    return {
      id: dbBrand.id,
      slug: resolveLocalizedString(localizedContent.slug, language, DEFAULT_LOCALE) as Slug,
      name: resolveLocalizedString(localizedContent.name, language, DEFAULT_LOCALE),
      locale: language,
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
    return dbBrands.map((brand) => this.mapToDomain(brand, language));
  }

  async getById(id: ID, language: Locale = DEFAULT_LOCALE): Promise<Brand | null> {
    const result = await db.select().from(brands).where(eq(brands.id, id));
    return result[0] ? this.mapToDomain(result[0], language) : null;
  }

  async getBySlug(slug: Slug, language: Locale = DEFAULT_LOCALE): Promise<Brand | null> {
    const result = await db
      .select()
      .from(brands)
      .where(or(eq(brands.slug, slug), sql`${brands.localizedSlug} ->> ${language} = ${slug}`));
    return result[0] ? this.mapToDomain(result[0], language) : null;
  }

  async create(data: BrandCreateInput): Promise<Brand> {
    const result = await db
      .insert(brands)
      .values({
        ...data,
        localizedSlug: { en: data.slug, ar: data.slug },
        localizedName: { en: data.name, ar: data.name },
      })
      .returning();
    return this.mapToDomain(result[0], DEFAULT_LOCALE);
  }

  async update(id: ID, data: BrandUpdateInput): Promise<Brand> {
    const localizedSlug = data.slug ? { en: data.slug, ar: data.slug } : undefined;
    const localizedName = data.name ? { en: data.name, ar: data.name } : undefined;

    const result = await db
      .update(brands)
      .set({
        ...data,
        localizedSlug,
        localizedName,
        updatedAt: new Date(),
      })
      .where(eq(brands.id, id))
      .returning();
    return this.mapToDomain(result[0], DEFAULT_LOCALE);
  }

  async delete(id: ID): Promise<void> {
    await db.delete(brands).where(eq(brands.id, id));
  }

  async count(): Promise<number> {
    const result = await db.select({ count: brands.id }).from(brands);
    return result.length;
  }
}
