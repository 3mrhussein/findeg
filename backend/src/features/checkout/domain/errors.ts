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
