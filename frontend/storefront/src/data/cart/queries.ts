/**
 * Cart Data Layer (Storefront)
 */
'use cache';

import { cacheTag, cacheLife } from 'next/cache';
import { createCartServices } from '@findeg/backend/features/cart';

/**
 * Retrieves the current cart for a session
 */
export async function getCart(cartId: string) {
  cacheTag(`cart-${cartId}`);
  cacheLife('minutes');

  const { cart } = createCartServices();
  return await cart.getCart(cartId);
}
