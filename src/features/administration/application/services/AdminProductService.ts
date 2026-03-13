import type { ID } from "@/features/core/domain/types/common";
import type { IAdminProductService } from "../interfaces/IAdminProductService";
import type { IProductRepository } from "@/features/catalog/application/interfaces/IProductRepository";
import type { ICategoryRepository } from "@/features/catalog/application/interfaces/ICategoryRepository";
import type { IBrandRepository } from "@/features/catalog/application/interfaces/IBrandRepository";
import type { IAuditLogService } from "../interfaces/IAuditLogService";
import type { MediaService } from "@/features/media/application/services/MediaService";
import type { Product } from "@/features/catalog/domain/entities/Product";
import type { ProductInput } from "../../domain/types/ProductInput";
import type { Locale } from "@/features/core/domain/value-objects";
import type {
  CreateProductWithVariantsInput,
  UpdateProductWithVariantsInput,
  UoMInput,
  ImageInput,
  CreateVariantInput,
} from "@/features/administration/domain/types/VariantInput";
import type { VariantDimension } from "@/features/catalog/domain/types/VariantDimension";
import { VariantKey } from "@/features/catalog/domain/value-objects/VariantKey";
import { Sku } from "@/features/catalog/domain/value-objects/Sku";
import { generateVariantMatrix } from "@/features/catalog/domain/types/VariantDimension";
import { db } from "@/features/core/infrastructure/persistence";
import {
  products,
  productVariants,
  variantImages,
  variantAttributes,
  variantSellableUoms,
  variantPriceLists,
  productTags,
  attributeDefinitions,
} from "@/features/core/infrastructure/persistence/schema";
import { eq, and, ne, inArray } from "drizzle-orm";

/**
 * Admin Product Service
 *
 * Orchestrates full product lifecycle for the admin dashboard:
 * - Product shell (SPU) creation/update/delete
 * - Variant generation from attribute dimensions
 * - UoM and price list management per variant
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
          localizedDescription: input.localizedDescription ?? {},
          localizedLongDescription: input.localizedLongDescription ?? {},
          localizedSlug: input.localizedSlug ?? {},
          categoryId: input.categoryId ?? null,
          brandId: input.brandId ?? null,
          isActive: input.isActive,
          sku: input.sku ?? null,
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
        input.pricingMode === "shared"
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
      entityType: "product",
      entityId: String(productId),
      action: "create",
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
      if (input.localizedSlug !== undefined) spuUpdate.localizedSlug = input.localizedSlug;
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
        if (v.id) {
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
                  variantId: v.id!,
                  url: img.url,
                  alt: img.alt ?? null,
                  displayOrder: img.displayOrder,
                })),
              );
            }
          }

          if (v.uoms !== undefined) {
            await this._upsertUoMsInTx(tx, v.id, v.uoms);
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
      entityType: "product",
      entityId: String(id),
      action: "update",
      adminUserId,
      newValues: input as Record<string, unknown>,
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
      entityType: "product",
      entityId: String(id),
      action: "delete",
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
      entityType: "product_variant",
      entityId: String(variantId),
      action: "deactivate",
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
          defaults.sku ?? "SKU",
          attrEntries.map(([, v]) => v),
        );

        const [row] = await tx
          .insert(productVariants)
          .values({
            productId,
            sku: defaults.sku ?? suggestedSku,
            variantKey,
            localizedLabel: defaults.localizedLabel ?? { en: "", ar: "" },
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

        // Apply default UoMs
        if (defaults.uoms?.length) {
          await this._upsertUoMsInTx(tx, row.id, defaults.uoms);
        }
      }
    });

    await this.auditLogService?.logAction({
      entityType: "product",
      entityId: String(productId),
      action: "generate_variants",
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
        attrs.map((a) => ({ key: a.key, value: a.valueText ?? "" })),
      ).toString();

      await db
        .update(productVariants)
        .set({ variantKey: newKey })
        .where(eq(productVariants.id, variant.id));
    }

    await this.auditLogService?.logAction({
      entityType: "product",
      entityId: String(productId),
      action: "rebuild_variant_keys",
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

  // ─── UoM Management ───────────────────────────────────────────────────────

  /**
   *
   */
  async upsertVariantUoMs(
    variantId: number,
    uoms: UoMInput[],
    adminUserId?: number,
  ): Promise<void> {
    await db.transaction(async (tx) => {
      await this._upsertUoMsInTx(tx, variantId, uoms);
    });

    await this.auditLogService?.logAction({
      entityType: "product_variant",
      entityId: String(variantId),
      action: "upsert_uoms",
      adminUserId,
    });
  }

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
      entityType: "product_variant",
      entityId: String(variantId),
      action: "upsert_images",
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
      entityType: "product",
      entityId: String(product.id),
      action: "create",
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
      entityType: "product",
      entityId: String(id),
      action: "update",
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
    tx: any,
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
            .join("-") ?? "default",
        localizedLabel: variant.localizedLabel ?? { en: "", ar: "" },
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

    // Insert UoMs + price lists
    if (variant.uoms?.length) {
      await this._upsertUoMsInTx(tx, variantId, variant.uoms);
    }

    return variantId;
  }

  /**
   *
   */
  private async _upsertUoMsInTx(tx: any, variantId: number, uoms: UoMInput[]): Promise<void> {
    // Replace all UoMs
    await tx.delete(variantSellableUoms).where(eq(variantSellableUoms.variantId, variantId));

    if (!uoms.length) return;

    for (const uom of uoms) {
      const [uomRow] = await tx
        .insert(variantSellableUoms)
        .values({
          variantId,
          uomCode: uom.uomCode,
          factorToBase: String(uom.factorToBase),
          localizedLabel: uom.localizedLabel,
          barcode: uom.barcode ?? null,
          isEnabled: uom.isEnabled,
        })
        .returning({ id: variantSellableUoms.id });

      // Insert price lists for this UoM
      if (uom.priceLists?.length) {
        await tx.insert(variantPriceLists).values(
          uom.priceLists.map((pl) => ({
            variantId,
            uomCode: uom.uomCode,
            customerGroup: pl.customerGroup,
            unitPrice: String(pl.unitPrice),
            minQty: pl.minQty,
            isSellable: pl.isSellable,
            startsAt: pl.startsAt ?? null,
            endsAt: pl.endsAt ?? null,
          })),
        );
      }
    }
  }
}
