import { cart, addToCart, setCartQuantity, removeFromCart } from '@findeg/domain/orders';
import type { VariantId } from '@findeg/domain/catalog';
/**
 * Domain Entity: Cart
 *
 * Represents a shopping cart with business logic for cart operations.
 * Cart items now reference specific variants (SKUs) with resolved pricing.
 */

import { type Price, type Quantity } from '@findeg/backend/features/core/domain/types/common';

/**
 * A single item in the cart, referencing a specific variant (SKU).
 *
 * All pricing is pre-resolved at add-to-cart time using the variant's
 * price list for the customer's group and selected UOM.
 */
export type CartItem = {
  /** Product SPU ID */
  productId: number;

  /** Variant (SKU) ID — the canonical identifier for de-duplication */
  variantId: number;

  /** SKU code frozen at add-to-cart time */
  sku: string;

  /** Resolved localized product name */
  productName: string;

  /** Resolved localized variant label (e.g., "Blue 0.7mm") */
  variantLabel: string;

  /** First image from the variant */
  imageUrl?: string;

  /** How many of this variant */
  quantity: Quantity;

  /** Resolved unit price for the variant */
  unitPrice: Price;

  /** Currency code */
  currency: string;
};

/**
 * Domain Entity: Cart
 *
 * Represents a shopping cart with business logic for cart operations.
 * Items are keyed by variantId for de-duplication.
 */
export class CartEntity {
  /**
   *
   */
  constructor(private items: CartItem[] = []) {
    const normalized = cart(
      items.map((item) => ({ variantId: item.variantId as VariantId, quantity: item.quantity })),
    );
    this.items = normalized.lines.map((line) => ({
      ...items.find((item) => item.variantId === line.variantId)!,
      quantity: line.quantity,
    }));
  }

  private domainCart() {
    return cart(
      this.items.map((item) => ({
        variantId: item.variantId as VariantId,
        quantity: item.quantity,
      })),
    );
  }

  /**
   * Add a variant to the cart or increment quantity if already present.
   * Matches by variantId.
   */
  addItem(item: CartItem): CartItem[] {
    const next = addToCart(this.domainCart(), {
      variantId: item.variantId as VariantId,
      quantity: item.quantity,
    });
    return next.lines.map((line) => ({
      ...(this.items.find((current) => current.variantId === line.variantId) ?? item),
      quantity: line.quantity,
    }));
  }

  /**
   * Remove an item from the cart by variantId.
   */
  removeItem(variantId: number): CartItem[] {
    const next = removeFromCart(this.domainCart(), variantId as VariantId);
    return next.lines.map((line) => this.items.find((item) => item.variantId === line.variantId)!);
  }

  /**
   * Update the quantity of a specific item.
   * Domain validates the line quantity.
   */
  updateItemQuantity(variantId: number, quantity: number): CartItem[] {
    // Keep the legacy no-op when the variant is absent; validate quantities through Domain.
    if (!this.items.some((item) => item.variantId === variantId)) {
      cart([{ variantId: variantId as VariantId, quantity }]);
      return [...this.items];
    }
    const next = setCartQuantity(this.domainCart(), variantId as VariantId, quantity);
    return next.lines.map((line) => ({
      ...this.items.find((item) => item.variantId === line.variantId)!,
      quantity: line.quantity,
    }));
  }

  /**
   * Calculate total number of items in the cart (sum of quantities).
   */
  getTotalItems(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Calculate total price of all items in the cart.
   * Simple: unitPrice × quantity for each item.
   */
  getTotalPrice(): number {
    return this.items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  }

  /** Clear all items from the cart */
  clear(): CartItem[] {
    return [];
  }

  /** Get a shallow copy of the current cart items */
  getItems(): CartItem[] {
    return [...this.items];
  }
}
