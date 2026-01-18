import { db } from "@/infrastructure/config/database.config";
import { products, productTranslations, type Product as DbProduct, type ProductTranslation as DbTranslation } from "@/infrastructure/database/schema";
import { IProductRepository } from "@/application/repositories/IProductRepository";
import { Product } from "@/domain/entities/Product";
import { eq, and, ilike, or } from "drizzle-orm";

export class DrizzleProductRepository implements IProductRepository {
  /**
   * Map database result to domain Product entity
   */
  private mapToDomain(dbProduct: DbProduct, translation?: DbTranslation): Product {
    return {
      id: dbProduct.id,
      name: translation?.name || "Untitled Product",
      price: Number(dbProduct.price),
      strikePrice: dbProduct.strikePrice ? Number(dbProduct.strikePrice) : undefined,
      description: translation?.description || "",
      longDescription: translation?.longDescription || "",
      images: (dbProduct.images as string[]) || [],
      category: dbProduct.category,
      isNew: dbProduct.isNew || false,
      rating: Number(dbProduct.rating || 0),
      reviewsCount: dbProduct.reviewsCount || 0,
      variants: dbProduct.variants as any,
    };
  }

  async getById(id: number, language: string = "en"): Promise<Product | null> {
    const result = await db
      .select({
        product: products,
        translation: productTranslations,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(
          eq(productTranslations.productId, products.id),
          eq(productTranslations.language, language)
        )
      )
      .where(eq(products.id, id))
      .limit(1);

    if (result.length === 0) return null;

    return this.mapToDomain(result[0].product, result[0].translation || undefined);
  }

  async getAll(language: string = "en"): Promise<Product[]> {
    const results = await db
      .select({
        product: products,
        translation: productTranslations,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(
          eq(productTranslations.productId, products.id),
          eq(productTranslations.language, language)
        )
      );

    return results.map(({ product, translation }) => this.mapToDomain(product, translation || undefined));
  }

  async getFeatured(limit: number = 10, language: string = "en"): Promise<Product[]> {
    const results = await db
      .select({
        product: products,
        translation: productTranslations,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(
          eq(productTranslations.productId, products.id),
          eq(productTranslations.language, language)
        )
      )
      .where(eq(products.isNew, true))
      .limit(limit);

    return results.map(({ product, translation }) => this.mapToDomain(product, translation || undefined));
  }

  async getByCategory(category: string, language: string = "en"): Promise<Product[]> {
    const results = await db
      .select({
        product: products,
        translation: productTranslations,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(
          eq(productTranslations.productId, products.id),
          eq(productTranslations.language, language)
        )
      )
      .where(eq(products.category, category));

    return results.map(({ product, translation }) => this.mapToDomain(product, translation || undefined));
  }

  async search(query: string, language: string = "en"): Promise<Product[]> {
    const results = await db
      .select({
        product: products,
        translation: productTranslations,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(
          eq(productTranslations.productId, products.id),
          eq(productTranslations.language, language)
        )
      )
      .where(
        or(
          ilike(productTranslations.name, `%${query}%`),
          ilike(productTranslations.description, `%${query}%`)
        )
      );

    return results.map(({ product, translation }) => this.mapToDomain(product, translation || undefined));
  }
}
