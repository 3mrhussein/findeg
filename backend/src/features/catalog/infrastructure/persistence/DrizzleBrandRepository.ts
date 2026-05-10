import { eq, desc, sql } from 'drizzle-orm';
import { ID, Slug } from '../../../core/domain/types/common';
import { db } from '@findeg/db/connection';
import { brands, products } from '@findeg/db/schema';
import {
  IBrandRepository,
  BrandCreateInput,
  BrandUpdateInput,
} from '../../application/interfaces/IBrandRepository';
import { Brand } from '../../domain/entities/Brand';
import { DEFAULT_LOCALE, asTranslationMap, type Locale, pick } from '../../../core/domain/value-objects';

type DbBrand = typeof brands.$inferSelect;

/**
 * Drizzle Brand Repository
 *
 * PostgreSQL implementation of brand management using Drizzle ORM.
 */
export class DrizzleBrandRepository implements IBrandRepository {
  private mapToDomain(dbBrand: DbBrand, language: Locale = DEFAULT_LOCALE): Brand {
    const localizedName = asTranslationMap(dbBrand.localizedName);
    const localizedDescription = asTranslationMap(dbBrand.localizedDescription || {});

    return {
      id: dbBrand.id,
      slug: dbBrand.slug as Slug,
      localizedName,
      localizedDescription,
      name: pick(localizedName, language),
      description: pick(localizedDescription, language),
      locale: language,
      logoUrl: dbBrand.logoUrl,
      isActive: dbBrand.isActive,
      productCount: (dbBrand as any).productCount as number | undefined,
      createdAt: dbBrand.createdAt,
      updatedAt: dbBrand.updatedAt,
    };
  }

  async getAll(_activeOnly: boolean = false, language: Locale = DEFAULT_LOCALE): Promise<Brand[]> {
    // Subquery for product count
    const productCountSubquery = db
      .select({
        brandId: products.brandId,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(products)
      .groupBy(products.brandId)
      .as('pc');

    const dbBrands = await db
      .select({
        brand: brands,
        productCount: sql<number>`COALESCE(${productCountSubquery.count}, 0)`,
      })
      .from(brands)
      .leftJoin(productCountSubquery, eq(brands.id, productCountSubquery.brandId))
      .orderBy(desc(brands.createdAt));

    return dbBrands.map(({ brand, productCount }) =>
      this.mapToDomain({ ...brand, productCount } as any, language),
    );
  }

  async getById(id: ID, language: Locale = DEFAULT_LOCALE): Promise<Brand | null> {
    const result = await db.select().from(brands).where(eq(brands.id, id));
    return result[0] ? this.mapToDomain(result[0], language) : null;
  }

  async getBySlug(slug: Slug, language: Locale = DEFAULT_LOCALE): Promise<Brand | null> {
    const result = await db.select().from(brands).where(eq(brands.slug, slug));
    return result[0] ? this.mapToDomain(result[0], language) : null;
  }

  async create(data: BrandCreateInput): Promise<Brand> {
    const result = await db
      .insert(brands)
      .values({
        slug: data.slug,
        logoUrl: data.logoUrl,
        isActive: data.isActive ?? true,
        localizedName: data.localizedName,
        localizedDescription: data.localizedDescription || null,
      })
      .returning();
    return this.mapToDomain(result[0]);
  }

  async update(id: ID, data: BrandUpdateInput): Promise<Brand> {
    const updatePayload: Partial<typeof brands.$inferInsert> = {
      slug: data.slug,
      logoUrl: data.logoUrl,
      isActive: data.isActive,
      localizedName: data.localizedName,
      localizedDescription: data.localizedDescription,
      updatedAt: new Date(),
    };

    const result = await db.update(brands).set(updatePayload).where(eq(brands.id, id)).returning();
    return this.mapToDomain(result[0]);
  }

  async delete(id: ID): Promise<void> {
    await db.delete(brands).where(eq(brands.id, id));
  }

  async count(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(brands);
    return result[0]?.count ?? 0;
  }

  async countProductsByBrandId(id: ID): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.brandId, id as number));
    return result[0]?.count ?? 0;
  }
}
