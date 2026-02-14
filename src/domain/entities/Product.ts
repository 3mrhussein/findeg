/**
 * Domain Entity: Product
 *
 * Core Product entity representing a sellable item in the store.
 * Contains business logic for pricing, stock, and discount calculations.
 *
 * In Clean Architecture, entities are the most fundamental layer
 * and should not depend on anything else.
 */

/** Single variant option (e.g., "Blue" for Color variant) */
export interface ProductVariantOption {
  value: string;
  label: string;
  priceModifier: number;
  stock: number;
}

/** A product variant group (e.g., "Color" with multiple options) */
export interface ProductVariant {
  /** Variant group name (e.g., "Color", "Size") */
  name: string;
  /** Available options for this variant group */
  options: ProductVariantOption[];
}

/**
 * Product Domain Interface
 *
 * Represents a fully-hydrated product with translations resolved
 * to the requested language.
 */
export interface Product {
  id: number;
  /** Unique stock-keeping unit (e.g., "STD-PEN-001") */
  sku?: string;
  name: string;
  price: number;
  strikePrice?: number;
  description: string;
  longDescription: string;
  imageUrl?: string;
  images: string[];
  /** FK reference to category */
  categoryId?: number;
  /** Resolved category name (for display) */
  categoryName?: string;
  /** FK reference to brand */
  brandId?: number;
  /** Resolved brand name (for display) */
  brandName?: string;
  /** Whether the product is visible in the storefront */
  isActive?: boolean;
  /** Current stock quantity */
  stockQuantity?: number;
  /** Alert threshold for low-stock warnings */
  lowStockThreshold?: number;
  isNew?: boolean;
  rating: number;
  reviewsCount: number;
  variants?: {
    [key: string]: ProductVariant;
  };
}

/**
 * Domain methods for Product entity
 *
 * Encapsulates business rules like price calculation,
 * stock checking, and discount logic.
 */
export class ProductEntity {
  /**
   * Creates a ProductEntity wrapper around raw product data.
   * @param product - The product data to wrap
   */
  constructor(private product: Product) {}

  /**
   * Calculate the final price including variant modifiers.
   * @param variantSelections - Map of variant key to selected option value
   * @returns Final computed price
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
   * Check if product is in stock.
   * Uses stockQuantity if available, otherwise checks variant-level stock.
   * @param variantSelections - Optional variant selections to check specific variant stock
   * @returns True if the product (or selected variant) is in stock
   */
  isInStock(variantSelections?: { [key: string]: string }): boolean {
    // Check base stock quantity first
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
   * Check if stock is below the low-stock threshold.
   * @returns True if stock is at or below the threshold
   */
  isLowStock(): boolean {
    const quantity = this.product.stockQuantity ?? 0;
    const threshold = this.product.lowStockThreshold ?? 10;
    return quantity > 0 && quantity <= threshold;
  }

  /**
   * Check if product has a discount (strike price higher than current price).
   * @returns True if a discount exists
   */
  hasDiscount(): boolean {
    return !!this.product.strikePrice && this.product.strikePrice > this.product.price;
  }

  /**
   * Calculate the discount percentage.
   * @returns Integer percentage (e.g., 25 for 25% off), or 0 if no discount
   */
  getDiscountPercentage(): number {
    if (!this.hasDiscount()) return 0;
    return Math.round(
      ((this.product.strikePrice! - this.product.price) / this.product.strikePrice!) * 100,
    );
  }

  /**
   * Get a shallow copy of the product data.
   * @returns Product data object
   */
  getData(): Product {
    return { ...this.product };
  }
}
