/**
 * Order vocabulary (GLOSSARY: Order, Order Acceptance, Order Reference, Quote, Confirmation,
 * Cancellation, Refund, Attributed Order; ADR-0005, ADR-0007). List Offer pricing lives here;
 * the List Offer itself belongs to School Supply Lists.
 */
import type { CurrencyCode, Id } from '../common';
import type { BusinessPartnerId } from '../partners';
import type { PublicCode, SupplyListId } from '../school-lists';
import type { EgyptianMobile, OrderBuyer, ShippingAddress } from './order-contact';
import type { OrderReference } from './order-reference';
import type { OrderStatus, PaymentStatus } from './order-status';
import type { PaymentMethod } from './payment-method';
import type { OrderSource, OrderTotals, QuoteLine } from './quote';

export type OrderId = Id<'Order'>;
export type OrderLineId = Id<'OrderLine'>;

export { OrderError } from './order-error';
export type { OrderErrorCode } from './order-error';
export {
  ORDER_STATUSES,
  ORDER_STATUS_TRANSITIONS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_TRANSITIONS,
  changeOrderStatus,
  changePaymentStatus,
  refundOrder,
} from './order-status';
export type {
  OrderProgress,
  OrderProgressChange,
  OrderStatus,
  OrderStatusAssertions,
  PaymentStatus,
} from './order-status';
export { ACCEPTED_PAYMENT_TYPES, PAYMENT_METHOD_TYPES, PAYMENT_OPTIONS } from './payment-method';
export type { PaymentMethod, PaymentMethodType, PaymentOption } from './payment-method';
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

export { priceListOfferLine } from './list-offer-pricing';
export type { ListOfferLinePrice } from './list-offer-pricing';

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
