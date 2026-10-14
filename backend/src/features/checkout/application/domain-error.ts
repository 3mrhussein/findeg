import { DomainError } from '@findeg/domain';
import { InsufficientStockError } from '@findeg/domain';
import { ReconfirmationRequiredError } from '@findeg/domain';
import type { CheckoutAcceptFailure } from './interfaces/ICheckoutService';
import { toCheckoutQuote } from './quote-mapping';

/** The single feature boundary from Domain failures to checkout's HTTP contract. */
export function mapDomainError(error: unknown): CheckoutAcceptFailure | undefined {
  if (!(error instanceof DomainError)) return;
  if (error instanceof ReconfirmationRequiredError) {
    return {
      success: false,
      status: 409,
      error: {
        code: 'reconfirmation-required',
        message: 'Quote terms have changed; reconfirmation required',
        quote: toCheckoutQuote(error.quote),
      },
    };
  }
  if (error instanceof InsufficientStockError) {
    return {
      success: false,
      status: 409,
      error: {
        code: 'insufficient-stock',
        message: 'Insufficient stock for requested items',
        shortfalls: [...error.shortfalls],
      },
    };
  }
  const codes = [
    'INVALID_SKU',
    'INVALID_PHONE',
    'INVALID_GUEST_EMAIL',
    'INVALID_SHIPPING_ADDRESS',
    'INVALID_LINE_QUANTITY',
    'INVALID_CART_QUANTITY',
    'EMPTY_ORDER',
  ];
  if (codes.includes(error.code)) {
    return {
      success: false,
      status: 400,
      error: { code: 'validation-error', message: error.message },
    };
  }
  if (error.code === 'UNSUPPORTED_PAYMENT_METHOD') {
    return {
      success: false,
      status: 400,
      error: {
        code: 'unsupported-payment-method',
        message: 'Only Cash on Delivery (cod) is accepted',
      },
    };
  }
}
