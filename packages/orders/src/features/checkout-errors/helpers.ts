import { DomainError, InsufficientStockError, ReconfirmationRequiredError } from '@findeg/domain';
import { toCheckoutQuote } from '../checkout-quote/helpers';
import type { CheckoutAcceptFailure } from '../order-acceptance/types';

export class UnavailableVariantError extends Error {
  constructor(message = 'One or more requested variants are inactive or unavailable') {
    super(message);
    this.name = 'UnavailableVariantError';
  }
}

export class ListUnavailableError extends Error {
  constructor() {
    super('School Supply List is unavailable for checkout');
    this.name = 'ListUnavailableError';
  }
}

export class SelectionInvalidError extends Error {
  constructor(readonly listItemIds: number[]) {
    super('One or more School Supply List selections are invalid');
    this.name = 'SelectionInvalidError';
  }
}

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
