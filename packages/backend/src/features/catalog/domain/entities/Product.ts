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
} from "../../../core/domain/types/common";
import { TagSchema } from "./Tag";
import { ProductAttributeValueSchema } from "./AttributeDefinition";
import { VariantSchema, type Variant, VariantEntity } from "./Variant";
import {
  resolveLocalizedString,
  ResponsiveMediaSetSchema,
  type LocalizedString,
  type ResponsiveMediaSet,
} from "../../../core/domain/value-objects";
import { type SupportedLocale } from "../../../core/domain/types/locale";

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

  name: z.string(),
  description: z.string(),
  longDescription: z.string(),
  locale: z.string().optional(),

  localizedContent: ProductLocalizedContentSchema.optional(),

  // ─── Relationships ────────────────────────────────────────────────

  categoryId: IdSchema.optional(),
  categoryName: z.string().optional(),
  brandId: IdSchema.optional(),
  brandName: z.string().optional(),

  // ─── Media ────────────────────────────────────────────────────────

  /** SPU-level hero/lifestyle imagery */
  mediaSet: ResponsiveMediaSetSchema.optional(),

  isActive: z.boolean().optional(),

  // ─── Aggregate Ratings ────────────────────────────────────────────

  rating: RatingSchema,
  reviewsCount: z.number(),

  // ─── Variants (SKUs) ──────────────────────────────────────────────

  variants: z.array(VariantSchema).optional(),

  // ─── Tags & Attributes ────────────────────────────────────────────

  tags: z.array(TagSchema).optional(),
  attributes: z.array(ProductAttributeValueSchema).optional(),

  // ─── Timestamps ───────────────────────────────────────────────────

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

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
  constructor(private product: Product) {}

  // ─── Content ──────────────────────────────────────────────────────

  // ─── Content ────────────

  getName(locale: SupportedLocale): string {
    return (
      this.product.localizedContent?.name?.[locale] ??
      this.product.localizedContent?.name?.en ??
      this.product.name
    );
  }

  getSlug(locale: SupportedLocale): string {
    return (
      this.product.localizedContent?.slug?.[locale] ?? this.product.localizedContent?.slug?.en ?? ""
    );
  }

  getDescription(locale: SupportedLocale): string {
    return (
      this.product.localizedContent?.description?.[locale] ??
      this.product.localizedContent?.description?.en ??
      this.product.description
    );
  }

  getLongDescription(locale: SupportedLocale): string {
    return (
      this.product.localizedContent?.longDescription?.[locale] ??
      this.product.localizedContent?.longDescription?.en ??
      this.product.longDescription
    );
  }

  getAvailableLocales(): SupportedLocale[] {
    const locales = new Set<SupportedLocale>();
    if (this.product.localizedContent?.name) {
      Object.keys(this.product.localizedContent.name).forEach((k) =>
        locales.add(k as SupportedLocale),
      );
    }
    return Array.from(locales);
  }

  // ─── Variant Access ───────────────────────────────────────────────

  getVariants(): Variant[] {
    return this.product.variants || [];
  }

  /** Returns the default / first active variant */
  getDefaultVariant(): Variant | undefined {
    const variants = this.getVariants();
    return variants.find((v) => v.variantKey === "default") || variants[0];
  }

  getVariantByKey(key: string): Variant | undefined {
    return this.getVariants().find((v) => v.variantKey === key);
  }

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

  getStrikePrice(): number | undefined {
    return this.getDefaultVariant()?.strikePrice ?? undefined;
  }

  hasDiscount(): boolean {
    return this.getVariants().some((v) => {
      const entity = new VariantEntity(v);
      return entity.getDiscountPercentage() > 0;
    });
  }

  getDiscountPercentage(): number {
    const variant = this.getDefaultVariant();
    if (!variant) return 0;
    return new VariantEntity(variant).getDiscountPercentage();
  }

  // ─── Stock (delegated to default variant) ─────────────────────────

  isInStock(): boolean {
    return this.getVariants()
      .filter((v) => v.isActive)
      .some((v) => new VariantEntity(v).isInStock());
  }

  isLowStock(): boolean {
    const activeVariants = this.getVariants().filter((v) => v.isActive);
    if (activeVariants.length === 0) return false;
    return activeVariants.every((v) => new VariantEntity(v).isLowStock());
  }

  // ─── Status ───────────────────────────────────────────────────────

  isNew(): boolean {
    return this.product.tags?.some((t) => t.key === "campaign:new-arrival") ?? false;
  }

  // ─── Data ─────────────────────────────────────────────────────────

  getData(): Product {
    return this.product;
  }
}
