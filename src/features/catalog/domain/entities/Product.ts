/**
 * Domain Entity: Product
 *
 * Core Product entity representing a sellable item in the store.
 * Contains business logic for pricing, stock, and discount calculations.
 */

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
  resolveLocalizedString,
  toMoney,
  type CurrencyCode,
  type Locale,
  type LocalizedString,
  type Money,
} from "@/features/core/domain/value-objects";

/** Single variant option (e.g., "Blue" for Color variant) */
export interface ProductVariantOption {
  value: string;
  label: string;
  priceModifier: Price;
  stock: Quantity;
}

/** A product variant group (e.g., "Color" with multiple options) */
export interface ProductVariant {
  name: string;
  options: ProductVariantOption[];
}

/** Sellable unit definition for a variant key */
export interface ProductVariantSellableUom {
  uomCode: UomCode;
  factorToBase: number;
  isEnabled: boolean;
}

/** Price-list row for a variant key and customer group */
export interface ProductVariantPrice {
  customerGroup: CustomerGroup;
  uomCode: UomCode;
  unitPrice: Price;
  currency: CurrencyCode;
  isSellable: boolean;
}

/** Commercial configuration for a single variant key */
export interface ProductVariantCommercialConfig {
  variantKey: string;
  sellableUoms: ProductVariantSellableUom[];
  priceLists: ProductVariantPrice[];
}

/**
 * Localized content map for a product across supported locales.
 */
export type TranslatedProductName = LocalizedString;
export type TranslatedProductDescription = LocalizedString;
export type TranslatedProductLongDescription = LocalizedString;

/**
 * Backward-compatible aliases for previous naming.
 */
export type LocalizedProductName = TranslatedProductName;
export type LocalizedProductDescription = TranslatedProductDescription;
export type LocalizedProductLongDescription = TranslatedProductLongDescription;

export interface ProductLocalizedContent {
  name: TranslatedProductName;
  description: TranslatedProductDescription;
  longDescription: TranslatedProductLongDescription;
}

/**
 * Product Domain Interface
 *
 * Represents a fully-hydrated product with translations resolved to the requested language.
 */
export interface Product {
  id: ID;
  sku?: Sku;
  name: string;
  price: Price;
  strikePrice?: Price;
  description: string;
  longDescription: string;
  /**
   * Current resolved locale used to hydrate string fields above.
   */
  locale?: Locale;
  /**
   * Full or partial localized value-object payload.
   */
  localizedContent?: ProductLocalizedContent;
  /**
   * Currency metadata for numeric legacy price fields.
   */
  currency?: CurrencyCode;
  /**
   * Rich money value-objects (forward-compatible with future pricing model).
   */
  priceMoney?: Money;
  strikePriceMoney?: Money;
  imageUrl?: string;
  images: string[];
  categoryId?: ID;
  categoryName?: string;
  brandId?: ID;
  brandName?: string;
  isActive?: boolean;
  stockQuantity?: Quantity;
  lowStockThreshold?: Quantity;
  isNew?: boolean;
  rating: Rating;
  reviewsCount: number;
  variants?: { [key: string]: ProductVariant };
  variantCommercialConfig?: Record<string, ProductVariantCommercialConfig>;
}

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
      this.product.priceMoney || toMoney(this.product.price, this.product.currency || DEFAULT_CURRENCY)
    );
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
      (this.product.strikePrice !== undefined ? toMoney(this.product.strikePrice, currency) : undefined);

    return {
      ...this.product,
      currency,
      priceMoney,
      strikePriceMoney,
    };
  }
}
