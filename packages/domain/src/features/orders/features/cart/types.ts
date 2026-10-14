import type { VariantId } from '../../../catalog';

/** Units of one variant in the Cart. It has no price: a Quote prices it (CO-2). */
export interface CartLine {
  variantId: VariantId;
  quantity: number;
}

/**
 * A Customer's general basket. It holds one line per variant and never a School Supply List line:
 * list choices live in the List Selection (ADR-0011).
 */
export interface Cart {
  lines: readonly CartLine[];
}

export type CartErrorCode = 'INVALID_CART_QUANTITY' | 'VARIANT_NOT_IN_CART';
