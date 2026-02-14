/**
 * Cart Service Interface
 *
 * Defines cart manipulation operations.
 * The CartService is client-side only (no repository dependency),
 * but having an interface enables testing and potential future
 * server-side cart persistence.
 */

import { CartItem } from "@/domain/entities/Cart";
import { Product } from "@/domain/entities/Product";

export interface ICartService {
  addToCart(
    items: CartItem[],
    product: Product,
    quantity: number,
    selectedVariant?: { [key: string]: string },
  ): CartItem[];

  removeFromCart(
    items: CartItem[],
    productId: number,
    selectedVariant?: { [key: string]: string },
  ): CartItem[];

  updateQuantity(
    items: CartItem[],
    productId: number,
    quantity: number,
    selectedVariant?: { [key: string]: string },
  ): CartItem[];

  getTotals(items: CartItem[]): { totalItems: number; totalPrice: number };
}
