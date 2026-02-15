/**
 * Domain Entity: Product
 *
 * Core Product entity representing a sellable item in the store.
 * Contains business logic for pricing, stock, and discount calculations.
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
  name: string;
  options: ProductVariantOption[];
}

/**
 * Product Domain Interface
 *
 * Represents a fully-hydrated product with translations resolved to the requested language.
 */
export interface Product {
  id: number;
  sku?: string;
  name: string;
  price: number;
  strikePrice?: number;
  description: string;
  longDescription: string;
  imageUrl?: string;
  images: string[];
  categoryId?: number;
  categoryName?: string;
  brandId?: number;
  brandName?: string;
  isActive?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  isNew?: boolean;
  rating: number;
  reviewsCount: number;
  variants?: { [key: string]: ProductVariant };
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
    return { ...this.product };
  }
}
