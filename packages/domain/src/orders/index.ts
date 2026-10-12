/**
 * Order vocabulary (GLOSSARY: Order, Order Acceptance, Order Reference, Quote, Confirmation,
 * List Offer, Cancellation, Refund, Attributed Order; ADR-0005, ADR-0007).
 */
import type { CurrencyCode, Id } from '../common';
import type { BusinessPartnerId } from '../partners';
import type { PublicCode, SupplyListId } from '../school-lists';
import type { EgyptianMobile, OrderBuyer, ShippingAddress } from './order-contact';
import type { OrderReference } from './order-reference';
import type { OrderSource, OrderTotals, QuoteLine } from './quote';

export type OrderId = Id<'Order'>;
export type OrderLineId = Id<'OrderLine'>;
export type ListOfferId = Id<'ListOffer'>;

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

export { OrderError } from './order-error';
export type { OrderErrorCode } from './order-error';
export { changeOrderStatus, changePaymentStatus, refundOrder } from './order-status';
export type { OrderProgress, OrderProgressChange, OrderStatusAssertions } from './order-status';
export { LIVE_ORDER_STATUSES, isLiveOrderStatus } from './live-statuses';
export { NOTIFIED_ORDER_STATUSES, isNotifiedOrderStatus } from './notified-statuses';
export type { NotifiedOrderStatus } from './notified-statuses';
export { BUSINESS_TIME_ZONE, businessDateOf, businessMonthOf } from './business-time';

export {
  CROCKFORD_BASE32_ALPHABET,
  ORDER_REFERENCE_BODY_LENGTH,
  ORDER_REFERENCE_PATTERN,
  ORDER_REFERENCE_PREFIX,
  generateOrderReference,
  orderReference,
} from './order-reference';
export type { OrderReference } from './order-reference';
export {
  EGYPTIAN_MOBILE_PATTERN,
  egyptianMobile,
  guestBuyer,
  shippingAddress,
} from './order-contact';
export type { EgyptianMobile, OrderBuyer, ShippingAddress } from './order-contact';
export {
  CART_QUANTITY_MAX,
  CART_QUANTITY_MIN,
  CartError,
  EMPTY_CART,
  addToCart,
  cart,
  removeFromCart,
  setCartQuantity,
} from './cart';
export type { Cart, CartErrorCode, CartLine } from './cart';

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

/** A payment method and whether it is accepted today. */
export interface PaymentOption {
  type: PaymentMethodType;
  allowed: boolean;
}

export const PAYMENT_OPTIONS: readonly PaymentOption[] = [
  { type: 'cod', allowed: true },
  { type: 'card', allowed: false },
];

/** Payment methods a checkout may accept today. */
export const ACCEPTED_PAYMENT_TYPES: readonly PaymentMethodType[] = PAYMENT_OPTIONS.filter(
  (option) => option.allowed,
).map((option) => option.type);

export type PaymentMethod = PaymentMethodType;

/**
 * An Order as Order Acceptance makes it, before it is stored and given ids. Its buyer, contact,
 * source, lines and totals are a frozen snapshot; only its status and payment status change.
 */
export interface AcceptedOrder {
  reference: OrderReference;
  buyer: OrderBuyer;
  contactPhone: EgyptianMobile;
  shippingAddress: ShippingAddress;
  source: OrderSource;
  lines: readonly QuoteLine[];
  totals: OrderTotals;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  currency: CurrencyCode;
}

/** An accepted Order. Its status and payment status change after acceptance; nothing else does. */
export interface Order extends Omit<AcceptedOrder, 'lines'> {
  id: OrderId;
  lines: readonly OrderLine[];
}

/**
 * One variant on an Order: its name, SKU, unit price, discounts and line total as accepted, the
 * list item it fulfils and whether it substitutes for that item's default (`null` on cart lines).
 */
export interface OrderLine extends QuoteLine {
  id: OrderLineId;
  orderId: OrderId;
}

/** An Order fixed to exactly one School Supply List, recording its Partner School's Business Partner. */
export interface AttributedOrder {
  orderId: OrderId;
  supplyListId: SupplyListId;
  supplyListPublicCode: PublicCode;
  businessPartnerId: BusinessPartnerId;
}

/** The discount sources a Quote can carry. Only the List Offer exists in phase one. */
export const DISCOUNT_SOURCES = ['list-offer'] as const;
export type DiscountSource = (typeof DISCOUNT_SOURCES)[number];

export {
  LIST_OFFER_MAX_BASIS_POINTS,
  LIST_OFFER_MIN_BASIS_POINTS,
  ListOfferError,
  priceListOfferLine,
} from './list-offer-pricing';
export type { ListOfferLinePrice } from './list-offer-pricing';

/** A percentage discount on one School Supply List, active for a time window. Basis points: 100 = 1%. */
export interface ListOffer {
  id: ListOfferId;
  supplyListId: SupplyListId;
  basisPoints: number;
  startsAt: Date;
  endsAt: Date | null;
}

export { FLAT_SHIPPING_FEE, priceQuote } from './quote';
export type {
  LineDiscount,
  OrderSource,
  OrderTotals,
  Quote,
  QuoteLine,
  QuoteLineRequest,
  QuoteSource,
} from './quote';
export { ReconfirmationRequiredError, confirmQuote, confirmationTerms } from './confirmation';
export type { ConfirmationLine, ConfirmationTerms } from './confirmation';
export { acceptOrder, acceptedPaymentMethod } from './acceptance';
export type { OrderAcceptance, OrderAcceptanceRequest } from './acceptance';
