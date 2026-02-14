/**
 * Domain Entity: Product
 *
 * This represents the core Product entity in our domain.
 * It contains only business logic and properties, no UI concerns.
 *
 * In Clean Architecture, entities are the most fundamental layer
 * and should not depend on anything else.
 */

export interface ProductVariantOption {
  value: string;
  label: string;
  priceModifier: number;
  stock: number;
}

export interface ProductVariant {
  name: string;
  options: ProductVariantOption[];
}

export interface Product {
  id: number;
  name: string;
  price: number;
  strikePrice?: number;
  description: string;
  longDescription: string;
  imageUrl?: string;
  images: string[];
  category: string;
  isNew?: boolean;
  rating: number;
  reviewsCount: number;
  variants?: {
    [key: string]: ProductVariant;
  };
}

/**
 * Domain methods for Product entity
 */
export class ProductEntity {
  /**
   *
   */
  constructor(private product: Product) {}

  /**
   * Calculate the final price including variant modifiers
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
   * Check if product is in stock
   */
  isInStock(variantSelections?: { [key: string]: string }): boolean {
    if (!variantSelections || !this.product.variants) {
      return true; // Assume in stock if no variants
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
   * Check if product has discount
   */
  hasDiscount(): boolean {
    return !!this.product.strikePrice && this.product.strikePrice > this.product.price;
  }

  /**
   * Calculate discount percentage
   */
  getDiscountPercentage(): number {
    if (!this.hasDiscount()) return 0;
    return Math.round(
      ((this.product.strikePrice! - this.product.price) / this.product.strikePrice!) * 100,
    );
  }

  /**
   * Get the product data
   */
  getData(): Product {
    return { ...this.product };
  }
}
