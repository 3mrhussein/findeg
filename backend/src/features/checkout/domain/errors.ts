import type { StockShortfall } from '@findeg/db/queries';
import type { CheckoutQuote } from '../schemas';

export class ReconfirmationRequiredError extends Error {
  constructor(readonly quote: CheckoutQuote) {
    super('Terms have changed; reconfirmation required');
    this.name = 'ReconfirmationRequiredError';
  }
}

export class InsufficientStockCheckoutError extends Error {
  constructor(readonly shortfalls: StockShortfall[]) {
    super('Insufficient stock for one or more requested items');
    this.name = 'InsufficientStockCheckoutError';
  }
}

export class UnsupportedPaymentMethodError extends Error {
  constructor(readonly paymentMethod: string) {
    super(`Payment method '${paymentMethod}' is not supported. Only COD is accepted.`);
    this.name = 'UnsupportedPaymentMethodError';
  }
}

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
