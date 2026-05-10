/**
 * Domain Entity: Product (SPU)
 *
 * Products are Standard Product Units — the conceptual item.
 * Purchasable details (price, stock, images) live on Variant (SKU) entities.
 *
 * A Product always has at least one variant. Simple products have a single
 * "default" variant; multi-variant products have variants for each color/size/etc.
 */

import { z } from 'zod';
import { products } from '@findeg/db/schema';
import { type InferSelectModel } from 'drizzle-orm';

import { TagSchema } from './Tag';
import { ProductAttributeValueSchema } from './AttributeDefinition';
import { VariantSchema, type Variant, VariantEntity } from './Variant';
import { ResponsiveMediaSetSchema, pick } from '../../../core/domain/value-objects';
import { ID, IdSchema, Locale, RatingSchema, TranslationMapSchema } from '@findeg/db/types';
export const ProductLocalizedContentSchema = z.object({
  name: TranslationMapSchema,
  description: TranslationMapSchema,
  longDescription: TranslationMapSchema,
});
export type ProductLocalizedContent = z.infer<typeof ProductLocalizedContentSchema>;

/**
 * Product Domain Schema (SPU)
 */
export const ProductSchema = z.object({
  id: IdSchema,

  slug: z.string(),
  localizedName: TranslationMapSchema.optional(),
  localizedDescription: TranslationMapSchema.optional(),
  localizedLongDescription: TranslationMapSchema.optional(),

  // Resolved Content (for specific locale)
  name: z.string(),
  description: z.string(),
  longDescription: z.string(),
  locale: z.string().optional(),

  // Legacy/Compatibility mapping
  localizedContent: ProductLocalizedContentSchema.optional(),

  // Relationships
  categoryId: IdSchema.optional(),
  categoryName: z.string().optional(),
  brandId: IdSchema.optional(),
  brandName: z.string().optional(),

  // Media
  mediaSet: ResponsiveMediaSetSchema.optional(),
  isActive: z.boolean().default(true),

  // Aggregate Ratings
  rating: RatingSchema,
  reviewsCount: z.number(),

  // Hydrated children
  variants: z.array(VariantSchema).optional(),
  tags: z.array(TagSchema).optional(),
  attributes: z.array(ProductAttributeValueSchema).optional(),

  // Timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type Product = z.infer<typeof ProductSchema> &
  Partial<
    Omit<
      InferSelectModel<typeof products>,
      | 'localizedName'
      | 'localizedDescription'
      | 'localizedLongDescription'
      | 'rating'
      | 'reviewsCount'
    >
  >;

export type CreateProduct = z.infer<typeof CreateProductSchema>;

export const CreateProductSchema = ProductSchema.omit({ id: true });
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

  getName(locale: Locale): string {
    return pick(this.product.localizedContent?.name, locale) || this.product.name;
  }

  getSlug(): string {
    return this.product.slug;
  }

  getDescription(locale: Locale): string {
    return pick(this.product.localizedContent?.description, locale) || this.product.description;
  }

  getLongDescription(locale: Locale): string {
    return (
      pick(this.product.localizedContent?.longDescription, locale) || this.product.longDescription
    );
  }

  getAvailableLocales(): Locale[] {
    const locales = new Set<Locale>();
    if (this.product.localizedContent?.name) {
      Object.keys(this.product.localizedContent.name).forEach((k) => locales.add(k as Locale));
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
    return variants.find((v) => v.variantKey === 'default') || variants[0];
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
    return Number(variant?.basePrice ?? 0);
  }

  getStrikePrice(): number | undefined {
    const strike = this.getDefaultVariant()?.strikePrice;
    return strike !== undefined ? Number(strike) : undefined;
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
    return this.product.tags?.some((t) => t.key === 'campaign:new-arrival') ?? false;
  }

  // ─── Data ─────────────────────────────────────────────────────────

  getData(): Product {
    return this.product;
  }
}
