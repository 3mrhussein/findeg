/**
 * Cart Service
 */

import { CartEntity, CartItem } from "../../domain/entities/Cart";
import { Product } from "@/features/catalog/domain/entities/Product";
import { ICartService } from "../interfaces/ICartService";
import { CustomerGroup, Price, UomCode } from "@/features/core/domain/types/common";
import { VariantSnapshot } from "@/features/order/domain/value-objects";

/**
 * Cart Service
 *
 * Handles shopping cart business logic including adding, removing, and updating items.
 * Delegates to CartEntity for domain logic and calculations.
 */
export class CartService implements ICartService {
  /**
   * Adds a product to an existing array of cart items.
   * Logic for merging duplicates or handling variants is delegated to CartEntity.
   *
   * @param items - Current list of items in the cart.
   * @param product - The product entity to add.
   * @param quantity - Number of units to add.
   * @param selectedVariant - Optional selection of attributes (e.g., color, size).
   * @returns Updated list of cart items.
   */
  addToCart(
    items: CartItem[],
    product: Product,
    quantity: number,
    selectedVariant?: { [key: string]: string },
  ): CartItem[] {
    const cart = new CartEntity(items);
    return cart.addItem(product, quantity, selectedVariant);
  }

  /**
   * Removes an item from the cart based on product ID and optional variant selection.
   *
   * @param items - Current list of items in the cart.
   * @param productId - ID of the product to remove.
   * @param selectedVariant - Optional variant selection to match precisely.
   * @returns Updated list of cart items.
   */
  removeFromCart(
    items: CartItem[],
    productId: number,
    selectedVariant?: { [key: string]: string },
  ): CartItem[] {
    const cart = new CartEntity(items);
    return cart.removeItem(productId, selectedVariant);
  }

  /**
   * Updates the exact quantity of an item in the cart.
   *
   * @param items - Current list of items in the cart.
   * @param productId - ID of the product to update.
   * @param quantity - The new desired quantity.
   * @param selectedVariant - Optional variant selection.
   * @returns Updated list of cart items.
   */
  updateQuantity(
    items: CartItem[],
    productId: number,
    quantity: number,
    selectedVariant?: { [key: string]: string },
  ): CartItem[] {
    const cart = new CartEntity(items);
    return cart.updateItemQuantity(productId, quantity, selectedVariant);
  }

  /**
   * Computes aggregated totals (total price and total item count) for the given cart items.
   *
   * @param items - The list of cart items to evaluate.
   * @returns Object containing totalItems and totalPrice.
   */
  getTotals(items: CartItem[]) {
    const cart = new CartEntity(items);
    return {
      totalItems: cart.getTotalItems(),
      totalPrice: cart.getTotalPrice(),
    };
  }

  // In-memory cart storage for API compatibility
  private carts = new Map<string, CartItem[]>();

  /**
   * Retrieves a managed cart by its unique identifier.
   *
   * @param cartId - The session or permanent cart ID.
   * @returns Object containing items, subtotal, and total item count.
   */
  async getCart(
    cartId: string,
  ): Promise<{ items: CartItem[]; subtotal: number; itemCount: number }> {
    const items = this.carts.get(cartId) || [];
    const cart = new CartEntity(items);
    return {
      items,
      subtotal: cart.getTotalPrice(),
      itemCount: cart.getTotalItems(),
    };
  }

  /**
   * Adds an item to a managed cart by its ID.
   * This is used by API routes or server-side session management.
   *
   * @param cartId - The cart identifier.
   * @param input - The product and quantity data.
   * @returns The updated cart status.
   */
  async addItem(
    cartId: string,
    input: {
      productId: number;
      quantity: number;
      variant?: VariantSnapshot;
      variantKey?: string;
      uomCode?: UomCode;
      customerGroup?: CustomerGroup;
      unitPriceSnapshot?: Price;
      currency?: string;
    },
  ): Promise<{ items: CartItem[]; subtotal: number; itemCount: number }> {
    const items = this.carts.get(cartId) || [];
    const existing = items.find(
      (i) =>
        i.id === input.productId &&
        i.variantKey === input.variantKey &&
        i.uomCode === input.uomCode &&
        i.customerGroup === input.customerGroup,
    );
    if (existing) {
      existing.quantity += input.quantity;
      if (input.unitPriceSnapshot !== undefined) {
        existing.unitPriceSnapshot = input.unitPriceSnapshot;
      }
    } else {
      items.push({
        id: input.productId,
        quantity: input.quantity,
        variant: input.variant,
        variantKey: input.variantKey,
        uomCode: input.uomCode,
        customerGroup: input.customerGroup,
        unitPriceSnapshot: input.unitPriceSnapshot,
        currency: input.currency || "EGP",
      } as CartItem);
    }
    this.carts.set(cartId, items);
    return this.getCart(cartId);
  }

  /**
   * Removes an item from a specifically matching managed cart.
   *
   * @param cartId - The target cart identifier.
   * @param itemId - The ID of the item to remove.
   * @returns The updated cart status.
   */
  async removeItem(
    cartId: string,
    itemId: number,
    selectors?: {
      variantKey?: string;
      uomCode?: UomCode;
      customerGroup?: CustomerGroup;
    },
  ): Promise<{ items: CartItem[]; subtotal: number; itemCount: number }> {
    let items = this.carts.get(cartId) || [];
    if (selectors?.variantKey || selectors?.uomCode || selectors?.customerGroup) {
      items = items.filter(
        (i) =>
          !(
            i.id === itemId &&
            i.variantKey === selectors.variantKey &&
            i.uomCode === selectors.uomCode &&
            i.customerGroup === selectors.customerGroup
          ),
      );
    } else {
      items = items.filter((i) => i.id !== itemId);
    }
    this.carts.set(cartId, items);
    return this.getCart(cartId);
  }

  /**
   * Updates the quantity of a specific item within a managed cart.
   *
   * @param cartId - The cart identifier.
   * @param itemId - The product/item ID.
   * @param quantity - The new quantity to set.
   * @returns The updated cart status.
   */
  async updateItemQuantity(
    cartId: string,
    itemId: number,
    quantity: number,
    selectors?: {
      variantKey?: string;
      uomCode?: UomCode;
      customerGroup?: CustomerGroup;
    },
  ): Promise<{ items: CartItem[]; subtotal: number; itemCount: number }> {
    const items = this.carts.get(cartId) || [];
    const existing =
      selectors?.variantKey || selectors?.uomCode || selectors?.customerGroup
        ? items.find(
            (i) =>
              i.id === itemId &&
              i.variantKey === selectors.variantKey &&
              i.uomCode === selectors.uomCode &&
              i.customerGroup === selectors.customerGroup,
          )
        : items.find((i) => i.id === itemId);
    if (existing) {
      existing.quantity = quantity;
    }
    this.carts.set(cartId, items);
    return this.getCart(cartId);
  }

  /**
   * Removes all items from the specified cart.
   *
   * @param cartId - The cart identifier to empty.
   */
  async clearCart(cartId: string): Promise<void> {
    this.carts.delete(cartId);
  }
}
