/**
 * Cart Service
 *
 * This service handles business logic for the shopping cart.
 */

import { CartEntity, CartItem } from "@/domain/entities/Cart";
import { Product } from "@/domain/entities/Product";
import { ICartService } from "./interfaces/ICartService";

/**
 *
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
}
