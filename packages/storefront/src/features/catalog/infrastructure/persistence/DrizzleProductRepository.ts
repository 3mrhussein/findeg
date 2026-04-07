import { db } from "@features/core/infrastructure/persistence";
import {
  products,
  productVariants,
  variantImages,
  variantAttributes,
  categories,
  brands,
  variantSellableUoms,
  variantPriceLists,
  tags,
  productTags,
  attributeDefinitions,
  productAttributes,
  collectionTags,
  inventoryBalances,
  warehouses,
  type Product as DbProduct,
  type VariantImage as DbVariantImage,
} from "@features/core/infrastructure/persistence/schema";
import {
  IProductRepository,
  ProductFilters,
} from "../../application/interfaces/IProductRepository";
import { Product } from "../../domain/entities/Product";
import { Variant } from "../../domain/entities/Variant";
import { Tag } from "../../domain/entities/Tag";
import { ProductInput } from "@features/administration/domain/types";
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

import {
  ID,
  Price,
  Quantity,
  Rating,
  CustomerGroup,
  UomCode,
} from "@features/core/domain/types/common";
import {
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  resolveLocalizedString,
  toLocalizedString,
  type CurrencyCode,
  type Locale,
  type ResponsiveMediaSet,
} from "@features/core/domain/value-objects";

/**
 * Drizzle Product Repository
 *
 * PostgreSQL implementation of product catalog management using Drizzle ORM.
 * Handles product CRUD, search, filtering, inventory tracking, and multi-language support.
 * Implements complex queries for featured products, category/brand filtering, and low stock alerts.
 */
export class DrizzleProductRepository implements IProductRepository {
  /**
   * Converts arbitrary text to URL-safe slug.
   */
  private toRouteSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

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
   * Map database result to domain Product entity (SPU)
   */
  private mapToDomain(
    dbProduct: DbProduct,
    variants: Variant[] = [],
    categoryName?: string,
    brandName?: string,
    tags: Tag[] = [],
    attributes: any[] = [],
    language: Locale = DEFAULT_LOCALE,
  ): Product {
    const localizedSlugDraft = (dbProduct.localizedSlug || {}) as Record<string, string>;
    const localizedNameDraft = (dbProduct.localizedName || {}) as Record<string, string>;
    const localizedDescriptionDraft = (dbProduct.localizedDescription || {}) as Record<
      string,
      string
    >;
    const localizedLongDescriptionDraft = (dbProduct.localizedLongDescription || {}) as Record<
      string,
      string
    >;

    const localizedContent = {
      slug: toLocalizedString(localizedSlugDraft, dbProduct.skuPrefix || ""),
      name: toLocalizedString(localizedNameDraft, dbProduct.skuPrefix || ""),
      description: toLocalizedString(localizedDescriptionDraft, ""),
      longDescription: toLocalizedString(localizedLongDescriptionDraft, ""),
    };

    return {
      id: dbProduct.id,
      skuPrefix: dbProduct.skuPrefix || undefined,
      name: resolveLocalizedString(localizedContent.name, language, DEFAULT_LOCALE) || "",
      description:
        resolveLocalizedString(localizedContent.description, language, DEFAULT_LOCALE) || "",
      longDescription:
        resolveLocalizedString(localizedContent.longDescription, language, DEFAULT_LOCALE) || "",
      locale: undefined,
      localizedContent,
      mediaSet: (dbProduct.mediaSet as ResponsiveMediaSet | null) || undefined,
      categoryId: dbProduct.categoryId || undefined,
      categoryName: categoryName,
      brandId: dbProduct.brandId || undefined,
      brandName: brandName,
      isActive: dbProduct.isActive,
      rating: Number(dbProduct.rating || 0) as Rating,
      reviewsCount: dbProduct.reviewsCount || 0,
      variants,
      tags,
      attributes,
    };
  }

  /**
   * Placeholder for variant commercial config removal
   */
  private async getVariantCommercialConfig(productId: ID): Promise<Record<string, any>> {
    return {};
  }

  /**
   * Loads all tags for a product.
   */
  private async getProductTags(productId: ID): Promise<Tag[]> {
    const results = await db
      .select({ tag: tags })
      .from(productTags)
      .innerJoin(tags, eq(productTags.tagId, tags.id))
      .where(eq(productTags.productId, productId));
    return results.map((r) => r.tag as Tag);
  }

  /**
   * Loads all attributes for a product (SPU-level).
   */
  private async getProductAttributes(productId: ID): Promise<any[]> {
    const results = await db
      .select({
        attributeId: productAttributes.attributeId,
        key: attributeDefinitions.key,
        valueText: productAttributes.valueText,
        valueNum: productAttributes.valueNum,
        valueBool: productAttributes.valueBool,
      })
      .from(productAttributes)
      .innerJoin(attributeDefinitions, eq(productAttributes.attributeId, attributeDefinitions.id))
      .where(
        and(eq(productAttributes.productId, productId), eq(attributeDefinitions.scope, "product")),
      );

    return results.map((r) => ({
      ...r,
      valueNum: r.valueNum ? Number(r.valueNum) : undefined,
    }));
  }

  /**
   * Internal helper to hydrate variants for products.
   */
  private async getHydratedVariants(
    productIds: number[],
    language: Locale,
  ): Promise<Record<number, Variant[]>> {
    const variantRows = await db
      .select()
      .from(productVariants)
      .where(inArray(productVariants.productId, productIds))
      .orderBy(productVariants.displayOrder);

    const variantIds = variantRows.map((v) => v.id);
    if (variantIds.length === 0) return {};

    const [images, attrs, uoms, prices, inventoryRows] = await Promise.all([
      db
        .select()
        .from(variantImages)
        .where(inArray(variantImages.variantId, variantIds))
        .orderBy(variantImages.displayOrder),
      db
        .select({
          variantId: variantAttributes.variantId,
          attributeId: variantAttributes.attributeId,
          key: attributeDefinitions.key,
          valueText: variantAttributes.valueText,
          valueNum: variantAttributes.valueNum,
          valueBool: variantAttributes.valueBool,
        })
        .from(variantAttributes)
        .innerJoin(attributeDefinitions, eq(variantAttributes.attributeId, attributeDefinitions.id))
        .where(inArray(variantAttributes.variantId, variantIds)),
      db
        .select()
        .from(variantSellableUoms)
        .where(inArray(variantSellableUoms.variantId, variantIds)),
      db.select().from(variantPriceLists).where(inArray(variantPriceLists.variantId, variantIds)),
      db
        .select({
          variantId: inventoryBalances.variantId,
          warehouseId: inventoryBalances.warehouseId,
          warehouseCode: warehouses.code,
          onHand: inventoryBalances.onHand,
          reserved: inventoryBalances.reserved,
        })
        .from(inventoryBalances)
        .leftJoin(warehouses, eq(warehouses.id, inventoryBalances.warehouseId))
        .where(inArray(inventoryBalances.variantId, variantIds)),
    ]);

    const variantsByProduct: Record<number, Variant[]> = {};
    for (const v of variantRows) {
      const vImages = images.filter((img) => img.variantId === v.id);
      const vAttrs = attrs.filter((a) => a.variantId === v.id);
      const vUoms = uoms.filter((u) => u.variantId === v.id);
      const vPrices = prices.filter((p) => p.variantId === v.id);
      const vInventory = inventoryRows.filter((row) => row.variantId === v.id);

      const variant: Variant = {
        id: v.id,
        productId: v.productId,
        sku: v.sku,
        variantKey: v.variantKey,
        localizedLabel: (v.localizedLabel as any) || { en: "", ar: "" },
        displayOrder: v.displayOrder,
        isActive: v.isActive,
        basePrice: Number(v.basePrice),
        strikePrice: v.strikePrice ? Number(v.strikePrice) : undefined,
        costPrice: v.costPrice ? Number(v.costPrice) : undefined,
        weightGrams: v.weightGrams ? Number(v.weightGrams) : undefined,
        barcode: v.barcode || undefined,
        lowStockThreshold: v.lowStockThreshold,
        images: vImages.map((img) => ({
          id: img.id,
          variantId: img.variantId,
          url: img.url,
          alt: img.alt || undefined,
          displayOrder: img.displayOrder,
        })),
        attributes: vAttrs.map((a) => ({
          attributeId: a.attributeId,
          key: a.key,
          valueText: a.valueText || undefined,
          valueNum: a.valueNum ? Number(a.valueNum) : undefined,
          valueBool: a.valueBool ?? undefined,
        })),
        sellableUoms: vUoms.map((u) => ({
          uomCode: u.uomCode as UomCode,
          factorToBase: Number(u.factorToBase),
          isEnabled: u.isEnabled,
          localizedLabel: (u.localizedLabel as any) || undefined,
          barcode: u.barcode || undefined,
        })),
        priceLists: vPrices.map((p) => ({
          customerGroup: p.customerGroup as CustomerGroup,
          uomCode: p.uomCode as UomCode,
          unitPrice: Number(p.unitPrice) as Price,
          currency: p.currency as CurrencyCode,
          isSellable: p.isSellable,
          minQty: p.minQty,
          startsAt: p.startsAt?.toISOString() || undefined,
          endsAt: p.endsAt?.toISOString() || undefined,
        })),
        inventory: vInventory.map((row) => ({
          warehouseId: row.warehouseId,
          warehouseCode: row.warehouseCode || undefined,
          onHand: row.onHand,
          reserved: row.reserved,
        })),
      };

      if (!variantsByProduct[v.productId]) variantsByProduct[v.productId] = [];
      variantsByProduct[v.productId].push(variant);
    }

    return variantsByProduct;
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
        brand: brands,
      })
      .from(products)
      .leftJoin(brands, eq(brands.id, products.brandId))
      .where(eq(products.id, id))
      .limit(1);

    if (result.length === 0) return null;

    const row = result[0];

    // Fetch category name from localizedName
    const categoryId = row.product.categoryId;
    let categoryName: string | undefined;

    if (categoryId) {
      const categoryResult = await db
        .select({ localizedName: categories.localizedName })
        .from(categories)
        .where(eq(categories.id, categoryId))
        .limit(1);

      categoryName = categoryResult[0]?.localizedName
        ? resolveLocalizedString(categoryResult[0].localizedName as any, language, DEFAULT_LOCALE)
        : undefined;
    }

    const [variantsMap, tagsResult, attributesResult] = await Promise.all([
      this.getHydratedVariants([row.product.id], language),
      this.getProductTags(id),
      this.getProductAttributes(id),
    ]);

    return this.mapToDomain(
      row.product,
      variantsMap[row.product.id] || [],
      categoryName,
      row.brand?.name,
      tagsResult,
      attributesResult,
      language,
    );
  }

  /**
   * Retrieves a single product by localized slug.
   */
  async getBySlug(slug: string, language: Locale = DEFAULT_LOCALE): Promise<Product | null> {
    const normalizedSlug = slug.trim().toLowerCase();
    if (!normalizedSlug) return null;

    // Backward compatibility with legacy numeric ids.
    if (/^\d+$/.test(normalizedSlug)) {
      return this.getById(Number(normalizedSlug), language);
    }

    const result = await db
      .select({ id: products.id })
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          or(
            sql`LOWER(COALESCE(${products.localizedSlug} ->> 'en', '')) = ${normalizedSlug}`,
            sql`LOWER(COALESCE(${products.localizedSlug} ->> ${language}, '')) = ${normalizedSlug}`,
            sql`EXISTS (
              SELECT 1
              FROM jsonb_each_text(${products.localizedSlug}) AS localized(entry_key, entry_value)
              WHERE LOWER(localized.entry_value) = ${normalizedSlug}
            )`,
          ),
        ),
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.getById(result[0].id, language);
  }

  /**
   * Retrieves all products.
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
        brand: brands,
      })
      .from(products)
      .leftJoin(brands, eq(brands.id, products.brandId))
      .innerJoin(productTags, eq(productTags.productId, products.id))
      .innerJoin(tags, eq(tags.id, productTags.tagId))
      .where(and(eq(tags.key, "campaign:new-arrival"), eq(products.isActive, true)))
      .limit(limit);

    if (results.length === 0) return [];
    const productIds = results.map((r) => r.product.id);
    const variantsMap = await this.getHydratedVariants(productIds, language);

    return results.map((row) =>
      this.mapToDomain(
        row.product,
        variantsMap[row.product.id] || [],
        undefined, // Category name not hydrated in bulk for performance
        row.brand?.name,
        [], // tags
        [], // attributes
        language,
      ),
    );
  }

  /**
   * Retrieves products by category.
   */
  async getByCategory(categoryId: ID, language: Locale = DEFAULT_LOCALE): Promise<Product[]> {
    const results = await db
      .select({
        product: products,
        brand: brands,
      })
      .from(products)
      .leftJoin(brands, eq(brands.id, products.brandId))
      .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)));

    if (results.length === 0) return [];

    // Fetch category name
    const categoryResult = await db
      .select({ localizedName: categories.localizedName })
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    const categoryName = categoryResult[0]?.localizedName
      ? resolveLocalizedString(categoryResult[0].localizedName as any, language, DEFAULT_LOCALE)
      : undefined;

    const productIds = results.map((r) => r.product.id);
    const variantsMap = await this.getHydratedVariants(productIds, language);

    return results.map((row) =>
      this.mapToDomain(
        row.product,
        variantsMap[row.product.id] || [],
        categoryName,
        row.brand?.name,
        [], // tags
        [], // attributes
        language,
      ),
    );
  }

  /**
   * Retrieves products by brand.
   */
  async getByBrand(brandId: ID, language: Locale = DEFAULT_LOCALE): Promise<Product[]> {
    const results = await db
      .select({
        product: products,
        brand: brands,
      })
      .from(products)
      .leftJoin(brands, eq(brands.id, products.brandId))
      .where(and(eq(products.brandId, brandId), eq(products.isActive, true)));

    if (results.length === 0) return [];
    const productIds = results.map((r) => r.product.id);
    const variantsMap = await this.getHydratedVariants(productIds, language);

    return results.map((row) =>
      this.mapToDomain(
        row.product,
        variantsMap[row.product.id] || [],
        undefined, // Category name not hydrated in bulk
        row.brand?.name,
        [], // tags
        [], // attributes
        language,
      ),
    );
  }

  /**
   * Performs full-text search across product name and description.
   */
  async search(query: string, language: Locale = DEFAULT_LOCALE): Promise<Product[]> {
    const normalizedQuery = query.trim();
    const searchPattern = `%${normalizedQuery}%`;
    const whereConditions: any[] = [eq(products.isActive, true)];

    if (normalizedQuery) {
      whereConditions.push(
        or(
          ilike(
            sql<string>`COALESCE(${products.localizedSlug} ->> ${language}, '')`,
            searchPattern,
          ),
          ilike(
            sql<string>`COALESCE(${products.localizedName} ->> ${language}, '')`,
            searchPattern,
          ),
          ilike(
            sql<string>`COALESCE(${products.localizedDescription} ->> ${language}, '')`,
            searchPattern,
          ),
          ilike(
            sql<string>`COALESCE(${products.localizedLongDescription} ->> ${language}, '')`,
            searchPattern,
          ),
          ilike(
            sql<string>`COALESCE(${categories.localizedName} ->> ${language}, '')`,
            searchPattern,
          ),
          ilike(sql<string>`COALESCE(${brands.localizedName} ->> ${language}, '')`, searchPattern),
          ilike(brands.name, searchPattern),
          // Search variants.sku
          sql`EXISTS (SELECT 1 FROM ${productVariants} WHERE ${productVariants.productId} = ${products.id} AND ${productVariants.sku} ILIKE ${searchPattern})`,
        ),
      );
    }

    const results = await db
      .select({
        product: products,
        brand: brands,
      })
      .from(products)
      .leftJoin(categories, eq(categories.id, products.categoryId))
      .leftJoin(brands, eq(brands.id, products.brandId))
      .where(and(...whereConditions));

    if (results.length === 0) return [];
    const productIds = results.map((r) => r.product.id);
    const variantsMap = await this.getHydratedVariants(productIds, language);

    return results.map((row) =>
      this.mapToDomain(
        row.product,
        variantsMap[row.product.id] || [],
        undefined, // Category name not hydrated in bulk
        row.brand?.name,
        [], // tags
        [], // attributes
        language,
      ),
    );
  }

  /**
   * Advanced product search and filtering with pagination.
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
      conditions.push(
        sql`EXISTS (
          SELECT 1
          FROM ${categories}
          WHERE ${categories.id} = ${products.categoryId}
            AND ${categories.path} LIKE ${`${categoryPath}%`}
        )`,
      );
    }
    if (filters.brandId) conditions.push(eq(products.brandId, filters.brandId));
    if (filters.isActive !== undefined) conditions.push(eq(products.isActive, filters.isActive));
    if (filters.productIds && filters.productIds.length > 0) {
      conditions.push(inArray(products.id, filters.productIds as number[]));
    }

    // Price range filtering (requires join with variants)
    if (filters.minPrice || filters.maxPrice) {
      const priceConditions = [];
      if (filters.minPrice)
        priceConditions.push(gte(productVariants.basePrice, String(filters.minPrice)));
      if (filters.maxPrice)
        priceConditions.push(lte(productVariants.basePrice, String(filters.maxPrice)));

      conditions.push(
        sql`EXISTS (SELECT 1 FROM ${productVariants} WHERE ${productVariants.productId} = ${products.id} AND ${and(...priceConditions)})`,
      );
    }

    if (filters.tagIds && filters.tagIds.length > 0) {
      conditions.push(
        sql`EXISTS (SELECT 1 FROM ${productTags} WHERE ${productTags.productId} = ${products.id} AND ${productTags.tagId} IN ${filters.tagIds})`,
      );
    }

    if (filters.tagGroups && filters.tagGroups.length > 0) {
      conditions.push(
        sql`EXISTS (SELECT 1 FROM ${productTags} JOIN ${tags} ON ${productTags.tagId} = ${tags.id} WHERE ${productTags.productId} = ${products.id} AND ${tags.group} IN ${filters.tagGroups})`,
      );
    }

    if (filters.attributeFilters && filters.attributeFilters.length > 0) {
      for (const filter of filters.attributeFilters) {
        if (filter.operator === "eq") {
          conditions.push(
            sql`EXISTS (SELECT 1 FROM ${productAttributes} JOIN ${attributeDefinitions} ON ${productAttributes.attributeId} = ${attributeDefinitions.id} WHERE ${productAttributes.productId} = ${products.id} AND ${attributeDefinitions.key} = ${filter.attributeKey} AND (${productAttributes.valueText} = ${String(filter.value)} OR ${productAttributes.valueNum} = ${String(filter.value)}))`,
          );
        }
      }
    }

    if (filters.collectionId) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${productTags} 
          JOIN ${collectionTags} ON ${productTags.tagId} = ${collectionTags.tagId} 
          WHERE ${productTags.productId} = ${products.id} 
          AND ${collectionTags.collectionId} = ${filters.collectionId}
        )`,
      );
    }

    if (filters.search) {
      const normalizedSearch = filters.search.trim();
      if (normalizedSearch) {
        const searchPattern = `%${normalizedSearch}%`;
        conditions.push(
          or(
            ilike(
              sql<string>`COALESCE(${products.localizedName} ->> ${language}, '')`,
              searchPattern,
            ),
            ilike(
              sql<string>`COALESCE(${products.localizedDescription} ->> ${language}, '')`,
              searchPattern,
            ),
            ilike(
              sql<string>`COALESCE(${products.localizedLongDescription} ->> ${language}, '')`,
              searchPattern,
            ),
            // Search variants.sku
            sql`EXISTS (SELECT 1 FROM ${productVariants} WHERE ${productVariants.productId} = ${products.id} AND ${productVariants.sku} ILIKE ${searchPattern})`,
          ),
        );
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, totalResult] = await Promise.all([
      db
        .select({
          product: products,
          brand: brands,
        })
        .from(products)
        .leftJoin(brands, eq(brands.id, products.brandId))
        .where(whereClause)
        .limit(filters.limit || 20)
        .offset(filters.offset || 0)
        .orderBy(desc(products.createdAt)),
      db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(products)
        .where(whereClause),
    ]);

    if (data.length === 0) {
      return { products: [], total: totalResult[0]?.count || 0 };
    }

    const productIds = data.map((r) => r.product.id);
    const variantsMap = await this.getHydratedVariants(productIds, language);

    return {
      products: data.map((row) =>
        this.mapToDomain(
          row.product,
          variantsMap[row.product.id] || [],
          undefined, // Category name not hydrated in bulk for performance
          row.brand?.name,
          [], // tags result omitted for bulk search performance
          [], // attributes result omitted for bulk search performance
          language,
        ),
      ),
      total: totalResult[0]?.count || 0,
    };
  }

  /**
   * Retrieves products with variants having low stock.
   */
  async getLowStock(threshold?: Quantity, language: Locale = DEFAULT_LOCALE): Promise<Product[]> {
    const { inventoryBalances } =
      await import("@features/core/infrastructure/persistence/schema/inventory");

    // Search across variants for low stock by joining with inventory balances
    const variantSubquery = db
      .select({ productId: productVariants.productId })
      .from(productVariants)
      .leftJoin(inventoryBalances, eq(inventoryBalances.variantId, productVariants.id))
      .where(
        sql`COALESCE(${inventoryBalances.onHand} - ${inventoryBalances.reserved}, 0) <= ${threshold !== undefined ? threshold : productVariants.lowStockThreshold}`,
      );

    const results = await db
      .select({
        product: products,
        brand: brands,
      })
      .from(products)
      .leftJoin(brands, eq(brands.id, products.brandId))
      .where(and(eq(products.isActive, true), inArray(products.id, variantSubquery)));

    if (results.length === 0) return [];
    const productIds = results.map((r) => r.product.id);
    const variantsMap = await this.getHydratedVariants(productIds, language);

    return results.map((row) =>
      this.mapToDomain(
        row.product,
        variantsMap[row.product.id] || [],
        undefined, // Category name not hydrated in bulk
        row.brand?.name,
        [], // tags
        [], // attributes
        language,
      ),
    );
  }

  /**
   * Creates a new product and its associated translations and variants in a transaction.
   */
  async create(input: ProductInput): Promise<Product> {
    return await db.transaction(async (tx) => {
      // 1. Resolve localized metadata
      const localizedSlug = Object.fromEntries(
        (input.translations || []).map((t) => [t.language, this.toRouteSlug(t.name)]),
      );
      const localizedName = Object.fromEntries(
        (input.translations || []).map((t) => [t.language, t.name]),
      );
      const localizedDescription = Object.fromEntries(
        (input.translations || []).map((t) => [t.language, t.description]),
      );
      const localizedLongDescription = Object.fromEntries(
        (input.translations || []).map((t) => [t.language, t.longDescription]),
      );

      // 2. Insert main product (SPU)
      const [newProduct] = await tx
        .insert(products)
        .values({
          skuPrefix: input.skuPrefix,
          categoryId: input.categoryId,
          brandId: input.brandId,
          isActive: input.isActive ?? true,
          localizedName,
          localizedSlug,
          localizedDescription,
          localizedLongDescription,
          mediaSet: input.mediaSet || {},
        })
        .returning();

      // 3. (Legacy translations skipped)

      // 4. Insert variants (normalized)
      if (input.variants && input.variants.length > 0) {
        for (const v of input.variants) {
          const [newVariant] = await tx
            .insert(productVariants)
            .values({
              productId: newProduct.id,
              sku: v.sku,
              variantKey: v.variantKey,
              localizedLabel: v.localizedLabel || {},
              displayOrder: v.displayOrder || 0,
              isActive: v.isActive ?? true,
              basePrice: String(v.basePrice),
              strikePrice: v.strikePrice ? String(v.strikePrice) : null,
              costPrice: v.costPrice ? String(v.costPrice) : null,
              weightGrams: v.weightGrams,
              barcode: v.barcode,
              lowStockThreshold: v.lowStockThreshold || 10,
            })
            .returning();

          if (v.images?.length) {
            await tx.insert(variantImages).values(
              v.images.map((img) => ({
                variantId: newVariant.id,
                url: img.url,
                alt: img.alt,
                displayOrder: img.displayOrder || 0,
              })),
            );
          }

          if (v.attributes?.length) {
            await tx.insert(variantAttributes).values(
              v.attributes.map((attr) => ({
                variantId: newVariant.id,
                attributeId: attr.attributeId,
                valueText: attr.valueText,
                valueNum: attr.valueNum ? String(attr.valueNum) : null,
                valueBool: attr.valueBool,
              })),
            );
          }

          if (v.sellableUoms?.length) {
            await tx.insert(variantSellableUoms).values(
              v.sellableUoms.map((u) => ({
                variantId: newVariant.id,
                productId: newProduct.id,
                variantKey: v.variantKey,
                uomCode: u.uomCode as any,
                factorToBase: String(u.factorToBase),
                isEnabled: u.isEnabled,
                localizedLabel: u.localizedLabel || {},
                barcode: u.barcode,
              })),
            );
          }

          if (v.priceLists?.length) {
            await tx.insert(variantPriceLists).values(
              v.priceLists.map((p) => ({
                variantId: newVariant.id,
                productId: newProduct.id,
                variantKey: v.variantKey,
                customerGroup: p.customerGroup as any,
                uomCode: p.uomCode as any,
                unitPrice: String(p.unitPrice),
                currency: p.currency || DEFAULT_CURRENCY,
                isSellable: p.isSellable,
                minQty: p.minQty,
              })),
            );
          }
        }
      }

      const language = (input.translations?.[0]?.language || DEFAULT_LOCALE) as Locale;
      const hydratedResult = await this.getById(newProduct.id, language);
      if (!hydratedResult) throw new Error("Failed to retrieve created product");
      return hydratedResult;
    });
  }

  /**
   * Updates an existing product and its translations.
   */
  async update(id: ID, input: ProductInput): Promise<Product> {
    return await db.transaction(async (tx) => {
      // 1. Resolve localized metadata
      const localizedSlug = Object.fromEntries(
        (input.translations || []).map((t) => [t.language, this.toRouteSlug(t.name)]),
      );
      const localizedName = Object.fromEntries(
        (input.translations || []).map((t) => [t.language, t.name]),
      );
      const localizedDescription = Object.fromEntries(
        (input.translations || []).map((t) => [t.language, t.description]),
      );
      const localizedLongDescription = Object.fromEntries(
        (input.translations || []).map((t) => [t.language, t.longDescription]),
      );

      // 2. Update main product (SPU)
      await tx
        .update(products)
        .set({
          skuPrefix: input.skuPrefix,
          categoryId: input.categoryId,
          brandId: input.brandId,
          isActive: input.isActive,
          localizedName,
          localizedSlug,
          localizedDescription,
          localizedLongDescription,
          mediaSet: input.mediaSet,
        })
        .where(eq(products.id, id));

      // 3. (Legacy translations skipped)

      // 4. Update variants (normalized sync)
      if (input.variants !== undefined) {
        const existingVariants = await tx
          .select({ id: productVariants.id })
          .from(productVariants)
          .where(eq(productVariants.productId, id));

        const existingIds = existingVariants.map((v) => v.id);
        const inputIds = input.variants.filter((v: any) => v.id).map((v: any) => v.id as number);

        // Delete variants not in input
        const idsToDelete = existingIds.filter((eid) => !inputIds.includes(eid));
        if (idsToDelete.length > 0) {
          await tx.delete(productVariants).where(inArray(productVariants.id, idsToDelete));
        }

        // Upsert variants
        for (const v of input.variants) {
          let variantId: number;
          if (v.id) {
            variantId = v.id;
            await tx
              .update(productVariants)
              .set({
                sku: v.sku,
                variantKey: v.variantKey,
                localizedLabel: v.localizedLabel,
                displayOrder: v.displayOrder,
                isActive: v.isActive,
                basePrice: v.basePrice ? String(v.basePrice) : undefined,
                strikePrice: v.strikePrice ? String(v.strikePrice) : null,
                costPrice: v.costPrice ? String(v.costPrice) : null,
                weightGrams: v.weightGrams,
                barcode: v.barcode,
                lowStockThreshold: v.lowStockThreshold,
                updatedAt: new Date(),
              })
              .where(eq(productVariants.id, variantId));
          } else {
            const [newV] = await tx
              .insert(productVariants)
              .values({
                productId: id,
                sku: v.sku,
                variantKey: v.variantKey,
                localizedLabel: v.localizedLabel || {},
                displayOrder: v.displayOrder || 0,
                isActive: v.isActive ?? true,
                basePrice: String(v.basePrice),
                strikePrice: v.strikePrice ? String(v.strikePrice) : null,
                costPrice: v.costPrice ? String(v.costPrice) : null,
                weightGrams: v.weightGrams,
                barcode: v.barcode,
                lowStockThreshold: v.lowStockThreshold || 10,
              })
              .returning();
            variantId = newV.id;
          }

          // Sync children (simple delete/re-insert if provided)
          if (v.images !== undefined) {
            await tx.delete(variantImages).where(eq(variantImages.variantId, variantId));
            if (v.images.length > 0) {
              await tx.insert(variantImages).values(
                v.images.map((img) => ({
                  variantId,
                  url: img.url,
                  alt: img.alt,
                  displayOrder: img.displayOrder || 0,
                })),
              );
            }
          }

          if (v.attributes !== undefined) {
            await tx.delete(variantAttributes).where(eq(variantAttributes.variantId, variantId));
            if (v.attributes.length > 0) {
              await tx.insert(variantAttributes).values(
                v.attributes.map((attr) => ({
                  variantId,
                  attributeId: attr.attributeId,
                  valueText: attr.valueText,
                  valueNum: attr.valueNum ? String(attr.valueNum) : null,
                  valueBool: attr.valueBool,
                })),
              );
            }
          }

          if (v.sellableUoms !== undefined) {
            await tx
              .delete(variantSellableUoms)
              .where(eq(variantSellableUoms.variantId, variantId));
            if (v.sellableUoms.length > 0) {
              await tx.insert(variantSellableUoms).values(
                v.sellableUoms.map((u) => ({
                  variantId,
                  productId: id,
                  variantKey: v.variantKey,
                  uomCode: u.uomCode as any,
                  factorToBase: String(u.factorToBase),
                  isEnabled: u.isEnabled,
                  localizedLabel: u.localizedLabel || {},
                  barcode: u.barcode,
                })),
              );
            }
          }

          if (v.priceLists !== undefined) {
            await tx.delete(variantPriceLists).where(eq(variantPriceLists.variantId, variantId));
            if (v.priceLists.length > 0) {
              await tx.insert(variantPriceLists).values(
                v.priceLists.map((p) => ({
                  variantId,
                  productId: id,
                  variantKey: v.variantKey,
                  customerGroup: p.customerGroup as any,
                  uomCode: p.uomCode as any,
                  unitPrice: String(p.unitPrice),
                  currency: p.currency || DEFAULT_CURRENCY,
                  isSellable: p.isSellable,
                  minQty: p.minQty,
                })),
              );
            }
          }
        }
      }

      const language = (input.translations?.[0]?.language || DEFAULT_LOCALE) as Locale;
      const hydratedResult = await this.getById(id, language);
      if (!hydratedResult) throw new Error("Failed to retrieve updated product");
      return hydratedResult;
    });
  }

  /**
   * Removes a product and its variants.
   */
  async delete(id: ID): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  /**
   * Counts products matching filters.
   */
  async count(filters?: ProductFilters): Promise<number> {
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
}
