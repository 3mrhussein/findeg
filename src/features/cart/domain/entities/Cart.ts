import { CustomerGroup, Price, Quantity, UomCode } from "@/features/core/domain/types/common";
import type { Product } from "@/features/catalog/domain/entities/Product";
import type { VariantSnapshot } from "@/features/order/domain/value-objects";

export type CartItem = Product & {
  quantity: Quantity;
  selectedVariant?: VariantSnapshot;
  variant?: VariantSnapshot;
  variantKey?: string;
  uomCode?: UomCode;
  customerGroup?: CustomerGroup;
  unitPriceSnapshot?: Price;
  currency?: string;
};

/**
 * Domain Entity: Cart
 *
 * Represents a shopping cart with business logic for cart operations.
 */
export class CartEntity {
  /**
   * Creates a new CartEntity.
   * @param items - Initial items in the cart
   */
  constructor(private items: CartItem[] = []) {}

  /**
   * Add a product to the cart or update its quantity if it already exists with the same variants.
   */
  addItem(
    product: Product,
    quantity: number,
    selectedVariant?: { [key: string]: string },
  ): CartItem[] {
    const variantId = this.getVariantId(selectedVariant);
    const existingItemIndex = this.items.findIndex(
      (item) => item.id === product.id && this.getVariantId(item.selectedVariant) === variantId,
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...this.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
      };
      return updatedItems;
    }

    return [...this.items, { ...product, quantity, selectedVariant }];
  }

  /**
   * Remove an item from the cart based on product ID and variant selection.
   */
  removeItem(productId: number, selectedVariant?: { [key: string]: string }): CartItem[] {
    const variantId = this.getVariantId(selectedVariant);
    return this.items.filter(
      (item) => !(item.id === productId && this.getVariantId(item.selectedVariant) === variantId),
    );
  }

  /**
   * Update the quantity of a specific item in the cart.
   */
  updateItemQuantity(
    productId: number,
    quantity: number,
    selectedVariant?: { [key: string]: string },
  ): CartItem[] {
    if (quantity <= 0) {
      return this.removeItem(productId, selectedVariant);
    }

    const variantId = this.getVariantId(selectedVariant);
    return this.items.map((item) =>
      item.id === productId && this.getVariantId(item.selectedVariant) === variantId
        ? { ...item, quantity }
        : item,
    );
  }

  /**
   * Calculate total number of items in the cart (sum of quantities).
   */
  getTotalItems(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Calculate total price of all items in the cart, including variant modifiers.
   */
  getTotalPrice(): number {
    return this.items.reduce((total, item) => {
      if (item.unitPriceSnapshot !== undefined && item.unitPriceSnapshot !== null) {
        return total + item.unitPriceSnapshot * item.quantity;
      }

      let itemPrice = item.price;
      if (item.selectedVariant && item.variants) {
        Object.entries(item.selectedVariant).forEach(([variantKey, optionValue]) => {
          const variant = item.variants?.[variantKey];
          if (variant) {
            const option = variant.options.find((opt) => opt.value === String(optionValue));
            if (option) {
              itemPrice += option.priceModifier;
            }
          }
        });
      }
      return total + itemPrice * item.quantity;
    }, 0);
  }

  /**
   * Clear all items from the cart.
   */
  clear(): CartItem[] {
    return [];
  }

  /**
   * Get a shallow copy of the current cart items.
   */
  getItems(): CartItem[] {
    return [...this.items];
  }

  /**
   * Generate a unique identifier for a variant combination for comparison.
   */
  private getVariantId(selectedVariant?: VariantSnapshot): string {
    if (!selectedVariant) return "";
    return JSON.stringify(selectedVariant);
  }
}
