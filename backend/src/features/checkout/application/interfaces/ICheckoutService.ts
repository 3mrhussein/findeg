import type {
  CheckoutValidateInput,
  CheckoutOrderInput,
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
      | 'unsupported-payment-method'
      | 'validation-error'
      | string;
    message: string;
    quote?: CheckoutQuote;
    shortfalls?: Array<{ variantId: number; requested: number; available: number }>;
  };
}

export type CheckoutAcceptResult = CheckoutAcceptSuccess | CheckoutAcceptFailure;

export interface ICheckoutService {
  validate(input: CheckoutValidateInput): Promise<CheckoutValidateResult>;
  accept(input: CheckoutOrderInput): Promise<CheckoutAcceptResult>;
}
