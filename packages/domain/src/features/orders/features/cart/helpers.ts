import type { VariantId } from '../../../catalog';
import { DomainError, isLineQuantity } from '../../../common';
import { CART_QUANTITY_MAX, CART_QUANTITY_MIN, EMPTY_CART } from './constants';
import type { Cart, CartErrorCode, CartLine } from './types';

/** A Cart change that breaks a Cart rule. */
export class CartError extends DomainError<CartErrorCode> {}

function requireQuantity(quantity: number): void {
  if (!isLineQuantity(quantity)) {
    throw new CartError(
      'INVALID_CART_QUANTITY',
      `A Cart line holds ${String(CART_QUANTITY_MIN)} to ${String(CART_QUANTITY_MAX)} units, received ${String(quantity)}`,
    );
  }
}

/** Adds units of a variant, merging them into its line. The merged line must stay within 1 to 999. */
export function addToCart(current: Cart, line: CartLine): Cart {
  requireQuantity(line.quantity);
  const existing = current.lines.find((l) => l.variantId === line.variantId);
  if (!existing) return { lines: [...current.lines, { ...line }] };
  const quantity = existing.quantity + line.quantity;
  requireQuantity(quantity);
  return {
    lines: current.lines.map((l) => (l === existing ? { variantId: l.variantId, quantity } : l)),
  };
}

/** Sets the units of a variant already in the Cart, from 1 to 999. */
export function setCartQuantity(current: Cart, variantId: VariantId, quantity: number): Cart {
  requireQuantity(quantity);
  if (!current.lines.some((l) => l.variantId === variantId)) {
    throw new CartError('VARIANT_NOT_IN_CART', `Variant ${String(variantId)} is not in the Cart`);
  }
  return {
    lines: current.lines.map((l) => (l.variantId === variantId ? { variantId, quantity } : l)),
  };
}

/** Removes a variant's line. Removing a variant that is not in the Cart changes nothing. */
export function removeFromCart(current: Cart, variantId: VariantId): Cart {
  return { lines: current.lines.filter((l) => l.variantId !== variantId) };
}

/** A Cart from stored lines: repeated variants are merged, and every line holds 1 to 999 units. */
export function cart(lines: readonly CartLine[]): Cart {
  return lines.reduce(addToCart, EMPTY_CART);
}
