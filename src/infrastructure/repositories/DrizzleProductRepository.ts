import { db } from "@/infrastructure/config/database.config";
import {
  products,
  productTranslations,
  type Product as DbProduct,
  type ProductTranslation as DbTranslation,
} from "@/infrastructure/database/schema";
import { IProductRepository } from "@/application/repositories/IProductRepository";
import { Product } from "@/domain/entities/Product";
import { AdminProductInput } from "@/domain/types/admin";
import { eq, and, ilike, or, count as sqlCount } from "drizzle-orm";

/**
 *
 */
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

  /**
   *
   */
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
          eq(productTranslations.language, language),
        ),
      )
      .where(eq(products.id, id))
      .limit(1);

    if (result.length === 0) return null;

    return this.mapToDomain(result[0].product, result[0].translation || undefined);
  }

  /**
   *
   */
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
          eq(productTranslations.language, language),
        ),
      );

    return results.map(({ product, translation }) =>
      this.mapToDomain(product, translation || undefined),
    );
  }

  /**
   *
   */
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
          eq(productTranslations.language, language),
        ),
      )
      .where(eq(products.isNew, true))
      .limit(limit);

    return results.map(({ product, translation }) =>
      this.mapToDomain(product, translation || undefined),
    );
  }

  /**
   *
   */
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
          eq(productTranslations.language, language),
        ),
      )
      .where(eq(products.category, category));

    return results.map(({ product, translation }) =>
      this.mapToDomain(product, translation || undefined),
    );
  }

  /**
   *
   */
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
          eq(productTranslations.language, language),
        ),
      )
      .where(
        or(
          ilike(productTranslations.name, `%${query}%`),
          ilike(productTranslations.description, `%${query}%`),
        ),
      );

    return results.map(({ product, translation }) =>
      this.mapToDomain(product, translation || undefined),
    );
  }

  /**
   *
   */
  async create(input: AdminProductInput): Promise<Product> {
    return await db.transaction(async (tx) => {
      const [newProduct] = await tx
        .insert(products)
        .values({
          price: String(input.price),
          strikePrice: input.strikePrice ? String(input.strikePrice) : null,
          category: input.category,
          images: input.images || [],
          isNew: input.isNew || false,
          variants: input.variants || null,
        })
        .returning();

      if (input.translations && input.translations.length > 0) {
        await tx.insert(productTranslations).values(
          input.translations.map((t) => ({
            productId: newProduct.id,
            language: t.language,
            name: t.name,
            description: t.description,
            longDescription: t.longDescription,
          })),
        );
      }

      const firstTranslation = input.translations?.[0];
      return this.mapToDomain(
        newProduct,
        firstTranslation
          ? {
              productId: newProduct.id,
              language: firstTranslation.language,
              name: firstTranslation.name,
              description: firstTranslation.description,
              longDescription: firstTranslation.longDescription,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          : undefined,
      );
    });
  }

  /**
   *
   */
  async update(id: number, input: AdminProductInput): Promise<Product> {
    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(products)
        .set({
          price: String(input.price),
          strikePrice: input.strikePrice ? String(input.strikePrice) : null,
          category: input.category,
          images: input.images || [],
          isNew: input.isNew || false,
          variants: input.variants || null,
          updatedAt: new Date(),
        })
        .where(eq(products.id, id))
        .returning();

      // Delete existing translations and re-insert
      await tx.delete(productTranslations).where(eq(productTranslations.productId, id));

      if (input.translations && input.translations.length > 0) {
        await tx.insert(productTranslations).values(
          input.translations.map((t) => ({
            productId: id,
            language: t.language,
            name: t.name,
            description: t.description,
            longDescription: t.longDescription,
          })),
        );
      }

      const firstTranslation = input.translations?.[0];
      return this.mapToDomain(
        updated,
        firstTranslation
          ? {
              productId: id,
              language: firstTranslation.language,
              name: firstTranslation.name,
              description: firstTranslation.description,
              longDescription: firstTranslation.longDescription,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          : undefined,
      );
    });
  }

  /**
   *
   */
  async delete(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  /**
   *
   */
  async count(): Promise<number> {
    const result = await db.select({ value: sqlCount() }).from(products);
    return result[0]?.value || 0;
  }
}
