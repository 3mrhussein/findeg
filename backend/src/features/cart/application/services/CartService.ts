/**
 * Cart Service
 */

import { CartEntity, CartItem } from '../../domain/entities/Cart';
import { ICartService } from '../interfaces/ICartService';
import { CustomerGroup, UomCode } from '@findeg/backend/features/core/domain/types/common';

type GlobalWithManagedCartStore = typeof globalThis & {
  __findegManagedCartStore?: Map<string, CartItem[]>;
};

/**
 * Returns a process-level cart store so API route instances share the same managed cart map.
 */
function getManagedCartStore(): Map<string, CartItem[]> {
  const globalRef = globalThis as GlobalWithManagedCartStore;
  if (!globalRef.__findegManagedCartStore) {
    globalRef.__findegManagedCartStore = new Map<string, CartItem[]>();
  }
  return globalRef.__findegManagedCartStore;
}

/**
 * Cart Service
 *
 * Handles shopping cart business logic including adding, removing, and updating items.
 * Delegates to CartEntity for domain logic and calculations.
 * All pricing is expressed as `unitPrice` and all items are keyed by (variantId + uomCode).
 */
export class CartService implements ICartService {
  /**
   * Adds a CartItem to an existing array of cart items.
   * Logic for merging duplicates is delegated to CartEntity.
   */
  addToCart(items: CartItem[], item: CartItem): CartItem[] {
    const cart = new CartEntity(items);
    return cart.addItem(item);
  }

  /**
   * Removes an item from the cart based on variantId and uomCode.
   */
  removeFromCart(items: CartItem[], variantId: number, uomCode: UomCode): CartItem[] {
    const cart = new CartEntity(items);
    return cart.removeItem(variantId, uomCode);
  }

  /**
   * Updates the exact quantity of an item in the cart.
   */
  updateQuantity(
    items: CartItem[],
    variantId: number,
    uomCode: UomCode,
    quantity: number,
  ): CartItem[] {
    const cart = new CartEntity(items);
    return cart.updateItemQuantity(variantId, uomCode, quantity);
  }

  /**
   * Computes aggregated totals (total price and total item count) for the given cart items.
   */
  getTotals(items: CartItem[]) {
    const cart = new CartEntity(items);
    return {
      totalItems: cart.getTotalItems(),
      totalPrice: cart.getTotalPrice(),
    };
  }

  // Process-level cart storage for API compatibility across route handler instances
  private carts = getManagedCartStore();

  /**
   * Retrieves a managed cart by its unique identifier.
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
   * Merges by (variantId + uomCode).
   */
  async addItem(
    cartId: string,
    input: CartItem,
  ): Promise<{ items: CartItem[]; subtotal: number; itemCount: number }> {
    const items = this.carts.get(cartId) || [];
    const existing = items.find(
      (i) => i.variantId === input.variantId && i.uomCode === input.uomCode,
    );
    if (existing) {
      existing.quantity += input.quantity;
      existing.unitPrice = input.unitPrice;
    } else {
      items.push(input);
    }
    this.carts.set(cartId, items);
    return this.getCart(cartId);
  }

  /**
   * Removes an item from a specifically matching managed cart.
   */
  async removeItem(
    cartId: string,
    variantId: number,
    selectors?: {
      uomCode?: UomCode;
      customerGroup?: CustomerGroup;
    },
  ): Promise<{ items: CartItem[]; subtotal: number; itemCount: number }> {
    let items = this.carts.get(cartId) || [];
    const uomCode = selectors?.uomCode;
    if (uomCode) {
      items = items.filter((i) => !(i.variantId === variantId && i.uomCode === uomCode));
    } else {
      items = items.filter((i) => i.variantId !== variantId);
    }
    this.carts.set(cartId, items);
    return this.getCart(cartId);
  }

  /**
   * Updates the quantity of a specific item within a managed cart.
   */
  async updateItemQuantity(
    cartId: string,
    variantId: number,
    quantity: number,
    selectors?: {
      uomCode?: UomCode;
      customerGroup?: CustomerGroup;
    },
  ): Promise<{ items: CartItem[]; subtotal: number; itemCount: number }> {
    const items = this.carts.get(cartId) || [];
    const uomCode = selectors?.uomCode;
    const existing = uomCode
      ? items.find((i) => i.variantId === variantId && i.uomCode === uomCode)
      : items.find((i) => i.variantId === variantId);
    if (existing) {
      existing.quantity = quantity;
    }
    this.carts.set(cartId, items);
    return this.getCart(cartId);
  }

  /**
   * Removes all items from the specified cart.
   */
  async clearCart(cartId: string): Promise<void> {
    this.carts.delete(cartId);
  }
}
