import type { ID } from '../../../core/domain/types/common';
import type { IAdminProductService } from '../interfaces/IAdminProductService';
import type { IProductRepository } from '../../../catalog/application/interfaces/IProductRepository';
import type { ICategoryRepository } from '../../../catalog/application/interfaces/ICategoryRepository';
import type { IBrandRepository } from '../../../catalog/application/interfaces/IBrandRepository';
import type { IAuditLogService } from '../interfaces/IAuditLogService';
import type { MediaService } from '../../../media/application/services/MediaService';
import type { Product } from '../../../catalog/domain/entities/Product';
import type { ProductInput } from '../../domain/types/ProductInput';
import type { Locale } from '../../../core/domain/value-objects';
import type {
  CreateProductWithVariantsInput,
  UpdateProductWithVariantsInput,
  ImageInput,
  CreateVariantInput,
} from '../../domain/types/VariantInput';
import type { VariantDimension } from '../../../catalog/domain/types/VariantDimension';
import { VariantKey } from '../../../catalog/domain/value-objects/VariantKey';
import { Sku } from '../../../catalog/domain/value-objects/Sku';
import { generateVariantMatrix } from '../../../catalog/domain/types/VariantDimension';
import { db, Db } from '@findeg/db/connection';
import {
  products,
  productVariants,
  variantImages,
  variantAttributes,
  productTags,
  attributeDefinitions,
  categories,
  brands,
} from '@findeg/db/schema';
import { eq, and, ne, inArray, sql, desc, asc, or, ilike, count, SQL, Column } from 'drizzle-orm';
import {
  ProductListFilters,
  ProductListItem,
  ProductListResult,
  ProductEditData,
} from '../interfaces/IAdminProductService';

type Transaction = Parameters<Parameters<Db['transaction']>[0]>[0];

/**
 * Admin Product Service
 *
 * Orchestrates full product lifecycle for the admin dashboard:
 * - Product shell (SPU) creation/update/delete
 * - Variant generation from attribute dimensions
 * - Price management per variant
 * - SKU uniqueness validation
 * - Audit logging for all mutations
 */
export class AdminProductService implements IAdminProductService {
  /**
   *
   */
  constructor(
    private productRepository: IProductRepository,
    private categoryRepository: ICategoryRepository,
    private brandRepository?: IBrandRepository,
    private auditLogService?: IAuditLogService,
    private mediaService?: MediaService,
  ) {}

  // ─── Read ──────────────────────────────────────────────────────────────────

  /**
   * Retrieves all products for administrative listing with filters, sort, and pagination.
   * Single efficient JOIN query.
   */
  async getProductsList(filters: ProductListFilters): Promise<ProductListResult> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    // Subqueries for variant-level statistics
    const pricingAndVariants = sql`
      (SELECT 
        "product_id",
        MIN(CAST("base_price" AS DECIMAL)) as min_price,
        COUNT("id") as v_count,
        MAX(CASE WHEN "is_active" = true THEN 1 ELSE 0 END) as has_active_v
       FROM "catalog"."product_variants"
       GROUP BY "product_id"
      )
    `;

    const inventorySub = sql`
      (SELECT 
        pv."product_id",
        SUM(COALESCE(ib."on_hand", 0) - COALESCE(ib."reserved", 0)) as total_stock
       FROM "catalog"."product_variants" pv
       LEFT JOIN "inventory"."inventory_balances" ib ON pv."id" = ib."variant_id"
       GROUP BY pv."product_id"
      )
    `;

    const imagesSub = sql`
      (SELECT 
        pv."product_id",
        COUNT(vi."id") as img_count,
        (SELECT "url" FROM "catalog"."variant_images" vvi 
         WHERE vvi."variant_id" IN (SELECT "id" FROM "catalog"."product_variants" ppv WHERE ppv."product_id" = pv."product_id")
         ORDER BY vvi."display_order" ASC, vvi."id" ASC LIMIT 1) as thumb_url
       FROM "catalog"."product_variants" pv
       LEFT JOIN "catalog"."variant_images" vi ON pv."id" = vi."variant_id"
       GROUP BY pv."product_id"
      )
    `;

    // Base clauses
    const whereClauses = [];

    if (filters.search) {
      const search = `%${filters.search}%`;
      whereClauses.push(
        or(
          sql`${products.localizedName}->>'en' ILIKE ${search}`,
          sql`${products.localizedName}->>'ar' ILIKE ${search}`,
          sql`EXISTS (SELECT 1 FROM "catalog"."product_variants" pv WHERE pv."product_id" = ${products.id} AND pv."sku" ILIKE ${search})`,
        ),
      );
    }

    if (filters.categoryIds?.length) {
      whereClauses.push(inArray(products.categoryId, filters.categoryIds));
    }

    if (filters.brandIds?.length) {
      whereClauses.push(inArray(products.brandId, filters.brandIds));
    }

    if (filters.status) {
      whereClauses.push(eq(products.isActive, filters.status === 'active'));
    }

    // Completeness filter logic handled in subquery or post-filter
    // For performance, we'll apply it in a HAVING-like clause or subquery-based WHERE
    if (filters.completeness) {
      switch (filters.completeness) {
        case 'no-category':
          whereClauses.push(sql`${products.categoryId} IS NULL`);
          break;
        case 'draft':
          whereClauses.push(eq(products.isActive, false));
          break;
        case 'no-images':
          whereClauses.push(
            sql`NOT EXISTS (SELECT 1 FROM "catalog"."product_variants" pv 
                JOIN "catalog"."variant_images" vi ON pv."id" = vi."variant_id" 
                WHERE pv."product_id" = ${products.id})`,
          );
          break;
        case 'no-price':
          whereClauses.push(
            sql`NOT EXISTS (SELECT 1 FROM "catalog"."product_variants" pv 
                WHERE pv."product_id" = ${products.id} AND CAST(pv."base_price" AS DECIMAL) > 0)`,
          );
          break;
        case 'complete':
          whereClauses.push(
            and(
              sql`${products.categoryId} IS NOT NULL`,
              eq(products.isActive, true),
              sql`EXISTS (SELECT 1 FROM "catalog"."product_variants" pv 
                  JOIN "catalog"."variant_images" vi ON pv."id" = vi."variant_id" 
                  WHERE pv."product_id" = ${products.id})`,
              sql`EXISTS (SELECT 1 FROM "catalog"."product_variants" pv 
                  WHERE pv."product_id" = ${products.id} AND CAST(pv."base_price" AS DECIMAL) > 0)`,
            ),
          );
          break;
      }
    }

    const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

    // Sorting
    let orderBy: SQL | Column = desc(products.updatedAt);
    if (filters.sortBy) {
      const dir = filters.sortDir === 'asc' ? asc : desc;
      switch (filters.sortBy) {
        case 'name':
          orderBy = dir(sql`${products.localizedName}->>'en'`);
          break;
        case 'price':
          orderBy = dir(sql`pv_stats.min_price`);
          break;
        case 'stock':
          orderBy = dir(sql`inv_stats.total_stock`);
          break;
        case 'updatedAt':
          orderBy = dir(products.updatedAt);
          break;
      }
    }

    const mainRows = await db
      .select({
        id: products.id,
        localizedName: products.localizedName,
        categoryId: products.categoryId,
        categoryName: sql<string>`${categories.localizedName}->>'en'`,
        brandId: products.brandId,
        brandName: brands.name,
        isActive: products.isActive,
        updatedAt: products.updatedAt,
        defaultVariantPrice: sql<number | null>`pv_stats.min_price`,
        variantCount: sql<number>`COALESCE(pv_stats.v_count, 0)`,
        totalStock: sql<number>`COALESCE(inv_stats.total_stock, 0)`,
        hasImages: sql<boolean>`COALESCE(img_stats.img_count, 0) > 0`,
        thumbnailUrl: sql<string | null>`img_stats.thumb_url`,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(sql`(${pricingAndVariants}) pv_stats`, eq(products.id, sql`pv_stats.product_id`))
      .leftJoin(sql`(${inventorySub}) inv_stats`, eq(products.id, sql`inv_stats.product_id`))
      .leftJoin(sql`(${imagesSub}) img_stats`, eq(products.id, sql`img_stats.product_id`))
      .where(where)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset);

    const [{ total }] = await db
      .select({ total: count(products.id) })
      .from(products)
      .where(where);

    const items: ProductListItem[] = mainRows.map((row) => {
      // Determine completeness
      let completeness: ProductListItem['completeness'] = 'complete';
      if (!row.categoryId) completeness = 'no-category';
      else if (!row.isActive) completeness = 'draft';
      else if (!row.hasImages) completeness = 'no-images';
      else if (!row.defaultVariantPrice || Number(row.defaultVariantPrice) === 0)
        completeness = 'no-price';

      return {
        ...row,
        sku: 'N/A', // SPUs no longer have SKUs, only variants
        localizedName: row.localizedName as { en: string; ar: string },
        defaultVariantPrice: row.defaultVariantPrice ? Number(row.defaultVariantPrice) : null,
        totalStock: Number(row.totalStock),
        variantCount: Number(row.variantCount),
        completeness,
      };
    });

    return {
      products: items,
      total,
      page,
      pageSize,
    };
  }

  /**
   *
   */
  async getAll(language?: Locale): Promise<Product[]> {
    return this.productRepository.getAll(language);
  }

  /**
   *
   */
  async getById(id: ID, language?: Locale): Promise<Product | null> {
    return this.productRepository.getById(id, language);
  }

  /**
   *
   */
  async count(): Promise<number> {
    return this.productRepository.count();
  }

  // ─── Create Product ────────────────────────────────────────────────────────

  /**
   * Creates a product (SPU) shell with all its variants in a single DB transaction.
   */
  async createProduct(
    input: CreateProductWithVariantsInput,
    adminUserId?: number,
  ): Promise<{ productId: number }> {
    if (input.categoryId) {
      const cat = await this.categoryRepository.getById(input.categoryId);
      if (!cat) throw new Error(`Category ${input.categoryId} not found`);
    }
    if (input.brandId && this.brandRepository) {
      const brand = await this.brandRepository.getById(input.brandId);
      if (!brand) throw new Error(`Brand ${input.brandId} not found`);
    }

    const productId = await db.transaction(async (tx) => {
      // 1. Insert SPU shell
      const [newProduct] = await tx
        .insert(products)
        .values({
          localizedName: input.localizedName,
          localizedDescription: input.localizedDescription ?? { en: '' },
          localizedLongDescription: input.localizedLongDescription ?? { en: '' },
          slug: input.slug ?? null,
          categoryId: input.categoryId ?? null,
          brandId: input.brandId ?? null,
          isActive: input.isActive,
        })
        .returning({ id: products.id });

      const pid = newProduct.id;

      // 2. Apply tag associations
      if (input.tagIds?.length) {
        await tx
          .insert(productTags)
          .values(input.tagIds.map((tagId) => ({ productId: pid, tagId })));
      }

      // 3. Insert variants
      const variants =
        input.pricingMode === 'shared'
          ? input.variants.map((v) => ({
              ...v,
              basePrice: input.sharedBasePrice ?? v.basePrice,
              strikePrice: input.sharedStrikePrice ?? v.strikePrice ?? null,
              costPrice: input.sharedCostPrice ?? v.costPrice ?? null,
            }))
          : input.variants;

      for (let i = 0; i < variants.length; i++) {
        await this._insertVariantInTx(tx, pid, variants[i], i);
      }

      return pid;
    });

    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: String(productId),
      action: 'create',
      adminUserId,
      newValues: { ...input } as Record<string, unknown>,
    });

    return { productId };
  }

  // ─── Update Product ────────────────────────────────────────────────────────

  /**
   *
   */
  async updateProduct(
    id: ID,
    input: UpdateProductWithVariantsInput,
    adminUserId?: number,
  ): Promise<void> {
    const existing = await this.productRepository.getById(id);
    if (!existing) throw new Error(`Product ${id} not found`);

    if (input.categoryId && this.categoryRepository) {
      const cat = await this.categoryRepository.getById(input.categoryId);
      if (!cat) throw new Error(`Category ${input.categoryId} not found`);
    }

    await db.transaction(async (tx) => {
      // Update SPU shell fields
      const spuUpdate: Record<string, unknown> = {};
      if (input.localizedName !== undefined) spuUpdate.localizedName = input.localizedName;
      if (input.localizedDescription !== undefined)
        spuUpdate.localizedDescription = input.localizedDescription;
      if (input.localizedLongDescription !== undefined)
        spuUpdate.localizedLongDescription = input.localizedLongDescription;
      if (input.slug !== undefined) spuUpdate.slug = input.slug;
      if (input.categoryId !== undefined) spuUpdate.categoryId = input.categoryId;
      if (input.brandId !== undefined) spuUpdate.brandId = input.brandId;
      if (input.isActive !== undefined) spuUpdate.isActive = input.isActive;

      if (Object.keys(spuUpdate).length > 0) {
        await tx
          .update(products)
          .set(spuUpdate)
          .where(eq(products.id, id as number));
      }

      // Re-sync tags if provided
      if (input.tagIds !== undefined) {
        await tx.delete(productTags).where(eq(productTags.productId, id as number));
        if (input.tagIds.length) {
          await tx
            .insert(productTags)
            .values(input.tagIds.map((tagId) => ({ productId: id as number, tagId })));
        }
      }

      // Soft-delete variants flagged for deactivation
      if (input.variantsToDeactivate?.length) {
        await tx
          .update(productVariants)
          .set({ isActive: false })
          .where(inArray(productVariants.id, input.variantsToDeactivate));
      }

      // Hard-delete variants (only if allowed by caller, e.g. no order history)
      if (input.variantsToDelete?.length) {
        await tx.delete(productVariants).where(inArray(productVariants.id, input.variantsToDelete));
      }

      // Upsert variants provided
      for (const v of input.variants ?? []) {
        if ('id' in v && v.id) {
          // Update existing variant
          await tx
            .update(productVariants)
            .set({
              sku: v.sku,
              localizedLabel: v.localizedLabel as Record<string, string> | undefined,
              isActive: v.isActive,
              basePrice: v.basePrice !== undefined ? String(v.basePrice) : undefined,
              strikePrice: v.strikePrice !== undefined ? String(v.strikePrice) : undefined,
              costPrice: v.costPrice !== undefined ? String(v.costPrice) : undefined,
              weightGrams: v.weightGrams ?? null,
              barcode: v.barcode ?? null,
              lowStockThreshold: v.lowStockThreshold ?? 10,
              displayOrder: v.displayOrder,
            })
            .where(eq(productVariants.id, v.id));

          if (v.images !== undefined) {
            await tx.delete(variantImages).where(eq(variantImages.variantId, v.id));
            if (v.images.length) {
              await tx.insert(variantImages).values(
                v.images.map((img) => ({
                  variantId: v.id,
                  url: img.url,
                  alt: img.alt ?? null,
                  displayOrder: img.displayOrder,
                })),
              );
            }
          }

        } else {
          // New variant to insert
          await this._insertVariantInTx(
            tx,
            id as number,
            v as CreateVariantInput,
            v.displayOrder ?? 0,
          );
        }
      }
    });

    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: String(id),
      action: 'update',
      adminUserId,
      newValues: input as Record<string, unknown>,
    });
  }

  /**
   * Duplicates an existing product and its variants.
   */
  async duplicateProduct(id: number, adminUserId?: number): Promise<{ newId: number }> {
    const existing = await db.select().from(products).where(eq(products.id, id)).limit(1);
    const product = existing[0];
    if (!product) throw new Error(`Product ${id} not found`);

    const allVariants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, id));

    const result = await db.transaction(async (tx) => {
      // 1. Duplicate SPU
      const [newSpu] = await tx
        .insert(products)
        .values({
          localizedName: {
            en: `${(product.localizedName as Record<'en' | 'ar', string>).en} (Copy)`,
            ar: `${(product.localizedName as Record<'en' | 'ar', string>).ar} (نسخة)`,
          },
          localizedDescription: product.localizedDescription,
          localizedLongDescription: product.localizedLongDescription,
          slug: `${product.slug}-copy`,
          categoryId: product.categoryId,
          brandId: product.brandId,
          isActive: false, // Default to inactive for safety
        })
        .returning({ id: products.id });

      // 2. Duplicate Variants
      for (const v of allVariants) {
        const [newV] = await tx
          .insert(productVariants)
          .values({
            productId: newSpu.id,
            sku: `${v.sku}-copy`,
            variantKey: v.variantKey,
            localizedLabel: v.localizedLabel as Record<string, string>,
            isActive: v.isActive,
            basePrice: v.basePrice,
            strikePrice: v.strikePrice,
            costPrice: v.costPrice,
            weightGrams: v.weightGrams,
            barcode: v.barcode,
            lowStockThreshold: v.lowStockThreshold,
            displayOrder: v.displayOrder,
          })
          .returning({ id: productVariants.id });

        // 3. Duplicate Images
        const imgs = await tx.select().from(variantImages).where(eq(variantImages.variantId, v.id));
        if (imgs.length) {
          await tx.insert(variantImages).values(
            imgs.map((i) => ({
              variantId: newV.id,
              url: i.url,
              alt: i.alt,
              displayOrder: i.displayOrder,
            })),
          );
        }
      }

      return { newId: newSpu.id };
    });

    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: String(id),
      action: 'duplicate',
      adminUserId,
      newValues: { newProductId: result.newId },
    });

    return result;
  }

  // ─── Bulk Mutations ─────────────────────────────────────────────────────────

  /**
   * Activates multiple products at once.
   */
  async bulkActivate(ids: number[], adminUserId?: number): Promise<void> {
    if (!ids.length) return;
    await db.update(products).set({ isActive: true }).where(inArray(products.id, ids));

    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: 'multiple',
      action: 'bulk_activate',
      adminUserId,
      newValues: { ids },
    });
  }

  /**
   * Deactivates multiple products at once.
   */
  async bulkDeactivate(ids: number[], adminUserId?: number): Promise<void> {
    if (!ids.length) return;
    await db.update(products).set({ isActive: false }).where(inArray(products.id, ids));

    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: 'multiple',
      action: 'bulk_deactivate',
      adminUserId,
      newValues: { ids },
    });
  }

  /**
   * Deletes multiple products at once.
   */
  async bulkDelete(ids: number[], adminUserId?: number): Promise<void> {
    if (!ids.length) return;
    // Note: repositories usually handle cascading or we rely on DB FKs
    await db.delete(products).where(inArray(products.id, ids));

    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: 'multiple',
      action: 'bulk_delete',
      adminUserId,
      newValues: { ids },
    });
  }

  // ─── Delete Product ────────────────────────────────────────────────────────

  /**
   *
   */
  async deleteProduct(id: ID, adminUserId?: number): Promise<void> {
    const existing = await this.productRepository.getById(id);
    if (!existing) throw new Error(`Product ${id} not found`);

    await this.productRepository.delete(id);

    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: String(id),
      action: 'delete',
      adminUserId,
      oldValues: existing as unknown as Record<string, unknown>,
    });
  }

  // ─── Deactivate Variant ────────────────────────────────────────────────────

  /**
   *
   */
  async deactivateVariant(variantId: number, adminUserId?: number): Promise<void> {
    await db
      .update(productVariants)
      .set({ isActive: false })
      .where(eq(productVariants.id, variantId));

    await this.auditLogService?.logAction({
      entityType: 'product_variant',
      entityId: String(variantId),
      action: 'deactivate',
      adminUserId,
    });
  }

  // ─── Variant Generation ────────────────────────────────────────────────────

  /**
   *
   */
  async generateVariants(
    productId: number,
    dimensions: VariantDimension[],
    defaults: Partial<CreateVariantInput>,
    adminUserId?: number,
  ): Promise<number[]> {
    const combinations = generateVariantMatrix(dimensions);
    const newIds: number[] = [];

    await db.transaction(async (tx) => {
      for (let i = 0; i < combinations.length; i++) {
        const combo = combinations[i];
        const attrEntries = Object.entries(combo);

        const variantKey = VariantKey.build(
          attrEntries.map(([key, value]) => ({ key, value })),
        ).toString();

        const suggestedSku = Sku.suggestVariantSku(
          defaults.sku ?? 'SKU',
          attrEntries.map(([, v]) => v),
        );

        const [row] = await tx
          .insert(productVariants)
          .values({
            productId,
            sku: defaults.sku ?? suggestedSku,
            variantKey,
            localizedLabel: defaults.localizedLabel ?? { en: '', ar: '' },
            displayOrder: i,
            isActive: defaults.isActive ?? true,
            basePrice: String(defaults.basePrice ?? 0),
            strikePrice: defaults.strikePrice ? String(defaults.strikePrice) : null,
            costPrice: defaults.costPrice ? String(defaults.costPrice) : null,
            weightGrams: defaults.weightGrams ?? null,
            barcode: defaults.barcode ?? null,
            lowStockThreshold: defaults.lowStockThreshold ?? 10,
          })
          .returning({ id: productVariants.id });

        newIds.push(row.id);

        // Insert variant attributes
        for (const [attrKey, attrValue] of attrEntries) {
          const [attrDef] = await tx
            .select({ id: attributeDefinitions.id })
            .from(attributeDefinitions)
            .where(eq(attributeDefinitions.key, attrKey))
            .limit(1);

          if (attrDef) {
            await tx.insert(variantAttributes).values({
              variantId: row.id,
              attributeId: attrDef.id,
              valueText: attrValue,
            });
          }
        }

      }
    });

    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: String(productId),
      action: 'generate_variants',
      adminUserId,
      newValues: { count: newIds.length } as Record<string, unknown>,
    });

    return newIds;
  }

  // ─── Rebuild Variant Keys ──────────────────────────────────────────────────

  /**
   *
   */
  async rebuildVariantKeys(productId: number, adminUserId?: number): Promise<void> {
    const variants = await db
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(eq(productVariants.productId, productId));

    for (const variant of variants) {
      const attrs = await db
        .select({
          key: attributeDefinitions.key,
          valueText: variantAttributes.valueText,
          isVariantDefining: attributeDefinitions.isVariantDefining,
        })
        .from(variantAttributes)
        .innerJoin(attributeDefinitions, eq(variantAttributes.attributeId, attributeDefinitions.id))
        .where(
          and(
            eq(variantAttributes.variantId, variant.id),
            eq(attributeDefinitions.isVariantDefining, true),
          ),
        );

      if (!attrs.length) continue;

      const newKey = VariantKey.build(
        attrs.map((a) => ({ key: a.key, value: a.valueText ?? '' })),
      ).toString();

      await db
        .update(productVariants)
        .set({ variantKey: newKey })
        .where(eq(productVariants.id, variant.id));
    }

    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: String(productId),
      action: 'rebuild_variant_keys',
      adminUserId,
    });
  }

  // ─── SKU Validation ────────────────────────────────────────────────────────

  /**
   *
   */
  async checkSkuAvailable(sku: string, excludeVariantId?: number): Promise<boolean> {
    const normalizedSku = sku.trim().toUpperCase();
    const rows = await db
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(
        excludeVariantId
          ? and(eq(productVariants.sku, normalizedSku), ne(productVariants.id, excludeVariantId))
          : eq(productVariants.sku, normalizedSku),
      )
      .limit(1);

    return rows.length === 0;
  }


  /**
   *
   */

  // ─── Image Management ──────────────────────────────────────────────────────

  /**
   *
   */
  async upsertVariantImages(
    variantId: number,
    images: ImageInput[],
    adminUserId?: number,
  ): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(variantImages).where(eq(variantImages.variantId, variantId));
      if (images.length) {
        await tx.insert(variantImages).values(
          images.map((img) => ({
            variantId,
            url: img.url,
            alt: img.alt ?? null,
            displayOrder: img.displayOrder,
          })),
        );
      }
    });

    await this.auditLogService?.logAction({
      entityType: 'product_variant',
      entityId: String(variantId),
      action: 'upsert_images',
      adminUserId,
    });
  }

  // ─── Legacy Compatibility ──────────────────────────────────────────────────

  /** @deprecated Use createProduct() instead for full variant support. */
  async create(input: ProductInput, adminUserId?: number): Promise<Product> {
    if (input.categoryId) {
      const cat = await this.categoryRepository.getById(input.categoryId);
      if (!cat) throw new Error(`Category ${input.categoryId} not found`);
    }
    const product = await this.productRepository.create(input);
    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: String(product.id),
      action: 'create',
      adminUserId,
      newValues: input as unknown as Record<string, unknown>,
    });
    return product;
  }

  /** @deprecated Use updateProduct() instead for full variant support. */
  async update(id: ID, input: ProductInput, adminUserId?: number): Promise<Product> {
    const existing = await this.productRepository.getById(id);
    if (!existing) throw new Error(`Product ${id} not found`);
    const updated = await this.productRepository.update(id, input);
    await this.auditLogService?.logAction({
      entityType: 'product',
      entityId: String(id),
      action: 'update',
      adminUserId,
      newValues: input as unknown as Record<string, unknown>,
    });
    return updated;
  }

  /** @deprecated Use deleteProduct() instead. */
  async delete(id: ID, adminUserId?: number): Promise<void> {
    await this.deleteProduct(id, adminUserId);
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  /**
   *
   */
  private async _insertVariantInTx(
    tx: Transaction,
    productId: number,
    variant: CreateVariantInput,
    displayOrder: number,
  ): Promise<number> {
    const [row] = await tx
      .insert(productVariants)
      .values({
        productId,
        sku: variant.sku.toUpperCase(),
        variantKey:
          variant.attributes
            ?.filter((a) => a.isVariantDefining)
            .sort((a, b) => a.attributeKey.localeCompare(b.attributeKey))
            .map((a) => a.value.toLowerCase())
            .join('-') ?? 'default',
        localizedLabel: variant.localizedLabel ?? { en: '', ar: '' },
        displayOrder,
        isActive: variant.isActive ?? true,
        basePrice: String(variant.basePrice),
        strikePrice: variant.strikePrice != null ? String(variant.strikePrice) : null,
        costPrice: variant.costPrice != null ? String(variant.costPrice) : null,
        weightGrams: variant.weightGrams ?? null,
        barcode: variant.barcode ?? null,
        lowStockThreshold: variant.lowStockThreshold ?? 10,
      })
      .returning({ id: productVariants.id });

    const variantId = row.id;

    // Insert images
    if (variant.images?.length) {
      await tx.insert(variantImages).values(
        variant.images.map((img) => ({
          variantId,
          url: img.url,
          alt: img.alt ?? null,
          displayOrder: img.displayOrder,
        })),
      );
    }

    // Insert attributes
    if (variant.attributes?.length) {
      for (const attr of variant.attributes) {
        const [attrDef] = await tx
          .select({ id: attributeDefinitions.id })
          .from(attributeDefinitions)
          .where(eq(attributeDefinitions.key, attr.attributeKey))
          .limit(1);

        if (attrDef) {
          await tx.insert(variantAttributes).values({
            variantId,
            attributeId: attrDef.id,
            valueText: attr.value,
          });
        }
      }
    }


    return variantId;
  }

  /**
   *
   */

  // ─── Fetch for Edit ────────────────────────────────────────────────────────

  /**
   * Retrieves full product data for the edit form.
   * Uses Drizzle relational API for deep hydration.
   */
  async getProductForEdit(id: number): Promise<ProductEditData | null> {
    const data = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        variants: {
          with: {
            images: {
              orderBy: [asc(variantImages.displayOrder)],
            },
            attributes: true,
          },
          orderBy: [asc(productVariants.displayOrder)],
        },
        tags: {
          with: {
            // productTags is a join table
            tag: true,
          },
        },
      },
    });

    if (!data) return null;

    // Map the relational data to ProductEditData interface
    return {
      ...data,
      rating: Number(data.rating),
      variants: data.variants.map((v) => ({
        ...v,
        basePrice: Number(v.basePrice),
        strikePrice: v.strikePrice ? Number(v.strikePrice) : null,
        costPrice: v.costPrice ? Number(v.costPrice) : null,
        images: v.images,
        attributes: v.attributes,
      })),
      tags: data.tags.map((pt) => pt.tag),
    } as unknown as ProductEditData;
  }

  /**
   * Checks if a slug is available (not used by another product).
   * Note: This checks the 'en' slug specifically as the primary handle.
   */
  async checkSlugAvailable(slug: string, excludeProductId?: number): Promise<boolean> {
    const condition = excludeProductId
      ? and(eq(products.slug, slug), ne(products.id, excludeProductId))
      : eq(products.slug, slug);

    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(condition)
      .limit(1);

    return !existing;
  }

}
