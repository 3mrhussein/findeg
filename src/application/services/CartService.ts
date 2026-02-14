/**
 * Cart Service
 *
 * This service handles business logic for the shopping cart.
 */

import { CartEntity, CartItem } from "@/domain/entities/Cart";
import { Product } from "@/domain/entities/Product";
import { ICartService } from "./interfaces/ICartService";

/**
 * Cart Service
 *
 * Handles shopping cart business logic including adding, removing, and updating items.
 * Delegates to CartEntity for domain logic and calculations.
 */
export class CartService implements ICartService {
  /**
   * Add product to cart
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
   * Remove product from cart
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
   * Update item quantity
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
   * Calculate cart totals
   */
  getTotals(items: CartItem[]) {
    const cart = new CartEntity(items);
    return {
      totalItems: cart.getTotalItems(),
      totalPrice: cart.getTotalPrice(),
    };
  }

  // In-memory cart storage for API compatibility (should be replaced by DB/Redis in production)
  private carts = new Map<string, CartItem[]>();

  /**
   * Retrieves cart by ID
   *
   * @param cartId - Cart identifier
   * @returns Cart data with subtotal and count
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
   * Adds an item to a managed cart
   *
   * @param cartId - Cart identifier
   * @param input - Item data (productId, quantity, variant)
   * @returns Updated cart data
   */
  async addItem(
    cartId: string,
    input: { productId: number; quantity: number; variant?: any },
  ): Promise<any> {
    const items = this.carts.get(cartId) || [];
    const existing = items.find((i) => i.id === input.productId);
    if (existing) {
      existing.quantity += input.quantity;
    } else {
      items.push({
        id: input.productId,
        quantity: input.quantity,
        variant: input.variant,
      } as any);
    }
    this.carts.set(cartId, items);
    return this.getCart(cartId);
  }

  /**
   * Removes an item from a managed cart
   *
   * @param cartId - Cart identifier
   * @param itemId - Item (Product) ID to remove
   * @returns Updated cart data
   */
  async removeItem(cartId: string, itemId: number): Promise<any> {
    let items = this.carts.get(cartId) || [];
    items = items.filter((i: any) => i.id !== itemId);
    this.carts.set(cartId, items);
    return this.getCart(cartId);
  }

  /**
   * Updates item quantity in a managed cart
   *
   * @param cartId - Cart identifier
   * @param itemId - Item (Product) ID to update
   * @param quantity - New quantity
   * @returns Updated cart data
   */
  async updateItemQuantity(cartId: string, itemId: number, quantity: number): Promise<any> {
    const items = this.carts.get(cartId) || [];
    const existing = items.find((i: any) => i.id === itemId);
    if (existing) {
      existing.quantity = quantity;
    }
    this.carts.set(cartId, items);
    return this.getCart(cartId);
  }

  /**
   * Clears cart contents
   *
   * @param cartId - Cart identifier
   */
  async clearCart(cartId: string): Promise<void> {
    this.carts.delete(cartId);
  }
}
