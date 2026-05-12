/**
 * Query Primitives for Brands
 *
 * Pure database queries for brand management.
 * No ORM abstraction - direct Drizzle SQL operations.
 * 
 * Note: Returns raw database rows. Domain mapping (i18n) handled by BrandService.
 */

import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../../connection';
import { brands, products } from '../../schema';

// ─── Types ───────────────────────────────────────────────────────────────────

export type BrandRow = typeof brands.$inferSelect;

export interface BrandWithProductCount extends BrandRow {
  productCount?: number;
}

export interface BrandCreateInput {
  slug: string;
  logoUrl?: string | null;
  isActive?: boolean;
  localizedName: Record<string, string>;
  localizedDescription?: Record<string, string> | null;
}

export interface BrandUpdateInput {
  slug?: string;
  logoUrl?: string | null;
  isActive?: boolean;
  localizedName?: Record<string, string>;
  localizedDescription?: Record<string, string> | null;
}

// ─── Query Functions ─────────────────────────────────────────────────────────

export async function getAll(): Promise<BrandWithProductCount[]> {
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

  return dbBrands.map(({ brand, productCount }) => ({
    ...brand,
    productCount,
  }));
}

export async function getById(id: number): Promise<BrandRow | null> {
  const result = await db.select().from(brands).where(eq(brands.id, id));
  return result[0] || null;
}

export async function getBySlug(slug: string): Promise<BrandRow | null> {
  const result = await db.select().from(brands).where(eq(brands.slug, slug));
  return result[0] || null;
}

export async function create(data: BrandCreateInput): Promise<BrandRow> {
  const result = await db
    .insert(brands)
    .values({
      slug: data.slug,
      logoUrl: data.logoUrl || null,
      isActive: data.isActive ?? true,
      localizedName: data.localizedName,
      localizedDescription: data.localizedDescription || null,
    })
    .returning();
  return result[0];
}

export async function update(id: number, data: BrandUpdateInput): Promise<BrandRow> {
  const updatePayload: Partial<typeof brands.$inferInsert> = {
    slug: data.slug,
    logoUrl: data.logoUrl,
    isActive: data.isActive,
    localizedName: data.localizedName,
    localizedDescription: data.localizedDescription,
    updatedAt: new Date(),
  };

  const result = await db.update(brands).set(updatePayload).where(eq(brands.id, id)).returning();
  return result[0];
}

export async function deleteById(id: number): Promise<void> {
  await db.delete(brands).where(eq(brands.id, id));
}

export async function count(): Promise<number> {
  const result = await db.select({ count: sql<number>`count(*)` }).from(brands);
  return result[0]?.count ?? 0;
}

export async function countProductsByBrandId(id: number): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.brandId, id));
  return result[0]?.count ?? 0;
}
