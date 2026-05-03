/**
 * Cart Service Interface
 */

import {
  ID,
  Quantity,
  Price,
  CustomerGroup,
  UomCode,
} from '@findeg/backend/features/core/domain/types/common';
import { CartItem } from '../../domain/entities/Cart';

export interface ICartService {
  /**
   * Adds a CartItem to a list of items, merging if the same (variantId + uomCode) exists.
   */
  addToCart(items: CartItem[], item: CartItem): CartItem[];

  /**
   * Removes an item from a list of items by variantId and uomCode.
   */
  removeFromCart(items: CartItem[], variantId: ID, uomCode: UomCode): CartItem[];

  /**
   * Updates the quantity of a specific item.
   */
  updateQuantity(
    items: CartItem[],
    variantId: ID,
    uomCode: UomCode,
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
    selectors?: {
      uomCode?: UomCode;
      customerGroup?: CustomerGroup;
    },
  ): Promise<{ items: CartItem[]; subtotal: Price; itemCount: Quantity }>;

  updateItemQuantity(
    cartId: string,
    variantId: ID,
    quantity: Quantity,
    selectors?: {
      uomCode?: UomCode;
      customerGroup?: CustomerGroup;
    },
  ): Promise<{ items: CartItem[]; subtotal: Price; itemCount: Quantity }>;

  clearCart(cartId: string): Promise<void>;
}
