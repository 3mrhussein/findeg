import {
  allocateStock,
  type StockAllocation,
  type StockBalance,
  type Warehouse,
} from '../inventory';
import { confirmQuote, type ConfirmationTerms } from './confirmation';
import type { AcceptedOrder, PaymentMethod } from './index';
import { ACCEPTED_PAYMENT_TYPES } from './index';
import {
  egyptianMobile,
  guestBuyer,
  shippingAddress,
  type EgyptianMobile,
  type OrderBuyer,
  type ShippingAddress,
} from './order-contact';
import { OrderError } from './order-error';
import type { OrderReference } from './order-reference';
import type { Quote } from './quote';

/** A payment method a checkout accepts today. Only cash on delivery is. */
export function acceptedPaymentMethod(method: string): PaymentMethod {
  const accepted = ACCEPTED_PAYMENT_TYPES.find((type) => type === method);
  if (!accepted) {
    throw new OrderError(
      'UNSUPPORTED_PAYMENT_METHOD',
      `Payment method ${JSON.stringify(method)} is not accepted; accepted: ${ACCEPTED_PAYMENT_TYPES.join(', ')}`,
    );
  }
  return accepted;
}

/** What Order Acceptance needs: the buyer's details, the fresh Quote and its confirmation, and the stock. */
export interface OrderAcceptanceRequest {
  reference: OrderReference;
  buyer: OrderBuyer;
  contactPhone: EgyptianMobile;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  /** The Order priced again at acceptance, never the client's copy. */
  quote: Quote;
  /** The confirmation the Customer gave for the terms they saw. */
  confirmation: string;
  /** Checkout's digest of Confirmation terms. */
  digestTerms: (terms: ConfirmationTerms) => string;
  /** The stock of the Order's variants, read under lock. */
  stock: { balances: readonly StockBalance[]; warehouses: readonly Warehouse[] };
}

/** An accepted Order and the stock to hold for it. */
export interface OrderAcceptance {
  order: AcceptedOrder;
  /** Add the stored Order's id to each to make its Stock Reservations. */
  stock: StockAllocation[];
}

/**
 * Order Acceptance (CO-4, CO-10, ADR-0005): turns a confirmed Quote into a pending, unpaid
 * Order. It needs an accepted payment method, the same terms the Customer confirmed (or they
 * reconfirm), and stock for every line, allocated all-or-nothing. The Order's snapshot of
 * lines, prices and totals is frozen: it never changes afterwards.
 */
export function acceptOrder(request: OrderAcceptanceRequest): OrderAcceptance {
  const paymentMethod = acceptedPaymentMethod(request.paymentMethod);
  const buyer = request.buyer.kind === 'guest' ? guestBuyer(request.buyer.email) : request.buyer;
  const contactPhone = egyptianMobile(request.contactPhone);
  const address = shippingAddress(request.shippingAddress);
  const quote = confirmQuote(request.quote, request.confirmation, request.digestTerms);
  const stock = allocateStock(
    quote.lines.map(({ variantId, quantity }) => ({ variantId, quantity })),
    request.stock.balances,
    request.stock.warehouses,
  );
  const order: AcceptedOrder = deepFreeze({
    reference: request.reference,
    buyer: { ...buyer },
    contactPhone,
    shippingAddress: address,
    source: { ...quote.source },
    lines: quote.lines.map((line) => ({
      ...line,
      discounts: line.discounts.map((discount) => ({ ...discount })),
    })),
    totals: { ...quote.totals },
    paymentMethod,
    status: 'pending',
    paymentStatus: 'unpaid',
    currency: quote.currency,
  });
  return { order, stock };
}

function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}
