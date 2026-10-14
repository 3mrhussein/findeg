import { allocateStock } from '../../../inventory';
import { OrderError } from '../../helpers';
import type { AcceptedOrder } from '../../types';
import { confirmQuote } from '../confirmation';
import { egyptianMobile, guestBuyer, shippingAddress } from '../order-contact';
import { ACCEPTED_PAYMENT_TYPES, type PaymentMethod } from '../payment-method';
import type { OrderAcceptance, OrderAcceptanceRequest } from './types';

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
