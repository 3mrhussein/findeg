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
import type { IProductRepository } from "@/application/repositories/IProductRepository";
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
    const [newProduct] = await db
      .insert(products)
      .values({
        price: input.price.toString(),
        category: input.category,
        images: input.images,
        isNew: input.isNew,
        reviewsCount: 0,
        rating: "0",
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
        category: input.category,
        images: input.images,
        isNew: input.isNew,
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
   * @param category - Category slug
   * @param language - Optional language override
   */
  async getByCategory(category: string, language?: string): Promise<Product[]> {
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
      .where(eq(products.category, category))
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
      category: dbProduct.category,
      images,
      isNew: dbProduct.isNew || false,
      rating,
      reviewsCount: dbProduct.reviewsCount || 0,
      variants: variants || undefined,
    };
  }
}
