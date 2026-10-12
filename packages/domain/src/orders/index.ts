/**
 * Order vocabulary (GLOSSARY: Order, Order Acceptance, Order Reference, Quote, Confirmation,
 * List Offer, Cancellation, Refund, Attributed Order, Guest Order Access; ADR-0005, ADR-0007, ADR-0008).
 */
import type { CurrencyCode, MoneyInPiasters } from '../common';
import type { Customer } from '../customers';

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
export type OrderReference = string;

export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_TRANSITIONS: Readonly<Record<PaymentStatus, readonly PaymentStatus[]>> =
  {
    unpaid: ['paid'],
    paid: ['refunded'],
    refunded: [],
  };

/**
 * Payment methods are data, not a fixed list: a method is accepted at checkout when its option
 * is `allowed`. Turning card on is a data change, plus a database enum migration (ADR-0005).
 */
export const PAYMENT_METHOD_TYPES = ['cod', 'card'] as const;
export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number];

/** A payment method, the phase in which it is accepted, and whether it is accepted today. */
export interface PaymentOption {
  type: PaymentMethodType;
  allowed: boolean;
  phase: 1 | 2;
}

export const PAYMENT_OPTIONS: readonly PaymentOption[] = [
  { type: 'cod', allowed: true, phase: 1 },
  { type: 'card', allowed: false, phase: 2 },
];

/** Payment methods a checkout may accept today. */
export const ACCEPTED_PAYMENT_TYPES: readonly PaymentMethodType[] = PAYMENT_OPTIONS.filter(
  (option) => option.allowed,
).map((option) => option.type);

export type PaymentMethod = PaymentMethodType;

/** An accepted Order. Its status and payment status change after acceptance. */
export interface Order {
  id: number;
  reference: OrderReference;
  customerId?: Customer['id'];
  guestEmail?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  currency: CurrencyCode;
}

/** One product variant on an Order, priced at acceptance. */
export interface OrderLine {
  id: number;
  orderId: Order['id'];
  variantId: number;
  quantity: number;
  unitPrice: MoneyInPiasters;
  /** Set when the line came from a School Supply List (Exact Item or Allowed Alternative). */
  supplyListItemId?: number;
}

/** An Order fixed to exactly one School Supply List, recording its Partner School's Business Partner. */
export interface AttributedOrder {
  orderId: Order['id'];
  supplyListId: number;
  supplyListPublicCode: string;
  supplyListVersionId: number;
  businessPartnerId: number;
}

/** The discount sources a Quote can carry. Only the List Offer exists in phase one. */
export const DISCOUNT_SOURCES = ['list-offer'] as const;
export type DiscountSource = (typeof DISCOUNT_SOURCES)[number];

/** A percentage discount on one School Supply List, active for a time window. Basis points: 100 = 1%. */
export const LIST_OFFER_MIN_BASIS_POINTS = 0;
export const LIST_OFFER_MAX_BASIS_POINTS = 10000;
export interface ListOffer {
  supplyListId: number;
  basisPoints: number;
  startsAt: Date;
  endsAt: Date | null;
}

/** The server's authoritative pricing of a set of lines at one moment. */
export interface Quote {
  lines: readonly { variantId: number; quantity: number; unitPrice: MoneyInPiasters }[];
  discounts: readonly { source: DiscountSource; amount: MoneyInPiasters }[];
  shippingFee: MoneyInPiasters;
  total: MoneyInPiasters;
  /** Digest of the Quote's terms that the Customer agrees to. */
  confirmation: string;
}

/** How a Customer without an account views their Order: Order Reference and email, then a one-time code. */
export interface GuestOrderAccess {
  orderReference: OrderReference;
  email: string;
}
