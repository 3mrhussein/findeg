/**
 * Domain Entity: Product (SPU)
 *
 * Products are Standard Product Units — the conceptual item.
 * Purchasable details (price, stock, images) live on Variant (SKU) entities.
 *
 * A Product always has at least one variant. Simple products have a single
 * "default" variant; multi-variant products have variants for each color/size/etc.
 */

import { z } from "zod";
import {
  IdSchema,
  RatingSchema,
  LocalizedStringSchema,
  type ID,
  type Rating,
} from "@/features/core/domain/types/common";
import { TagSchema } from "./Tag";
import { ProductAttributeValueSchema } from "./AttributeDefinition";
import { VariantSchema, type Variant, VariantEntity } from "./Variant";
import {
  resolveLocalizedString,
  ResponsiveMediaSetSchema,
  type Locale,
  type LocalizedString,
  type ResponsiveMediaSet,
} from "@/features/core/domain/value-objects";

/** Localized content map for a product */
export const ProductLocalizedContentSchema = z.object({
  slug: LocalizedStringSchema.optional(),
  name: LocalizedStringSchema,
  description: LocalizedStringSchema,
  longDescription: LocalizedStringSchema,
});
export type ProductLocalizedContent = z.infer<typeof ProductLocalizedContentSchema>;

/**
 * Product Domain Schema (SPU)
 *
 * Contains only SPU-level data. All pricing, inventory, and images
 * are on the `variants` array.
 */
export const ProductSchema = z.object({
  id: IdSchema,

  /** Optional family-level SKU prefix */
  skuPrefix: z.string().optional(),

  // ─── Resolved Localized Content (for current locale) ──────────────

  /** Resolved name for the current locale */
  name: z.string(),
  /** Resolved description for the current locale */
  description: z.string(),
  /** Resolved long description for the current locale */
  longDescription: z.string(),
  /** Current locale code */
  locale: z.string().optional(),

  /** Full localized content object */
  localizedContent: ProductLocalizedContentSchema.optional(),

  // ─── Relationships ────────────────────────────────────────────────

  categoryId: IdSchema.optional(),
  categoryName: z.string().optional(),
  brandId: IdSchema.optional(),
  brandName: z.string().optional(),

  // ─── Media ────────────────────────────────────────────────────────

  /** SPU-level hero/lifestyle imagery */
  mediaSet: ResponsiveMediaSetSchema.optional(),

  /** Lightweight display metadata (non-filterable) */
  displayMeta: z.record(z.string(), z.unknown()).optional(),

  // ─── Flags ────────────────────────────────────────────────────────

  isActive: z.boolean().optional(),
  isNew: z.boolean().optional(),

  // ─── Aggregate Ratings ────────────────────────────────────────────

  rating: RatingSchema,
  reviewsCount: z.number(),

  // ─── Variants (SKUs) ──────────────────────────────────────────────

  /** All purchasable SKUs for this product */
  variants: z.array(VariantSchema).optional(),

  // ─── Tags & Attributes ────────────────────────────────────────────

  tags: z.array(TagSchema).optional(),
  attributes: z.array(ProductAttributeValueSchema).optional(),
});

export type Product = z.infer<typeof ProductSchema>;

/** Input type for creating a new product */
export const CreateProductSchema = ProductSchema.omit({ id: true });
export type CreateProduct = z.infer<typeof CreateProductSchema>;

/** Input type for updating an existing product */
export const UpdateProductSchema = CreateProductSchema.partial().extend({
  id: IdSchema,
});
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;

/**
 * Domain methods for Product entity (SPU level)
 *
 * All pricing, stock, and discount logic is delegated to the variant layer.
 */
export class ProductEntity {
  /**
   *
   */
  constructor(private product: Product) {}

  // ─── Content ──────────────────────────────────────────────────────

  /** Returns localized name with fallback */
  getName(locale: Locale): string {
    const localized = resolveLocalizedString(this.product.localizedContent?.name, locale);
    return localized || this.product.name;
  }

  /** Returns localized description with fallback */
  getDescription(locale: Locale): string {
    const localized = resolveLocalizedString(this.product.localizedContent?.description, locale);
    return localized || this.product.description;
  }

  // ─── Variant Access ───────────────────────────────────────────────

  /** Returns all variants */
  getVariants(): Variant[] {
    return this.product.variants || [];
  }

  /** Returns the default / first active variant */
  getDefaultVariant(): Variant | undefined {
    const variants = this.getVariants();
    return variants.find((v) => v.variantKey === "default") || variants[0];
  }

  /** Returns a variant by its key */
  getVariantByKey(key: string): Variant | undefined {
    return this.getVariants().find((v) => v.variantKey === key);
  }

  /** Returns a variant by its ID */
  getVariantById(id: ID): Variant | undefined {
    return this.getVariants().find((v) => v.id === id);
  }

  // ─── Price (delegated to default variant) ─────────────────────────

  /**
   * Returns the display price from the default variant.
   * This is a convenience for product cards / listing pages.
   */
  getDisplayPrice(): number {
    const variant = this.getDefaultVariant();
    return variant?.basePrice ?? 0;
  }

  /**
   * Returns the strike price from the default variant.
   */
  getStrikePrice(): number | undefined {
    return this.getDefaultVariant()?.strikePrice ?? undefined;
  }

  /**
   * Checks if ANY variant has a discount (strike > base).
   */
  hasDiscount(): boolean {
    return this.getVariants().some((v) => {
      const entity = new VariantEntity(v);
      return entity.getDiscountPercentage() > 0;
    });
  }

  /**
   * Returns the discount percentage of the default variant.
   */
  getDiscountPercentage(): number {
    const variant = this.getDefaultVariant();
    if (!variant) return 0;
    return new VariantEntity(variant).getDiscountPercentage();
  }

  // ─── Stock (delegated to default variant) ─────────────────────────

  /**
   * Checks if ANY active variant is in stock.
   */
  isInStock(): boolean {
    return this.getVariants()
      .filter((v) => v.isActive)
      .some((v) => new VariantEntity(v).isInStock());
  }

  /**
   * Checks if ALL variants are low on stock.
   */
  isLowStock(): boolean {
    const activeVariants = this.getVariants().filter((v) => v.isActive);
    if (activeVariants.length === 0) return false;
    return activeVariants.every((v) => new VariantEntity(v).isLowStock());
  }

  // ─── Data ─────────────────────────────────────────────────────────

  /** Returns the raw product data */
  getData(): Product {
    return this.product;
  }
}
