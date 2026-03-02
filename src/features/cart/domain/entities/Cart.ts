/**
 * Domain Entity: Cart
 *
 * Represents a shopping cart with business logic for cart operations.
 * Cart items now reference specific variants (SKUs) with resolved pricing.
 */

import {
  type CustomerGroup,
  type Price,
  type Quantity,
  type UomCode,
} from "@/features/core/domain/types/common";

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

  /** Which UOM was selected (EA, PACK_3, etc.) */
  uomCode: UomCode;

  /** UOM factor at time of add (for display purposes) */
  uomFactor: number;

  /** Resolved unit price for the customer's group + UOM */
  unitPrice: Price;

  /** Currency code */
  currency: string;

  /** Customer group used for price resolution */
  customerGroup?: CustomerGroup;
};

/**
 * Domain Entity: Cart
 *
 * Represents a shopping cart with business logic for cart operations.
 * Items are keyed by (variantId + uomCode) for de-duplication.
 */
export class CartEntity {
  /**
   *
   */
  constructor(private items: CartItem[] = []) {}

  /**
   * Add a variant to the cart or increment quantity if already present.
   * Matches by variantId + uomCode.
   */
  addItem(item: CartItem): CartItem[] {
    const existingIndex = this.items.findIndex(
      (existing) => existing.variantId === item.variantId && existing.uomCode === item.uomCode,
    );

    if (existingIndex >= 0) {
      const updatedItems = [...this.items];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + item.quantity,
      };
      return updatedItems;
    }

    return [...this.items, item];
  }

  /**
   * Remove an item from the cart by variantId + uomCode.
   */
  removeItem(variantId: number, uomCode: UomCode): CartItem[] {
    return this.items.filter((item) => !(item.variantId === variantId && item.uomCode === uomCode));
  }

  /**
   * Update the quantity of a specific item.
   * Removes the item if quantity is 0 or negative.
   */
  updateItemQuantity(variantId: number, uomCode: UomCode, quantity: number): CartItem[] {
    if (quantity <= 0) {
      return this.removeItem(variantId, uomCode);
    }

    return this.items.map((item) =>
      item.variantId === variantId && item.uomCode === uomCode ? { ...item, quantity } : item,
    );
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
