/**
 * Cart Data Layer (Storefront)
 */
'use cache';

import { cacheTag, cacheLife } from 'next/cache';
import { createCartServices } from '@findeg/backend/features/cart';

/**
 * Retrieves the current cart for a session (cached per guest).
 * 
 * @param cartId - Guest or user cart identifier
 * @returns Cart with items and subtotal, or empty cart on error
 */
export async function getCart(cartId: string) {
  cacheTag(`cart-${cartId}`);
  cacheLife('minutes');

  try {
    const { cart } = createCartServices();
    return await cart.getCart(cartId);
  } catch (error) {
    console.error(`Failed to retrieve cart ${cartId}:`, error);
    // Return empty cart on error to prevent UI breakage
    return {
      items: [],
      subtotal: 0,
      itemCount: 0,
    };
  }
}
