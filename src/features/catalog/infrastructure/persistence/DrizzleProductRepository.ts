import { db } from "@/features/core/infrastructure/persistence";
import {
  products,
  productTranslations,
  categories,
  categoryTranslations,
  brands,
  productImages,
  variantSellableUoms,
  variantPriceLists,
  type Product as DbProduct,
  type ProductTranslation as DbTranslation,
  type Brand as DbBrand,
  type Category as DbCategory,
  type CategoryTranslation as DbCategoryTranslation,
} from "@/features/core/infrastructure/persistence/schema";
import {
  IProductRepository,
  ProductFilters,
  VariantSellOption,
  VariantSellableUomInput,
  VariantPriceListInput,
} from "../../application/interfaces/IProductRepository";
import {
  Product,
  ProductVariant,
  ProductVariantCommercialConfig,
} from "../../domain/entities/Product";
import { ProductInput } from "@/features/administration/domain/types";
import {
  eq,
  and,
  ilike,
  like,
  or,
  count as sqlCount,
  desc,
  asc,
  lte,
  inArray,
  gte,
  sql,
} from "drizzle-orm";

import {
  ID,
  Price,
  Sku,
  Quantity,
  Rating,
  CustomerGroup,
  UomCode,
} from "@/features/core/domain/types/common";
import {
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  toLocalizedString,
  toMoney,
  type CurrencyCode,
  type Locale,
} from "@/features/core/domain/value-objects";

/**
 * Drizzle Product Repository
 *
 * PostgreSQL implementation of product catalog management using Drizzle ORM.
 * Handles product CRUD, search, filtering, inventory tracking, and multi-language support.
 * Implements complex queries for featured products, category/brand filtering, and low stock alerts.
 */
export class DrizzleProductRepository implements IProductRepository {
  /**
   * Resolves the materialized path for a category ID.
   */
  private async getCategoryPath(categoryId: ID): Promise<string | null> {
    const result = await db
      .select({ path: categories.path })
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    return result[0]?.path || null;
  }

  /**
   * Map database result to domain Product entity
   */
  private mapToDomain(
    dbProduct: DbProduct,
    translation?: DbTranslation,
    categoryName?: string,
    brandName?: string,
    images?: string[],
    variantCommercialConfig?: Record<string, ProductVariantCommercialConfig>,
  ): Product {
    // If we have normalized images, use them. Otherwise fallback to JSON images
    const finalImages = images && images.length > 0 ? images : (dbProduct.images as string[]) || [];

    const basePrice = Number(dbProduct.price) as Price;
    const strikePrice = dbProduct.strikePrice
      ? (Number(dbProduct.strikePrice) as Price)
      : undefined;
    const localizedContent = translation
      ? {
          name: toLocalizedString(
            { [translation.language]: translation.name },
            translation.name || "Untitled Product",
          ),
          description: toLocalizedString(
            { [translation.language]: translation.description },
            translation.description || "",
          ),
          longDescription: toLocalizedString(
            { [translation.language]: translation.longDescription },
            translation.longDescription || "",
          ),
        }
      : undefined;

    return {
      id: dbProduct.id,
      sku: dbProduct.sku || undefined,
      name: translation?.name || "Untitled Product",
      price: basePrice,
      strikePrice,
      currency: DEFAULT_CURRENCY,
      priceMoney: toMoney(basePrice, DEFAULT_CURRENCY),
      strikePriceMoney: strikePrice ? toMoney(strikePrice, DEFAULT_CURRENCY) : undefined,
      description: translation?.description || "",
      longDescription: translation?.longDescription || "",
      locale: (translation?.language || DEFAULT_LOCALE) as Locale,
      localizedContent,
      imageUrl: finalImages[0],
      images: finalImages,
      categoryId: dbProduct.categoryId || undefined,
      categoryName: categoryName,
      brandId: dbProduct.brandId || undefined,
      brandName: brandName,
      isNew: dbProduct.isNew || false,
      isActive: dbProduct.isActive,
      stockQuantity: dbProduct.stockQuantity as Quantity,
      lowStockThreshold: dbProduct.lowStockThreshold as Quantity,
      rating: Number(dbProduct.rating || 0) as Rating,
      reviewsCount: dbProduct.reviewsCount || 0,
      variants: (dbProduct.variants as Record<string, ProductVariant>) || undefined,
      variantCommercialConfig,
    };
  }

  /**
   * Loads all variant-level commercial configuration for a product.
   */
  private async getVariantCommercialConfig(
    productId: ID,
  ): Promise<Record<string, ProductVariantCommercialConfig>> {
    const [uomRows, priceRows] = await Promise.all([
      db
        .select({
          variantKey: variantSellableUoms.variantKey,
          uomCode: variantSellableUoms.uomCode,
          factorToBase: variantSellableUoms.factorToBase,
          isEnabled: variantSellableUoms.isEnabled,
        })
        .from(variantSellableUoms)
        .where(eq(variantSellableUoms.productId, productId)),
      db
        .select({
          variantKey: variantPriceLists.variantKey,
          customerGroup: variantPriceLists.customerGroup,
          uomCode: variantPriceLists.uomCode,
          unitPrice: variantPriceLists.unitPrice,
          currency: variantPriceLists.currency,
          isSellable: variantPriceLists.isSellable,
        })
        .from(variantPriceLists)
        .where(eq(variantPriceLists.productId, productId)),
    ]);

    const configMap = new Map<string, ProductVariantCommercialConfig>();
    /**
     * Returns existing variant config or initializes an empty one.
     */
    const ensureVariant = (variantKey: string): ProductVariantCommercialConfig => {
      const existing = configMap.get(variantKey);
      if (existing) return existing;
      const next: ProductVariantCommercialConfig = {
        variantKey,
        sellableUoms: [],
        priceLists: [],
      };
      configMap.set(variantKey, next);
      return next;
    };

    for (const row of uomRows) {
      const config = ensureVariant(row.variantKey);
      config.sellableUoms.push({
        uomCode: row.uomCode as UomCode,
        factorToBase: Number(row.factorToBase),
        isEnabled: row.isEnabled,
      });
    }

    for (const row of priceRows) {
      const config = ensureVariant(row.variantKey);
      config.priceLists.push({
        customerGroup: row.customerGroup as CustomerGroup,
        uomCode: row.uomCode as UomCode,
        unitPrice: Number(row.unitPrice) as Price,
        currency: row.currency,
        isSellable: row.isSellable,
      });
    }

    return Object.fromEntries(configMap.entries());
  }

  /**
   * Retrieves a single product by ID, joining with translations, category, and brand.
   *
   * @param id - Product ID.
   * @param language - Language code for localized fields (default: 'en').
   * @returns Domain Product entity or null if not found.
   */
  async getById(id: ID, language: Locale = DEFAULT_LOCALE): Promise<Product | null> {
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
    const variantCommercialConfig = await this.getVariantCommercialConfig(id);
    return this.mapToDomain(
      row.product,
      row.translation || undefined,
      row.categoryTrans?.name,
      row.brand?.name,
      undefined,
      Object.keys(variantCommercialConfig).length > 0 ? variantCommercialConfig : undefined,
    );
  }

  /**
   *
   */
  async getAll(language: Locale = DEFAULT_LOCALE): Promise<Product[]> {
    return this.search("", language);
  }

  /**
   * Retrieves a list of featured products (flagged as new and active).
   *
   * @param limit - Maximum number of products to return.
   * @param language - Localization language.
   * @returns Array of Product entities.
   */
  async getFeatured(limit: number = 10, language: Locale = DEFAULT_LOCALE): Promise<Product[]> {
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
  async getByCategory(categoryId: ID, language: Locale = DEFAULT_LOCALE): Promise<Product[]> {
    const categoryPath = await this.getCategoryPath(categoryId);
    if (!categoryPath) return [];

    const results = await db
      .select({
        product: products,
        translation: productTranslations,
        categoryTrans: categoryTranslations,
        brand: brands,
      })
      .from(products)
      .leftJoin(categories, eq(categories.id, products.categoryId))
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
      .where(and(like(categories.path, `${categoryPath}%`), eq(products.isActive, true)));

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
  async getByBrand(brandId: ID, language: Locale = DEFAULT_LOCALE): Promise<Product[]> {
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
  async search(query: string, language: Locale = DEFAULT_LOCALE): Promise<Product[]> {
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
            ilike(products.sku, `%${query}%`),
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
    language: Locale = DEFAULT_LOCALE,
  ): Promise<{ products: Product[]; total: number }> {
    let categoryPath: string | null = null;
    if (filters.categoryId) {
      categoryPath = await this.getCategoryPath(filters.categoryId);
      if (!categoryPath) {
        return { products: [], total: 0 };
      }
    }

    const conditions = [];

    if (filters.categoryId && categoryPath) {
      conditions.push(like(categories.path, `${categoryPath}%`));
    }
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
      .leftJoin(categories, eq(categories.id, products.categoryId))
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
      .leftJoin(categories, eq(categories.id, products.categoryId))
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
  async getLowStock(threshold?: Quantity, language: Locale = DEFAULT_LOCALE): Promise<Product[]> {
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
  async updateStock(id: ID, quantity: Quantity): Promise<void> {
    await db.update(products).set({ stockQuantity: quantity }).where(eq(products.id, id));
  }

  /**
   * Updates both stock quantity and low stock threshold for a product
   *
   * @param id - Product ID
   * @param config - New quantity and optional low stock threshold
   */
  async updateStockConfiguration(
    id: ID,
    config: { quantity: Quantity; lowStockThreshold?: Quantity },
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
  async bulkUpdateStock(updates: { id: ID; quantity: Quantity }[]): Promise<void> {
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
  async update(id: ID, input: ProductInput): Promise<Product> {
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
  async delete(id: ID): Promise<void> {
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
  async getByIdWithTranslations(id: ID): Promise<(ProductInput & { id: ID }) | null> {
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

  /**
   *
   */
  async upsertVariantSellableUoms(
    productId: ID,
    variantKey: string,
    uoms: VariantSellableUomInput[],
  ): Promise<void> {
    if (uoms.length === 0) return;

    await db.transaction(async (tx) => {
      for (const uom of uoms) {
        await tx
          .insert(variantSellableUoms)
          .values({
            productId,
            variantKey,
            uomCode: uom.uomCode,
            factorToBase: String(uom.factorToBase),
            isEnabled: uom.isEnabled ?? true,
          })
          .onConflictDoUpdate({
            target: [
              variantSellableUoms.productId,
              variantSellableUoms.variantKey,
              variantSellableUoms.uomCode,
            ],
            set: {
              factorToBase: String(uom.factorToBase),
              isEnabled: uom.isEnabled ?? true,
              updatedAt: new Date(),
            },
          });
      }
    });
  }

  /**
   *
   */
  async upsertVariantPriceLists(
    productId: ID,
    variantKey: string,
    prices: VariantPriceListInput[],
  ): Promise<void> {
    if (prices.length === 0) return;

    await db.transaction(async (tx) => {
      for (const price of prices) {
        await tx
          .insert(variantPriceLists)
          .values({
            productId,
            variantKey,
            customerGroup: price.customerGroup,
            uomCode: price.uomCode,
            unitPrice: String(price.unitPrice),
            currency: price.currency || DEFAULT_CURRENCY,
            isSellable: price.isSellable ?? true,
          })
          .onConflictDoUpdate({
            target: [
              variantPriceLists.productId,
              variantPriceLists.variantKey,
              variantPriceLists.customerGroup,
              variantPriceLists.uomCode,
            ],
            set: {
              unitPrice: String(price.unitPrice),
              currency: price.currency || DEFAULT_CURRENCY,
              isSellable: price.isSellable ?? true,
              updatedAt: new Date(),
            },
          });
      }
    });
  }

  /**
   *
   */
  async getVariantSellOptions(
    productId: ID,
    variantKey: string,
    customerGroup?: CustomerGroup,
  ): Promise<VariantSellOption[]> {
    const uoms = await db
      .select({
        uomCode: variantSellableUoms.uomCode,
        factorToBase: variantSellableUoms.factorToBase,
        isEnabled: variantSellableUoms.isEnabled,
      })
      .from(variantSellableUoms)
      .where(
        and(
          eq(variantSellableUoms.productId, productId),
          eq(variantSellableUoms.variantKey, variantKey),
        ),
      );

    if (!customerGroup) {
      return uoms.map((uom) => ({
        uomCode: uom.uomCode as UomCode,
        factorToBase: Number(uom.factorToBase),
        isEnabled: uom.isEnabled,
      }));
    }

    const prices = await db
      .select({
        uomCode: variantPriceLists.uomCode,
        unitPrice: variantPriceLists.unitPrice,
        currency: variantPriceLists.currency,
        isSellable: variantPriceLists.isSellable,
      })
      .from(variantPriceLists)
      .where(
        and(
          eq(variantPriceLists.productId, productId),
          eq(variantPriceLists.variantKey, variantKey),
          eq(variantPriceLists.customerGroup, customerGroup),
        ),
      );

    const priceByUom = new Map(
      prices.map((p) => [
        p.uomCode,
        {
          unitPrice: Number(p.unitPrice) as Price,
          currency: p.currency as CurrencyCode,
          isSellable: p.isSellable,
        },
      ]),
    );

    return uoms.map((uom) => {
      const price = priceByUom.get(uom.uomCode);
      return {
        uomCode: uom.uomCode as UomCode,
        factorToBase: Number(uom.factorToBase),
        isEnabled: uom.isEnabled,
        unitPrice: price?.unitPrice,
        currency: price?.currency,
        isSellable: price?.isSellable,
      };
    });
  }

  /**
   *
   */
  async resolveVariantUnitPrice(
    productId: ID,
    variantKey: string,
    uomCode: UomCode,
    customerGroup: CustomerGroup,
  ): Promise<{ unitPrice: Price; currency: CurrencyCode; isSellable: boolean } | null> {
    const result = await db
      .select({
        unitPrice: variantPriceLists.unitPrice,
        currency: variantPriceLists.currency,
        isSellable: variantPriceLists.isSellable,
      })
      .from(variantPriceLists)
      .where(
        and(
          eq(variantPriceLists.productId, productId),
          eq(variantPriceLists.variantKey, variantKey),
          eq(variantPriceLists.uomCode, uomCode),
          eq(variantPriceLists.customerGroup, customerGroup),
        ),
      )
      .limit(1);

    if (result.length === 0) return null;
    return {
      unitPrice: Number(result[0].unitPrice) as Price,
      currency: result[0].currency as CurrencyCode,
      isSellable: result[0].isSellable,
    };
  }
}
