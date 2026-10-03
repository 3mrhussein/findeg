import type {
  CheckoutValidateInput,
  CheckoutOrderInput,
  CheckoutOrderContext,
  CheckoutQuote,
  CheckoutAcceptedOrder,
} from '../../schemas';

export interface CheckoutValidateSuccess {
  success: true;
  data: CheckoutQuote;
}

export interface CheckoutValidateFailure {
  success: false;
  status: number;
  error: {
    code: string;
    message: string;
  };
}

export type CheckoutValidateResult = CheckoutValidateSuccess | CheckoutValidateFailure;

export interface CheckoutAcceptSuccess {
  success: true;
  status: 201;
  data: {
    order: CheckoutAcceptedOrder;
    message: string;
  };
}

export interface CheckoutAcceptFailure {
  success: false;
  status: 400 | 409 | 422 | 500;
  error: {
    code:
      | 'reconfirmation-required'
      | 'insufficient-stock'
      | 'unavailable-variant'
      | 'unsupported-payment-method'
      | 'validation-error'
      | 'missing-idempotency-key'
      | 'invalid-idempotency-key'
      | 'invalid-guest-id'
      | 'idempotency-conflict'
      | 'idempotency-in-progress';
    message: string;
    quote?: CheckoutQuote;
    shortfalls?: Array<{ variantId: number; requested: number; available: number }>;
  };
}

export type CheckoutAcceptResult = CheckoutAcceptSuccess | CheckoutAcceptFailure;

export interface ICheckoutService {
  validate(input: CheckoutValidateInput): Promise<CheckoutValidateResult>;
  accept(input: CheckoutOrderInput, context?: CheckoutOrderContext): Promise<CheckoutAcceptResult>;
}
