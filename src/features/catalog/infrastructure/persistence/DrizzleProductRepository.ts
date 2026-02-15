import { db } from "@/features/core/infrastructure/persistence";
import {
  products,
  productTranslations,
  categories,
  categoryTranslations,
  brands,
  productImages,
  type Product as DbProduct,
  type ProductTranslation as DbTranslation,
  type Brand as DbBrand,
  type Category as DbCategory,
  type CategoryTranslation as DbCategoryTranslation,
} from "@/features/core/infrastructure/persistence/schema";
import {
  IProductRepository,
  ProductFilters,
} from "../../application/interfaces/IProductRepository";
import { Product, ProductVariant } from "../../domain/entities/Product";
import { ProductInput } from "@/features/administration/domain/types";
import {
  eq,
  and,
  ilike,
  or,
  count as sqlCount,
  desc,
  asc,
  lte,
  inArray,
  gte,
  sql,
} from "drizzle-orm";

/**
 * Drizzle Product Repository
 *
 * PostgreSQL implementation of product catalog management using Drizzle ORM.
 * Handles product CRUD, search, filtering, inventory tracking, and multi-language support.
 * Implements complex queries for featured products, category/brand filtering, and low stock alerts.
 */
export class DrizzleProductRepository implements IProductRepository {
  /**
   * Map database result to domain Product entity
   */
  private mapToDomain(
    dbProduct: DbProduct,
    translation?: DbTranslation,
    categoryName?: string,
    brandName?: string,
    images?: string[],
  ): Product {
    // If we have normalized images, use them. Otherwise fallback to JSON images
    const finalImages = images && images.length > 0 ? images : (dbProduct.images as string[]) || [];

    return {
      id: dbProduct.id,
      sku: dbProduct.sku || undefined,
      name: translation?.name || "Untitled Product",
      price: Number(dbProduct.price),
      strikePrice: dbProduct.strikePrice ? Number(dbProduct.strikePrice) : undefined,
      description: translation?.description || "",
      longDescription: translation?.longDescription || "",
      imageUrl: finalImages[0],
      images: finalImages,
      categoryId: dbProduct.categoryId || undefined,
      categoryName: categoryName,
      brandId: dbProduct.brandId || undefined,
      brandName: brandName,
      isNew: dbProduct.isNew || false,
      isActive: dbProduct.isActive,
      stockQuantity: dbProduct.stockQuantity,
      lowStockThreshold: dbProduct.lowStockThreshold,
      rating: Number(dbProduct.rating || 0),
      reviewsCount: dbProduct.reviewsCount || 0,
      variants: (dbProduct.variants as Record<string, ProductVariant>) || undefined,
    };
  }

  /**
   * Retrieves a single product by ID, joining with translations, category, and brand.
   *
   * @param id - Product ID.
   * @param language - Language code for localized fields (default: 'en').
   * @returns Domain Product entity or null if not found.
   */
  async getById(id: number, language: string = "en"): Promise<Product | null> {
    const result = await db
      .select({
        product: products,
        translation: productTranslations,
        categoryTrans: categoryTranslations,
        brand: brands,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(
          eq(productTranslations.productId, products.id),
          eq(productTranslations.language, language),
        ),
      )
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, products.categoryId),
          eq(categoryTranslations.language, language),
        ),
      )
      .leftJoin(brands, eq(brands.id, products.brandId))
      .where(eq(products.id, id))
      .limit(1);

    if (result.length === 0) return null;

    // Fetch normalized images if strictly needed (omitted for perf, using JSON fallback for now)
    // If strict normalized images are used:
    // const imgs = await db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(productImages.order);

    const row = result[0];
    return this.mapToDomain(
      row.product,
      row.translation || undefined,
      row.categoryTrans?.name,
      row.brand?.name,
    );
  }

  /**
   *
   */
  async getAll(language: string = "en"): Promise<Product[]> {
    return this.search("", language);
  }

  /**
   * Retrieves a list of featured products (flagged as new and active).
   *
   * @param limit - Maximum number of products to return.
   * @param language - Localization language.
   * @returns Array of Product entities.
   */
  async getFeatured(limit: number = 10, language: string = "en"): Promise<Product[]> {
    const results = await db
      .select({
        product: products,
        translation: productTranslations,
        categoryTrans: categoryTranslations,
        brand: brands,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(
          eq(productTranslations.productId, products.id),
          eq(productTranslations.language, language),
        ),
      )
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, products.categoryId),
          eq(categoryTranslations.language, language),
        ),
      )
      .leftJoin(brands, eq(brands.id, products.brandId))
      .where(and(eq(products.isNew, true), eq(products.isActive, true)))
      .limit(limit);

    return results.map((row) =>
      this.mapToDomain(
        row.product,
        row.translation || undefined,
        row.categoryTrans?.name,
        row.brand?.name,
      ),
    );
  }

  /**
   *
   */
  async getByCategory(categoryId: number, language: string = "en"): Promise<Product[]> {
    const results = await db
      .select({
        product: products,
        translation: productTranslations,
        categoryTrans: categoryTranslations,
        brand: brands,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(
          eq(productTranslations.productId, products.id),
          eq(productTranslations.language, language),
        ),
      )
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, products.categoryId),
          eq(categoryTranslations.language, language),
        ),
      )
      .leftJoin(brands, eq(brands.id, products.brandId))
      .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)));

    return results.map((row) =>
      this.mapToDomain(
        row.product,
        row.translation || undefined,
        row.categoryTrans?.name,
        row.brand?.name,
      ),
    );
  }

  /**
   *
   */
  async getByBrand(brandId: number, language: string = "en"): Promise<Product[]> {
    const results = await db
      .select({
        product: products,
        translation: productTranslations,
        categoryTrans: categoryTranslations,
        brand: brands,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(
          eq(productTranslations.productId, products.id),
          eq(productTranslations.language, language),
        ),
      )
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, products.categoryId),
          eq(categoryTranslations.language, language),
        ),
      )
      .leftJoin(brands, eq(brands.id, products.brandId))
      .where(and(eq(products.brandId, brandId), eq(products.isActive, true)));

    return results.map((row) =>
      this.mapToDomain(
        row.product,
        row.translation || undefined,
        row.categoryTrans?.name,
        row.brand?.name,
      ),
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
        categoryTrans: categoryTranslations,
        brand: brands,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(
          eq(productTranslations.productId, products.id),
          eq(productTranslations.language, language),
        ),
      )
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, products.categoryId),
          eq(categoryTranslations.language, language),
        ),
      )
      .leftJoin(brands, eq(brands.id, products.brandId))
      .where(
        and(
          eq(products.isActive, true),
          or(
            ilike(productTranslations.name, `%${query}%`),
            ilike(productTranslations.description, `%${query}%`),
          ),
        ),
      );

    return results.map((row) =>
      this.mapToDomain(
        row.product,
        row.translation || undefined,
        row.categoryTrans?.name,
        row.brand?.name,
      ),
    );
  }

  /**
   * Advanced product search and filtering with pagination.
   * Supports filtering by category, brand, price range, and text search.
   *
   * @param filters - Filter criteria (category, brand, price, search text).
   * @param language - Localization language.
   * @returns Object containing paginated products and total count.
   */
  async getFiltered(
    filters: ProductFilters,
    language: string = "en",
  ): Promise<{ products: Product[]; total: number }> {
    const conditions = [];

    if (filters.categoryId) conditions.push(eq(products.categoryId, filters.categoryId));
    if (filters.brandId) conditions.push(eq(products.brandId, filters.brandId));
    if (filters.isActive !== undefined) conditions.push(eq(products.isActive, filters.isActive));
    if (filters.isNew !== undefined) conditions.push(eq(products.isNew, filters.isNew));
    if (filters.minPrice) conditions.push(gte(products.price, String(filters.minPrice)));
    if (filters.maxPrice) conditions.push(lte(products.price, String(filters.maxPrice)));

    if (filters.search) {
      conditions.push(
        or(
          ilike(productTranslations.name, `%${filters.search}%`),
          ilike(productTranslations.description, `%${filters.search}%`),
          ilike(products.sku, `%${filters.search}%`),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderBy = desc(products.createdAt);
    if (filters.sort === "price_asc") orderBy = asc(products.price);
    if (filters.sort === "price_desc") orderBy = desc(products.price);
    if (filters.sort === "rating") orderBy = desc(products.rating);

    const data = await db
      .select({
        product: products,
        translation: productTranslations,
        categoryTrans: categoryTranslations,
        brand: brands,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(
          eq(productTranslations.productId, products.id),
          eq(productTranslations.language, language || "en"),
        ),
      )
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, products.categoryId),
          eq(categoryTranslations.language, language || "en"),
        ),
      )
      .leftJoin(brands, eq(brands.id, products.brandId))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    const totalResult = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(products)
      .leftJoin(
        productTranslations,
        and(
          eq(productTranslations.productId, products.id),
          eq(productTranslations.language, language || "en"),
        ),
      )
      .where(whereClause);

    return {
      products: data.map((row) =>
        this.mapToDomain(
          row.product,
          row.translation || undefined,
          row.categoryTrans?.name,
          row.brand?.name,
        ),
      ),
      total: totalResult[0]?.count || 0,
    };
  }

  /**
   *
   */
  async getLowStock(threshold?: number, language: string = "en"): Promise<Product[]> {
    const results = await db
      .select({
        product: products,
        translation: productTranslations,
        categoryTrans: categoryTranslations,
        brand: brands,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(
          eq(productTranslations.productId, products.id),
          eq(productTranslations.language, language),
        ),
      )
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, products.categoryId),
          eq(categoryTranslations.language, language),
        ),
      )
      .leftJoin(brands, eq(brands.id, products.brandId))
      .where(
        and(
          eq(products.isActive, true),
          sql`${products.stockQuantity} <= ${threshold !== undefined ? threshold : products.lowStockThreshold}`,
        ),
      );

    return results.map((row) =>
      this.mapToDomain(
        row.product,
        row.translation || undefined,
        row.categoryTrans?.name,
        row.brand?.name,
      ),
    );
  }

  /**
   *
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
      updatedAt: new Date(),
    };
    if (config.lowStockThreshold !== undefined) {
      data.lowStockThreshold = config.lowStockThreshold;
    }
    await db.update(products).set(data).where(eq(products.id, id));
  }

  /**
   * Performs bulk updates of stock quantities in a single transaction.
   * Efficient for batch inventory adjustments.
   *
   * @param updates - Array of objects containing product ID and new quantity.
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
   * Creates a new product and its associated translations in a transaction.
   *
   * @param input - Product creation data including translations.
   * @returns The newly created Product entity.
   */
  async create(input: ProductInput): Promise<Product> {
    return await db.transaction(async (tx) => {
      // Use explicit casting or any to satisfy Drizzle types for complex JSON/optional fields
      const dbValues: any = {
        price: String(input.price),
        strikePrice: input.strikePrice ? String(input.strikePrice) : null,
        categoryId: input.categoryId || null,
        brandId: input.brandId || null,
        sku: input.sku || null,
        images: input.images || [],
        isNew: input.isNew || false,
        isActive: input.isActive ?? true,
        stockQuantity: input.stockQuantity || 0,
        lowStockThreshold: input.lowStockThreshold || 10,
        variants: input.variants || null,
      };

      const [newProduct] = await tx.insert(products).values(dbValues).returning();

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
  async update(id: number, input: ProductInput): Promise<Product> {
    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(products)
        .set({
          price: String(input.price),
          strikePrice: input.strikePrice ? String(input.strikePrice) : null,
          categoryId: input.categoryId || null,
          brandId: input.brandId || null,
          sku: input.sku || null,
          images: input.images || [],
          isNew: input.isNew || false,
          isActive: input.isActive ?? true,
          stockQuantity: input.stockQuantity ?? undefined, // Only update if provided
          lowStockThreshold: input.lowStockThreshold ?? undefined,
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
  async count(filters?: ProductFilters): Promise<number> {
    // Basic count implementation, respecting filters if needed
    const conditions = [];
    if (filters) {
      if (filters.categoryId) conditions.push(eq(products.categoryId, filters.categoryId));
      if (filters.brandId) conditions.push(eq(products.brandId, filters.brandId));
      if (filters.isActive !== undefined) conditions.push(eq(products.isActive, filters.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select({ value: sqlCount(products.id) })
      .from(products)
      .where(whereClause);

    return result[0]?.value || 0;
  }

  /**
   * Retrieves a raw product input object including all translations.
   * Useful for populating the admin edit form.
   *
   * @param id - The product ID.
   * @returns ProductInput object with translations, or null.
   */
  async getByIdWithTranslations(id: number): Promise<(ProductInput & { id: number }) | null> {
    // This uses functional query approach which might need adjustment based on how drizzle relations are set up
    // For safety, implementing with standard query
    const product = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (product.length === 0) return null;

    const translations = await db
      .select()
      .from(productTranslations)
      .where(eq(productTranslations.productId, id));

    return {
      id: product[0].id,
      price: Number(product[0].price),
      strikePrice: product[0].strikePrice ? Number(product[0].strikePrice) : undefined,
      categoryId: product[0].categoryId || undefined,
      brandId: product[0].brandId || undefined,
      sku: product[0].sku || undefined,
      images: (product[0].images as string[]) || [],
      isNew: product[0].isNew || false,
      isActive: product[0].isActive,
      stockQuantity: product[0].stockQuantity,
      lowStockThreshold: product[0].lowStockThreshold,
      variants: (product[0].variants as Record<string, any>) || undefined,
      translations: translations.map((t) => ({
        language: t.language,
        name: t.name,
        description: t.description,
        longDescription: t.longDescription || "",
      })),
    };
  }
}
