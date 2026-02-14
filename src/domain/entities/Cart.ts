/**
 * Domain Entity: Cart
 *
 * Represents a shopping cart with business logic for cart operations.
 *
 * CartItem is a flat type (Product & { quantity, selectedVariant })
 * because the presentation layer references item.id, item.name,
 * item.price, etc. directly.
 */

import type { Product } from "./Product";

export type CartItem = Product & {
  quantity: number;
  selectedVariant?: { [key: string]: string };
};

/**
 *
 */
export class CartEntity {
  /**
   *
   */
  constructor(private items: CartItem[] = []) {}

  /**
   * Add item to cart or update quantity if exists
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
   * Remove item from cart
   */
  removeItem(productId: number, selectedVariant?: { [key: string]: string }): CartItem[] {
    const variantId = this.getVariantId(selectedVariant);
    return this.items.filter(
      (item) => !(item.id === productId && this.getVariantId(item.selectedVariant) === variantId),
    );
  }

  /**
   * Update item quantity
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
   * Calculate total number of items in cart
   */
  getTotalItems(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Calculate total price of cart
   */
  getTotalPrice(): number {
    return this.items.reduce((total, item) => {
      // Calculate price including variant modifiers
      let itemPrice = item.price;
      if (item.selectedVariant && item.variants) {
        Object.entries(item.selectedVariant).forEach(([variantKey, optionValue]) => {
          const variant = item.variants?.[variantKey];
          if (variant) {
            const option = variant.options.find((opt) => opt.value === optionValue);
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
   * Clear all items from cart
   */
  clear(): CartItem[] {
    return [];
  }

  /**
   * Get all items
   */
  getItems(): CartItem[] {
    return [...this.items];
  }

  /**
   * Generate a unique identifier for a variant combination
   */
  private getVariantId(selectedVariant?: { [key: string]: string }): string {
    if (!selectedVariant) return "";
    return JSON.stringify(selectedVariant);
  }
}
