/**
 * Cart Services Factory
 */
import { CartService } from './CartService';

/**
 * Create cart services
 */
export function createCartServices() {
  return {
    cart: new CartService(),
  };
}
