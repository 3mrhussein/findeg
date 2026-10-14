import type { CurrencyCode, Id } from '../common';
import type { BusinessPartnerId } from '../partners';
import type { PublicCode, SupplyListId } from '../school-lists';
import * as constants from './constants';
import type { EgyptianMobile, OrderBuyer, ShippingAddress } from './features/order-contact';
import type { OrderReference } from './features/order-reference';
import type { OrderStatus, PaymentStatus } from './features/order-status';
import type { PaymentMethod } from './features/payment-method';
import type { OrderSource, OrderTotals, QuoteLine } from './features/quote';

export type OrderId = Id<'Order'>;
export type OrderLineId = Id<'OrderLine'>;

export type OrderErrorCode =
  | 'INVALID_ORDER_STATUS_TRANSITION'
  | 'SHIPPED_CANCELLATION_NEEDS_PARCEL_BACK'
  | 'INVALID_PAYMENT_STATUS_TRANSITION'
  | 'PAID_BEFORE_DELIVERY'
  | 'PAYMENT_REFUND_NEEDS_ORDER_REFUND'
  | 'REFUND_NEEDS_PAID_ORDER'
  | 'INVALID_ORDER_REFERENCE'
  | 'INVALID_PHONE'
  | 'INVALID_SHIPPING_ADDRESS'
  | 'INVALID_GUEST_EMAIL'
  | 'EMPTY_ORDER'
  | 'MIXED_ORDER_SOURCE'
  | 'INVALID_LINE_QUANTITY'
  | 'UNSUPPORTED_PAYMENT_METHOD';

export type DiscountSource = (typeof constants.DISCOUNT_SOURCES)[number];

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
