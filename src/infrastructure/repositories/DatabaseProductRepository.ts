/**
 * Infrastructure Layer: Database Product Repository
 *
 * This is a concrete implementation of IProductRepository using Drizzle ORM and PostgreSQL.
 * It handles:
 * - Querying products from the database
 * - Loading translations for products
 * - Mapping database models to domain entities
 *
 * The Application layer doesn't know this is using a database.
 */

import { db } from "../config/database.config";
import { products, productTranslations } from "../database/schema/products";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { IProductRepository, ProductFilters } from "@/application/repositories/IProductRepository";
import type { Product } from "@/domain/entities/Product";

// Type for query result row
type ProductQueryResult = {
  product: typeof products.$inferSelect;
  translation: typeof productTranslations.$inferSelect | null;
};

import { sql } from "drizzle-orm";
import { AdminProductInput } from "@/domain/types/admin";

/**
 *
 */
export class DatabaseProductRepository implements IProductRepository {
  /**
   * Create a new product
   */
  async create(input: AdminProductInput): Promise<Product> {
    const defaultLang = "en";
    const [newProduct] = await db
      .insert(products)
      .values({
        price: input.price.toString(),
        strikePrice: input.strikePrice ? input.strikePrice.toString() : null,
        categoryId: input.categoryId,
        images: input.images,
        isNew: input.isNew,
        reviewsCount: 0,
        rating: "0",
        sku: input.sku,
        stockQuantity: input.stockQuantity,
        brandId: input.brandId,
        isActive: input.isActive,
      })
      .returning();

    if (input.translations && input.translations.length > 0) {
      await db.insert(productTranslations).values(
        input.translations.map((t) => ({
          productId: newProduct.id,
          language: t.language,
          name: t.name,
          description: t.description,
          longDescription: t.longDescription || t.description,
        })),
      );
    }

    return this.getById(newProduct.id, this.defaultLanguage) as Promise<Product>;
  }

  /**
   * Update an existing product
   */
  async update(id: number, input: AdminProductInput): Promise<Product> {
    await db
      .update(products)
      .set({
        price: input.price.toString(),
        strikePrice: input.strikePrice ? input.strikePrice.toString() : null,
        categoryId: input.categoryId,
        images: input.images,
        isNew: input.isNew,
        sku: input.sku,
        stockQuantity: input.stockQuantity,
        brandId: input.brandId,
        isActive: input.isActive,
      })
      .where(eq(products.id, id));

    // Handle translations update (delete all and re-insert for simplicity, or upsert)
    // For MVP, we'll delete and re-insert
    if (input.translations && input.translations.length > 0) {
      await db.delete(productTranslations).where(eq(productTranslations.productId, id));

      await db.insert(productTranslations).values(
        input.translations.map((t) => ({
          productId: id,
          language: t.language,
          name: t.name,
          description: t.description,
          longDescription: t.longDescription || t.description,
        })),
      );
    }

    return this.getById(id, this.defaultLanguage) as Promise<Product>;
  }

  /**
   * Delete a product
   */
  async delete(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  /**
   * Count total products
   */
  async count(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(products);
    return Number(result[0].count);
  }

  /**
   *
   */
  async getByIdWithTranslations(id: number): Promise<(AdminProductInput & { id: number }) | null> {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        translations: true,
      },
    });

    if (!product) return null;

    return {
      id: product.id,
      price: Number(product.price),
      strikePrice: product.strikePrice ? Number(product.strikePrice) : undefined,
      categoryId: product.categoryId || undefined,
      images: (product.images as string[]) || [],
      isNew: product.isNew || false,
      sku: product.sku || undefined,
      stockQuantity: product.stockQuantity || 0,
      brandId: product.brandId || undefined,
      isActive: product.isActive ?? true,
      variants: (product.variants as Record<string, any>) || undefined,
      translations: product.translations.map((t) => ({
        language: t.language,
        name: t.name,
        description: t.description,
        longDescription: t.longDescription || "",
      })),
    };
  }

  /**
   * Default language for translations (can be made configurable)
   */
  private defaultLanguage: string = "en";

  /**
   * Set the language for translations
   */
  setLanguage(language: string): void {
    this.defaultLanguage = language;
  }

  /**
   * Get all products
   *
   * @param language - Optional language override
   */
  async getAll(language?: string): Promise<Product[]> {
    const lang = language || this.defaultLanguage;
    const result = await db
      .select({
        product: products,
        translation: productTranslations,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(eq(productTranslations.productId, products.id), eq(productTranslations.language, lang)),
      )
      .orderBy(desc(products.createdAt));

    return result.map((row: ProductQueryResult) => this.mapToDomain(row.product, row.translation));
  }

  /**
   * Get product by ID
   *
   * @param id - Product ID
   * @param language - Optional language override
   */
  async getById(id: number, language?: string): Promise<Product | null> {
    const lang = language || this.defaultLanguage;
    const result = await db
      .select({
        product: products,
        translation: productTranslations,
        // We could also join category name here if needed, but for now we follow simple mapping
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(eq(productTranslations.productId, products.id), eq(productTranslations.language, lang)),
      )
      .where(eq(products.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToDomain(result[0].product, result[0].translation);
  }

  /**
   * Search products by query
   *
   * @param query - Search query
   * @param language - Optional language override
   */
  async search(query: string, language?: string): Promise<Product[]> {
    const lang = language || this.defaultLanguage;
    const searchTerm = `%${query}%`;

    const result = await db
      .select({
        product: products,
        translation: productTranslations,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(eq(productTranslations.productId, products.id), eq(productTranslations.language, lang)),
      )
      .where(
        or(
          ilike(productTranslations.name, searchTerm),
          ilike(productTranslations.description, searchTerm),
          ilike(productTranslations.longDescription, searchTerm),
        ),
      )
      .orderBy(desc(products.createdAt));

    return result.map((row: ProductQueryResult) => this.mapToDomain(row.product, row.translation));
  }

  /**
   * Get products by category
   *
   * @param categoryId - Category ID
   * @param language - Optional language override
   */
  async getByCategory(categoryId: number, language?: string): Promise<Product[]> {
    const lang = language || this.defaultLanguage;
    const result = await db
      .select({
        product: products,
        translation: productTranslations,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(eq(productTranslations.productId, products.id), eq(productTranslations.language, lang)),
      )
      .where(eq(products.categoryId, categoryId))
      .orderBy(desc(products.createdAt));

    return result.map((row: ProductQueryResult) => this.mapToDomain(row.product, row.translation));
  }

  /**
   * Get featured products
   *
   * @param limit - Maximum number of products
   * @param language - Optional language override
   */
  async getFeatured(limit: number = 8, language?: string): Promise<Product[]> {
    const lang = language || this.defaultLanguage;
    const result = await db
      .select({
        product: products,
        translation: productTranslations,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(eq(productTranslations.productId, products.id), eq(productTranslations.language, lang)),
      )
      .where(eq(products.isNew, true))
      .orderBy(desc(products.createdAt))
      .limit(limit);

    return result.map((row: ProductQueryResult) => this.mapToDomain(row.product, row.translation));
  }

  /**
   * Get products by brand
   */
  async getByBrand(brandId: number, language?: string): Promise<Product[]> {
    const lang = language || this.defaultLanguage;
    const result = await db
      .select({
        product: products,
        translation: productTranslations,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(eq(productTranslations.productId, products.id), eq(productTranslations.language, lang)),
      )
      .where(eq(products.brandId, brandId))
      .orderBy(desc(products.createdAt));

    return result.map((row: ProductQueryResult) => this.mapToDomain(row.product, row.translation));
  }

  /**
   * Get filtered products
   */
  async getFiltered(
    filters: ProductFilters,
    language?: string,
  ): Promise<{ products: Product[]; total: number }> {
    const lang = language || this.defaultLanguage;

    // Build where clause
    const conditions = [];

    if (filters.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }

    if (filters.brandId) {
      conditions.push(eq(products.brandId, filters.brandId));
    }

    if (filters.minPrice !== undefined) {
      conditions.push(sql`${products.price} >= ${filters.minPrice}`);
    }

    if (filters.maxPrice !== undefined) {
      conditions.push(sql`${products.price} <= ${filters.maxPrice}`);
    }

    if (filters.isNew !== undefined) {
      conditions.push(eq(products.isNew, filters.isNew));
    }

    if (filters.isActive !== undefined) {
      conditions.push(eq(products.isActive, filters.isActive));
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(productTranslations.name, searchTerm),
          ilike(productTranslations.description, searchTerm),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .leftJoin(
        productTranslations,
        and(eq(productTranslations.productId, products.id), eq(productTranslations.language, lang)),
      )
      .where(whereClause);

    const total = Number(countResult[0].count);

    // Get products
    const page = filters.page || 1; // Default to 1
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    // Handle offset if provided directly
    const finalOffset = filters.offset !== undefined ? filters.offset : offset;

    const result = await db
      .select({
        product: products,
        translation: productTranslations,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(eq(productTranslations.productId, products.id), eq(productTranslations.language, lang)),
      )
      .where(whereClause)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(finalOffset);

    return {
      products: result.map((row: ProductQueryResult) =>
        this.mapToDomain(row.product, row.translation),
      ),
      total,
    };
  }

  /**
   * Get low stock products
   */
  async getLowStock(threshold: number = 10, language?: string): Promise<Product[]> {
    const lang = language || this.defaultLanguage;
    const result = await db
      .select({
        product: products,
        translation: productTranslations,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(eq(productTranslations.productId, products.id), eq(productTranslations.language, lang)),
      )
      .where(sql`${products.stockQuantity} <= ${threshold}`)
      .orderBy(products.stockQuantity);

    return result.map((row: ProductQueryResult) => this.mapToDomain(row.product, row.translation));
  }

  /**
   * Update stock quantity
   */
  async updateStock(id: number, quantity: number): Promise<void> {
    await db.update(products).set({ stockQuantity: quantity }).where(eq(products.id, id));
  }

  /**
   * Updates both stock quantity and low stock threshold for a product
   *
   * @param id - Product ID
   * @param config - New quantity and optional low stock threshold
   */
  async updateStockConfiguration(
    id: number,
    config: { quantity: number; lowStockThreshold?: number },
  ): Promise<void> {
    const data: any = {
      stockQuantity: config.quantity,
    };
    if (config.lowStockThreshold !== undefined) {
      data.lowStockThreshold = config.lowStockThreshold;
    }
    await db.update(products).set(data).where(eq(products.id, id));
  }

  /**
   * Bulk update stock
   */
  async bulkUpdateStock(updates: { id: number; quantity: number }[]): Promise<void> {
    await db.transaction(async (tx) => {
      for (const update of updates) {
        await tx
          .update(products)
          .set({ stockQuantity: update.quantity })
          .where(eq(products.id, update.id));
      }
    });
  }

  /**
   * Map database model to domain entity
   *
   * This is a crucial method that converts infrastructure models
   * to domain entities. It ensures the domain layer stays pure.
   *
   * @param dbProduct - Database product model
   * @param translation - Product translation (optional, falls back to base product)
   * @returns Domain Product entity
   */
  private mapToDomain(
    dbProduct: typeof products.$inferSelect,
    translation: typeof productTranslations.$inferSelect | null,
  ): Product {
    // Convert decimal to number
    const price = parseFloat(dbProduct.price);
    const strikePrice = dbProduct.strikePrice ? parseFloat(dbProduct.strikePrice) : undefined;
    const rating = parseFloat(dbProduct.rating || "0");

    // Parse JSON fields
    const images = (dbProduct.images as string[]) || [];
    const variants = dbProduct.variants as Record<string, any> | null;

    return {
      id: dbProduct.id,
      // Use translation if available, otherwise fallback (though translations should always exist)
      name: translation?.name || `Product ${dbProduct.id}`,
      description: translation?.description || "",
      longDescription: translation?.longDescription || translation?.description || "",
      price,
      strikePrice,
      categoryId: dbProduct.categoryId || undefined,
      categoryName: "", // We don't have category name here, would need join
      images,
      isNew: dbProduct.isNew || false,
      rating,
      reviewsCount: dbProduct.reviewsCount || 0,
      variants: variants || undefined,
      sku: dbProduct.sku || undefined,
      stockQuantity: dbProduct.stockQuantity || 0,
      brandId: dbProduct.brandId || undefined,
      isActive: dbProduct.isActive ?? true,
    };
  }
}
