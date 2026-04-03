import { eq, desc, or, sql } from "drizzle-orm";
import { ID, Slug } from "@/features/core/domain/types/common";
import { db } from "@/features/core/infrastructure/persistence";
import { brands, products } from "@/features/core/infrastructure/persistence/schema";
import {
  IBrandRepository,
  BrandCreateInput,
  BrandUpdateInput,
} from "../../application/interfaces/IBrandRepository";
import { Brand } from "../../domain/entities/Brand";
import {
  DEFAULT_LOCALE,
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
    const localizedDescDraft = (dbBrand.localizedDescription || {}) as Record<string, string>;

    const localizedContent = {
      name: toLocalizedString(
        Object.keys(localizedNameDraft).length > 0
          ? localizedNameDraft
          : { en: dbBrand.name, ar: dbBrand.name },
        dbBrand.name,
      ),
      description: toLocalizedString(localizedDescDraft, ""),
    };

    return {
      id: dbBrand.id,
      slug: dbBrand.slug as Slug,
      name: localizedContent.name?.en ?? dbBrand.name,
      locale: undefined,
      localizedContent,
      logoUrl: dbBrand.logoUrl,
      productCount: (dbBrand as any).productCount, // If fetched via JOIN
      isActive: dbBrand.isActive,
      createdAt: dbBrand.createdAt,
      updatedAt: dbBrand.updatedAt,
    };
  }

  async getAll(activeOnly: boolean = false, language: Locale = DEFAULT_LOCALE): Promise<Brand[]> {
    const whereClause = activeOnly ? eq(brands.isActive, true) : undefined;

    // Subquery for product count
    const productCountSubquery = db
      .select({
        brandId: products.brandId,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(products)
      .groupBy(products.brandId)
      .as("pc");

    const dbBrands = await db
      .select({
        brand: brands,
        productCount: sql<number>`COALESCE(${productCountSubquery.count}, 0)`,
      })
      .from(brands)
      .leftJoin(productCountSubquery, eq(brands.id, productCountSubquery.brandId))
      .where(whereClause)
      .orderBy(desc(brands.createdAt));

    return dbBrands.map(({ brand, productCount }) =>
      this.mapToDomain({ ...brand, productCount } as any),
    );
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
        slug: data.slug,
        name: data.name,
        logoUrl: data.logoUrl,
        isActive: data.isActive,
        localizedName: data.localizedName || { en: data.name, ar: data.name },
        localizedDescription: data.localizedDescription || {},
      })
      .returning();
    return this.mapToDomain(result[0]);
  }

  async update(id: ID, data: BrandUpdateInput): Promise<Brand> {
    const updatePayload: Partial<typeof brands.$inferInsert> = {
      ...data,
      updatedAt: new Date(),
    };

    // Handle localizedName:
    // If data.localizedName is provided, use it directly.
    // If data.name is provided but data.localizedName is not, create a default localizedName.
    // If neither is provided, don't update localizedName.
    if (data.localizedName !== undefined) {
      updatePayload.localizedName = data.localizedName;
    } else if (data.name !== undefined) {
      updatePayload.localizedName = { en: data.name, ar: data.name };
    }

    // Handle localizedDescription:
    // If data.localizedDescription is provided, use it directly.
    if (data.localizedDescription !== undefined) {
      updatePayload.localizedDescription = data.localizedDescription;
    }

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
