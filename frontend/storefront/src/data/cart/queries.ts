'use cache';

import 'server-only';
/**
 * Cart Data Layer (Storefront)
 */

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

  const { cart } = createCartServices();
  return await cart.getCart(cartId);
}
