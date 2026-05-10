/**
 * Cart Service Interface
 */

import {
  ID,
  Quantity,
  Price,
} from '@findeg/backend/features/core/domain/types/common';
import { CartItem } from '../../domain/entities/Cart';

export interface ICartService {
  /**
   * Adds a CartItem to a list of items, merging if the same variantId exists.
   */
  addToCart(items: CartItem[], item: CartItem): CartItem[];

  /**
   * Removes an item from a list of items by variantId.
   */
  removeFromCart(items: CartItem[], variantId: ID): CartItem[];

  /**
   * Updates the quantity of a specific item.
   */
  updateQuantity(
    items: CartItem[],
    variantId: ID,
    quantity: Quantity,
  ): CartItem[];

  getTotals(items: CartItem[]): { totalItems: Quantity; totalPrice: Price };

  // Server-side/Managed methods (for API compatibility)
  getCart(cartId: string): Promise<{ items: CartItem[]; subtotal: Price; itemCount: Quantity }>;

  /**
   * Adds a CartItem to a managed server-side cart.
   */
  addItem(
    cartId: string,
    input: CartItem,
  ): Promise<{ items: CartItem[]; subtotal: Price; itemCount: Quantity }>;

  removeItem(
    cartId: string,
    variantId: ID,
  ): Promise<{ items: CartItem[]; subtotal: Price; itemCount: Quantity }>;

  updateItemQuantity(
    cartId: string,
    variantId: ID,
    quantity: Quantity,
  ): Promise<{ items: CartItem[]; subtotal: Price; itemCount: Quantity }>;

  clearCart(cartId: string): Promise<void>;
}
