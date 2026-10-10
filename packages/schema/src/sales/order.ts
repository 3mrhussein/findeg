/**
 * Order vocabulary (GLOSSARY: Order Acceptance, Order Reference, Cancellation, Refund; ADR-0005).
 *
 * An Order is accepted atomically and enters as `pending`. Acceptance itself is not a status.
 */

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Every status an Order may move to from each status. */
export const ORDER_STATUS_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  // A shipped Order is cancelled only once its parcel is back in the warehouse (ADR-0005).
  shipped: ['delivered', 'cancelled'],
  // Phase one is cash on delivery, so a refund only follows delivery (ADR-0005).
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

/** Statuses that release the Order's Stock Reservation (Cancellation). */
export const ORDER_STATUSES_RELEASING_STOCK = [
  'cancelled',
] as const satisfies readonly OrderStatus[];

/** Public, human-readable identifier: `FE-` plus six Crockford base32 characters (not a secret). */
export const ORDER_REFERENCE_PREFIX = 'FE-';
export const ORDER_REFERENCE_BODY_LENGTH = 6;
export const CROCKFORD_BASE32_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const ORDER_REFERENCE_PATTERN = new RegExp(
  `^${ORDER_REFERENCE_PREFIX}[${CROCKFORD_BASE32_ALPHABET}]{${ORDER_REFERENCE_BODY_LENGTH}}$`,
);

/** A Customer's Order fixed to exactly one School Supply List, or ordinary (never both). */
export interface OrderAttribution {
  supplyListId: number;
  supplyListPublicCode: string;
  supplyListVersionId: number;
  businessPartnerId: number;
}
