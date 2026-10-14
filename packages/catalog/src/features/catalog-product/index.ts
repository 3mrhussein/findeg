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
import { TagSchema as tagSchema } from '../catalog-tag/index';
import { ProductAttributeValueSchema as productAttributeValueSchema } from '../catalog-attribute/index';
import {
  VariantSchema as variantSchema,
  type Variant,
  VariantEntity,
} from '../catalog-variant/index';
import { pick } from '../../helpers/index';
import {
  ID,
  IdSchema as idSchema,
  RatingSchema as ratingSchema,
  TranslationMapSchema as translationMapSchema,
} from '@findeg/db/types';
import { LOCALES, type Locale } from '@findeg/domain';
import { defaultVariant, isNewArrival } from '@findeg/domain';
const productLocalizedContentSchema = z.object({
  name: translationMapSchema,
  description: translationMapSchema,
  longDescription: translationMapSchema,
});
export type ProductLocalizedContent = z.infer<typeof productLocalizedContentSchema>;

/**
 * Product Domain Schema (SPU)
 */
const productSchema = z.object({
  id: idSchema,

  slug: z.string(),
  localizedName: translationMapSchema.optional(),
  localizedDescription: translationMapSchema.optional(),
  localizedLongDescription: translationMapSchema.optional(),

  // Resolved Content (for specific locale)
  name: z.string(),
  description: z.string(),
  longDescription: z.string(),
  locale: z.string().optional(),

  // Legacy/Compatibility mapping
  localizedContent: productLocalizedContentSchema.optional(),

  // Relationships
  categoryId: idSchema.optional(),
  categoryName: z.string().optional(),
  brandId: idSchema.optional(),
  brandName: z.string().optional(),

  // Media
  // Media (Now delegated to variants)
  isActive: z.boolean().default(true),

  // Aggregate Ratings
  rating: ratingSchema,
  reviewsCount: z.number(),

  // Hydrated children
  hydratedDefaultVariant: variantSchema.optional(),
  variants: z.array(variantSchema).optional(),
  tags: z.array(tagSchema).optional(),
  attributes: z.array(productAttributeValueSchema).optional(),

  // Timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type Product = z.infer<typeof productSchema>;

export type CreateProduct = z.infer<typeof createProductSchema>;

const createProductSchema = productSchema.omit({ id: true });
/** Input type for updating an existing product */
const updateProductSchema = createProductSchema.partial().extend({
  id: idSchema,
});
export type UpdateProduct = z.infer<typeof updateProductSchema>;

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
    return LOCALES.filter((locale) => this.product.localizedContent?.name[locale] !== undefined);
  }

  // ─── Variant Access ───────────────────────────────────────────────

  getVariants(): Variant[] {
    return this.product.variants || [];
  }

  /** The Default Variant, as the domain chooses it: the flagged variant, else the first in order. */
  getDefaultVariant(): Variant | undefined {
    if (this.product.hydratedDefaultVariant) {
      return this.product.hydratedDefaultVariant;
    }
    return defaultVariant(this.getVariants());
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

  /** A New Arrival carries the `new-arrival` tag, whatever its group. */
  isNew(): boolean {
    return isNewArrival(this.product.tags ?? []);
  }

  // ─── Data ─────────────────────────────────────────────────────────

  getData(): Product {
    return this.product;
  }
}

// ─── Plain-function accessors for consumers outside the backend package ──────
// ProductEntity stays internal (ADR-0001: barrels never export concrete
// classes); these wrap the handful of methods frontend call sites need.

export function isNewProduct(product: Product): boolean {
  return new ProductEntity(product).isNew();
}

export function getProductDisplayPrice(product: Product): number {
  return new ProductEntity(product).getDisplayPrice();
}

export {
  productLocalizedContentSchema as ProductLocalizedContentSchema,
  productSchema as ProductSchema,
  createProductSchema as CreateProductSchema,
  updateProductSchema as UpdateProductSchema,
};
