/**
 * Cart Service Interface
 */

import { CartItem } from "../../domain/entities/Cart";
import { Product } from "@/features/catalog/domain/entities/Product";

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

  // Server-side/Managed methods (for API compatibility)
  getCart(cartId: string): Promise<{ items: CartItem[]; subtotal: number; itemCount: number }>;
  addItem(
    cartId: string,
    input: { productId: number; quantity: number; variant?: any },
  ): Promise<any>;
  removeItem(cartId: string, itemId: number): Promise<any>;
  updateItemQuantity(cartId: string, itemId: number, quantity: number): Promise<any>;
  clearCart(cartId: string): Promise<void>;
}
