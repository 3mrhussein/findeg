/**
 * Domain Entity: Product
 *
 * Core Product entity representing a sellable item in the store.
 * Contains business logic for pricing, stock, and discount calculations.
 */

import { z } from "zod";
import {
  IdSchema,
  PriceSchema,
  SkuSchema,
  QuantitySchema,
  RatingSchema,
  CustomerGroupSchema,
  UomCodeSchema,
  type ID,
  type Price,
  type Sku,
  type Quantity,
  type Rating,
  type CustomerGroup,
  type UomCode,
} from "@/features/core/domain/types/common";
import {
  DEFAULT_CURRENCY,
  resolveLocalizedString,
  resolvePricing,
  LocalizedStringSchema,
  PersistedPricingSchema,
  ResolvedPricingSchema,
  ResponsiveMediaSetSchema,
  MoneySchema,
  type DiscountRule,
  toMoney,
  type CurrencyCode,
  type Locale,
  type LocalizedString,
  type PersistedPricing,
  type ResolvedPricing,
  type ResponsiveMediaSet,
  type Money,
} from "@/features/core/domain/value-objects";

/** Single variant option (e.g., "Blue" for Color variant) */
export const ProductVariantOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  priceModifier: PriceSchema,
  stock: QuantitySchema,
});
export type ProductVariantOption = z.infer<typeof ProductVariantOptionSchema>;

/** A product variant group (e.g., "Color" with multiple options) */
export const ProductVariantSchema = z.object({
  name: z.string(),
  options: z.array(ProductVariantOptionSchema),
});
export type ProductVariant = z.infer<typeof ProductVariantSchema>;

/** Sellable unit definition for a variant key */
export const ProductVariantSellableUomSchema = z.object({
  uomCode: UomCodeSchema,
  factorToBase: z.number(),
  isEnabled: z.boolean(),
});
export type ProductVariantSellableUom = z.infer<typeof ProductVariantSellableUomSchema>;

/** Price-list row for a variant key and customer group */
export const ProductVariantPriceSchema = z.object({
  customerGroup: CustomerGroupSchema,
  uomCode: UomCodeSchema,
  unitPrice: PriceSchema,
  currency: z.string(), // CurrencyCode
  isSellable: z.boolean(),
});
export type ProductVariantPrice = z.infer<typeof ProductVariantPriceSchema>;

/** Commercial configuration for a single variant key */
export const ProductVariantCommercialConfigSchema = z.object({
  variantKey: z.string(),
  sellableUoms: z.array(ProductVariantSellableUomSchema),
  priceLists: z.array(ProductVariantPriceSchema),
});
export type ProductVariantCommercialConfig = z.infer<typeof ProductVariantCommercialConfigSchema>;

/** Localized content map for a product */
export const ProductLocalizedContentSchema = z.object({
  slug: LocalizedStringSchema.optional(),
  name: LocalizedStringSchema,
  description: LocalizedStringSchema,
  longDescription: LocalizedStringSchema,
});
export type ProductLocalizedContent = z.infer<typeof ProductLocalizedContentSchema>;

/**
 * Product Domain Schema
 */
export const ProductSchema = z.object({
  id: IdSchema,
  sku: SkuSchema.optional(),
  name: z.string(),
  price: PriceSchema,
  strikePrice: PriceSchema.optional(),
  description: z.string(),
  longDescription: z.string(),
  locale: z.string().optional(), // Locale
  localizedContent: ProductLocalizedContentSchema.optional(),
  currency: z.string().optional(), // CurrencyCode
  priceMoney: MoneySchema.optional(),
  strikePriceMoney: MoneySchema.optional(),
  pricing: PersistedPricingSchema.optional(),
  discountRules: z.array(z.any()).optional(), // DiscountRule[]
  resolvedPricing: ResolvedPricingSchema.optional(),
  mediaSet: ResponsiveMediaSetSchema.optional(),
  imageUrl: z.string().optional(),
  images: z.array(z.string()),
  categoryId: IdSchema.optional(),
  categoryName: z.string().optional(),
  brandId: IdSchema.optional(),
  brandName: z.string().optional(),
  isActive: z.boolean().optional(),
  stockQuantity: QuantitySchema.optional(),
  lowStockThreshold: QuantitySchema.optional(),
  isNew: z.boolean().optional(),
  rating: RatingSchema,
  reviewsCount: z.number(),
  variants: z.record(z.string(), ProductVariantSchema).optional(),
  variantCommercialConfig: z.record(z.string(), ProductVariantCommercialConfigSchema).optional(),
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
 * Domain methods for Product entity
 */
export class ProductEntity {
  /**
   * Creates a domain entity wrapper for a Product data object.
   *
   * @param product - The raw product data.
   */
  constructor(private product: Product) {}

  /**
   * Returns localized name with fallback to resolved string name.
   */
  getName(locale: Locale): string {
    const localized = resolveLocalizedString(this.product.localizedContent?.name, locale);
    return localized || this.product.name;
  }

  /**
   * Returns localized description with fallback.
   */
  getDescription(locale: Locale): string {
    const localized = resolveLocalizedString(this.product.localizedContent?.description, locale);
    return localized || this.product.description;
  }

  /**
   * Returns normalized money value for base price.
   */
  getPriceMoney(): Money {
    return (
      this.product.priceMoney ||
      toMoney(this.product.price, this.product.currency || DEFAULT_CURRENCY)
    );
  }

  /**
   * Returns the normalized resolved pricing model.
   * Falls back to legacy numeric fields when v2 pricing is not populated yet.
   */
  getResolvedPricing(): ResolvedPricing {
    const pricing: PersistedPricing = this.product.pricing || {
      base: this.getPriceMoney(),
      tiers: [],
    };
    const discountRules = this.product.discountRules || [];
    const legacyStrike =
      this.product.strikePriceMoney ||
      (this.product.strikePrice !== undefined
        ? toMoney(this.product.strikePrice, this.product.currency || DEFAULT_CURRENCY)
        : undefined);

    const resolved = this.product.resolvedPricing || resolvePricing(pricing, discountRules);
    if (resolved.strikePrice || !legacyStrike) {
      return resolved;
    }

    return {
      ...resolved,
      strikePrice: legacyStrike,
    };
  }

  /**
   * Calculate the final price including variant modifiers.
   *
   * @param variantSelections - Map of variant key to selected option value (e.g., { color: 'blue' }).
   * @returns Final computed price after applying all modifiers.
   */
  calculatePrice(variantSelections?: { [key: string]: string }): number {
    let basePrice = this.product.price;

    if (variantSelections && this.product.variants) {
      Object.entries(variantSelections).forEach(([variantKey, optionValue]) => {
        const variant = this.product.variants?.[variantKey];
        if (variant) {
          const option = variant.options.find((opt) => opt.value === optionValue);
          if (option) {
            basePrice += option.priceModifier;
          }
        }
      });
    }

    return basePrice;
  }

  /**
   * Check if the product (or a specific variant) is available for purchase.
   *
   * @param variantSelections - Optional variant selections to check specific variant stock.
   * @returns True if the product/variant has at least one item available.
   */
  isInStock(variantSelections?: { [key: string]: string }): boolean {
    if (this.product.stockQuantity !== undefined && this.product.stockQuantity !== null) {
      if (this.product.stockQuantity <= 0) return false;
    }

    if (!variantSelections || !this.product.variants) {
      return (this.product.stockQuantity ?? 0) > 0;
    }

    return Object.entries(variantSelections).every(([variantKey, optionValue]) => {
      const variant = this.product.variants![variantKey];
      if (variant) {
        const option = variant.options.find((opt) => opt.value === optionValue);
        return option ? option.stock > 0 : true;
      }
      return true;
    });
  }

  /**
   * Determines if the current stock level is within the warning threshold.
   *
   * @returns True if quantity is positive but less than or equal to threshold.
   */
  isLowStock(): boolean {
    const quantity = this.product.stockQuantity ?? 0;
    const threshold = this.product.lowStockThreshold ?? 10;
    return quantity > 0 && quantity <= threshold;
  }

  /**
   * Checks if the product is currently offered at a discounted rate compared to its strike price.
   */
  hasDiscount(): boolean {
    return !!this.product.strikePrice && this.product.strikePrice > this.product.price;
  }

  /**
   * Calculate the discount percentage relative to the strike price.
   *
   * @returns Integer percentage (e.g., 25 for 25% off).
   */
  getDiscountPercentage(): number {
    if (!this.hasDiscount()) return 0;
    return Math.round(
      ((this.product.strikePrice! - this.product.price) / this.product.strikePrice!) * 100,
    );
  }

  /**
   * Retrieves a plain representation of the product data.
   */
  getData(): Product {
    const currency = this.product.currency || DEFAULT_CURRENCY;
    const priceMoney = this.product.priceMoney || toMoney(this.product.price, currency);
    const strikePriceMoney =
      this.product.strikePriceMoney ||
      (this.product.strikePrice !== undefined
        ? toMoney(this.product.strikePrice, currency)
        : undefined);
    const pricing: PersistedPricing = this.product.pricing || { base: priceMoney, tiers: [] };
    const resolvedPricing = this.getResolvedPricing();

    return {
      ...this.product,
      currency,
      priceMoney,
      strikePriceMoney,
      pricing,
      resolvedPricing,
    };
  }
}
