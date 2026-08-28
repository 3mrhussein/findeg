/**
 * Query Primitives for Products
 *
 * Pure database queries for product operations.
 * No ORM abstraction - direct Drizzle SQL operations.
 *
 * Note: Returns raw database rows. Domain mapping and hydration handled by ProductService.
 */

import { db } from '../../connection';
import {
    products,
    productVariants,
    brands,
    categories,
    tags,
    productTags,
    attributes as attributeTable,
    variantAttributes,
} from '../../schema';
import { eq, and, inArray, or, count, ilike, sql, asc, desc } from 'drizzle-orm';
import { TranslationMap, type ID } from '@findeg/db/types';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ProductRow = typeof products.$inferSelect;
export type VariantRow = typeof productVariants.$inferSelect;
export type BrandRow = typeof brands.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type TagRow = typeof tags.$inferSelect;

export interface ProductAttributeValueRow {
    attributeId: number;
    key: string;
    valueText?: string;
}

export interface ProductFiltersInput {
    isActive?: boolean;
    categoryId?: ID | number;
    brandId?: ID | number;
    offset?: number;
    limit?: number;
    sort?: string;
}

// ─── Single Product Queries ──────────────────────────────────────────────────

/**
 * Get product by ID
 */
export async function getById(id: number): Promise<ProductRow | null> {
    const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

    return product || null;
}

/**
 * Get product by slug
 */
export async function getBySlug(slug: string): Promise<ProductRow | null> {
    const [product] = await db
        .select()
        .from(products)
        .where(eq(products.slug, slug))
        .limit(1);

    return product || null;
}

// ─── Bulk Product Queries ────────────────────────────────────────────────────

/**
 * Get all products
 */
export async function getAll(): Promise<ProductRow[]> {
    return db
        .select()
        .from(products)
        .orderBy(asc(products.id));
}

/**
 * Get active featured products ordered by creation date
 */
export async function getFeatured(limit: number = 10): Promise<ProductRow[]> {
    return db
        .select()
        .from(products)
        .where(eq(products.isActive, true))
        .orderBy(desc(products.createdAt))
        .limit(limit);
}

/**
 * Search products by name using JSONB ILIKE
 * Supports language-specific search within localizedName JSONB field
 */
export async function search(query: string, language: string = 'en'): Promise<ProductRow[]> {
    return db
        .select()
        .from(products)
        .where(
            and(
                eq(products.isActive, true),
                sql`${products.localizedName}->>${language} ILIKE ${`%${query}%`}`,
            ),
        )
        .limit(20);
}

/**
 * Get all products in a category
 */
export async function getByCategory(categoryId: number): Promise<ProductRow[]> {
    return db
        .select()
        .from(products)
        .where(eq(products.categoryId, categoryId))
        .limit(50);
}

/**
 * Get all products by brand
 */
export async function getByBrand(brandId: number): Promise<ProductRow[]> {
    return db
        .select()
        .from(products)
        .where(eq(products.brandId, brandId))
        .limit(50);
}

/**
 * Get products with filtering, pagination, and count
 */
export async function getFiltered(
    filters: ProductFiltersInput,
): Promise<{ products: ProductRow[]; total: number }> {
    const conditions = [];

    if (filters.isActive !== undefined) {
        conditions.push(eq(products.isActive, filters.isActive));
    }
    if (filters.categoryId !== undefined) {
        conditions.push(eq(products.categoryId, Number(filters.categoryId)));
    }
    if (filters.brandId !== undefined) {
        conditions.push(eq(products.brandId, Number(filters.brandId)));
    }
    const where = and(...conditions);
    // Get total count
    const [{ count: totalCount }] = await db.select({ count: count() }).from(products).where(where);


    if (totalCount === 0) {
        return { products: [], total: 0 };
    }

    // Get paginated results
    const productsList = await db
        .select()
        .from(products)
        .where(where)
        .offset(filters.offset || 0)
        .limit(filters.limit || 20)
        .orderBy(desc(products.id));

    return {
        products: productsList,
        total: totalCount,
    };
}

/**
 * Get products by specific IDs (useful for search result hydration)
 */
export async function getByIds(ids: number[]): Promise<ProductRow[]> {
    if (ids.length === 0) return [];
    
    return db
        .select()
        .from(products)
        .where(inArray(products.id, ids));
}

/**
 * Count products with optional filtering
 */
export async function countProducts(filters?: ProductFiltersInput): Promise<number> {
    const conditions = [];

    if (filters?.isActive !== undefined) {
        conditions.push(eq(products.isActive, filters.isActive));
    }
    if (filters?.categoryId !== undefined) {
        conditions.push(eq(products.categoryId, Number(filters.categoryId)));
    }
    if (filters?.brandId !== undefined) {
        conditions.push(eq(products.brandId, Number(filters.brandId)));
    }

    const result = await db.select({ value: count() }).from(products).where(and(...conditions));
    return Number(result[0].value);
}

/**
 * Get low stock products (returns first 5 as placeholder)
 */
export async function getLowStockProducts(_threshold?: number): Promise<ProductRow[]> {
    return db.select().from(products).limit(5);
}

/**
 * Check if slug is available (not taken by another product)
 */
export async function checkSlugAvailable(slug: string, excludeId?: number): Promise<boolean> {
    const results = await db
        .select({ id: products.id })
        .from(products)
        .where(
            and(
                eq(products.slug, slug),
                excludeId ? sql`${products.id} != ${excludeId}` : sql`TRUE`,
            ),
        )
        .limit(1);

    return results.length === 0;
}

// ─── Variant Queries ─────────────────────────────────────────────────────────

/**
 * Get variants for multiple products
 * Returns map keyed by productId
 */
export async function getVariantsByProductIds(
    productIds: number[],
): Promise<Record<number, VariantRow[]>> {
    if (productIds.length === 0) return {};

    const rows = await db
        .select()
        .from(productVariants)
        .where(inArray(productVariants.productId, productIds));

    const map: Record<number, VariantRow[]> = {};
    for (const row of rows) {
        const pid = row.productId;
        if (!map[pid]) map[pid] = [];
        map[pid].push(row);
    }

    return map;
}

/**
 * Get variants by their IDs
 */
export async function getVariantsByIds(variantIds: number[]): Promise<VariantRow[]> {
    if (variantIds.length === 0) return [];

    return db
        .select()
        .from(productVariants)
        .where(inArray(productVariants.id, variantIds))
        .orderBy(asc(productVariants.sortOrder));
}

// ─── Tag Queries ─────────────────────────────────────────────────────────────

/**
 * Get all tags for a product
 */
export async function getProductTags(productId: number): Promise<TagRow[]> {
    const results = await db
        .select({ tag: tags })
        .from(productTags)
        .innerJoin(tags, eq(tags.id, productTags.tagId))
        .where(eq(productTags.productId, productId));

    return results.map((r) => r.tag);
}

/**
 * Get products by tag ID
 */
export async function getProductsByTag(tagId: number): Promise<ProductRow[]> {
    const results = await db
        .select({ product: products })
        .from(productTags)
        .innerJoin(products, eq(products.id, productTags.productId))
        .where(eq(productTags.tagId, tagId));

    return results.map((r) => r.product);
}

// ─── Attribute Queries ───────────────────────────────────────────────────────

/**
 * Get attributes for a product (from all variants)
 */
export async function getProductAttributes(productId: number): Promise<ProductAttributeValueRow[]> {
    const results = await db
        .select({
            attributeId: attributeTable.id,
            key: attributeTable.key,
            valueText: variantAttributes.valueText,
        })
        .from(variantAttributes)
        .innerJoin(attributeTable, eq(attributeTable.id, variantAttributes.attributeId))
        .innerJoin(productVariants, eq(productVariants.id, variantAttributes.variantId))
        .where(eq(productVariants.productId, productId));

    return results.map((r) => ({
        attributeId: r.attributeId,
        key: r.key,
        valueText: r.valueText || undefined,
    }));
}

// ─── Relationship Queries ────────────────────────────────────────────────────

/**
 * Get product with brand info
 */
export async function getByIdWithBrand(id: number): Promise<{ product: ProductRow; brand: BrandRow | null } | null> {
    const results = await db
        .select({ product: products, brand: brands })
        .from(products)
        .leftJoin(brands, eq(brands.id, products.brandId))
        .where(eq(products.id, id))
        .limit(1);

    return results[0];
}

/**
 * Get product with brand and category info
 */
export async function getByIdWithBrandAndCategory(
    id: number,
): Promise<{ product: ProductRow; brand: BrandRow | null; category: CategoryRow | null } | null> {
    const results = await db
        .select({ product: products, brand: brands, category: categories })
        .from(products)
        .leftJoin(brands, eq(brands.id, products.brandId))
        .leftJoin(categories, eq(categories.id, products.categoryId))
        .where(eq(products.id, id))
        .limit(1);

    return results.length === 0 ? null : results[0] as any;
}

/**
 * Get all products with brand info
 */
export async function getAllWithBrandAndCategory(): Promise<
    { product: ProductRow; brand: BrandRow | null; category: CategoryRow | null }[]
> {
    return db
        .select({ product: products, brand: brands, category: categories })
        .from(products)
        .leftJoin(brands, eq(brands.id, products.brandId))
        .leftJoin(categories, eq(categories.id, products.categoryId))
        .orderBy(asc(products.id));
}

// ─── Write Operations ────────────────────────────────────────────────────────

export interface CreateProductInput {
    slug?: string;
    isActive?: boolean;
    categoryId?: number;
    brandId?: number;
    localizedName: TranslationMap;
    localizedDescription: TranslationMap;
    localizedLongDescription: TranslationMap;
}

/**
 * Create a new product
 */
export async function create(input: CreateProductInput): Promise<ProductRow> {
    const [result] = await db.insert(products).values(input).returning();

    return result;
}

export interface UpdateProductInput {
    isActive?: boolean;
    categoryId?: number | null;
    brandId?: number | null;
    slug?: string;
    localizedName?: TranslationMap;
    localizedDescription?: TranslationMap;
    localizedLongDescription?: TranslationMap;
}

/**
 * Update a product
 */
export async function update(id: number, input: UpdateProductInput): Promise<ProductRow | null> {
    const updates: Partial<ProductRow> = { ...input, updatedAt: new Date() };
    const result = await db.update(products).set(updates).where(eq(products.id, id)).returning();

    return result.length === 0 ? null : result[0];
}

/**
 * Delete a product
 */
export async function deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
}
