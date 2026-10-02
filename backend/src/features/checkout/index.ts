export { createCheckoutService } from './application/services/factory';
export type {
  ICheckoutService,
  CheckoutValidateResult,
  CheckoutValidateSuccess,
  CheckoutValidateFailure,
  CheckoutAcceptResult,
  CheckoutAcceptSuccess,
  CheckoutAcceptFailure,
} from './application/interfaces/ICheckoutService';
export type { CheckoutServiceOptions } from './application/services/CheckoutService';

export {
  CheckoutLineSchema,
  CheckoutValidateSchema,
  CheckoutOrderSchema,
  ShippingAddressSchema,
} from './schemas';

export type {
  CheckoutLine,
  CheckoutValidateInput,
  CheckoutOrderInput,
  CheckoutOrderContext,
  CheckoutQuote,
  CheckoutQuoteLine,
  CheckoutAcceptedOrder,
  ShippingAddress,
} from './schemas';

export {
  generateOrderReference,
  isValidOrderReference,
  ORDER_REFERENCE_REGEX,
  CROCKFORD_BASE32_ALPHABET,
} from './domain/order-reference';

export { computeConfirmation } from './domain/confirmation';
export type {
  QuoteConfirmationTerms,
  QuoteConfirmationLine,
  QuoteConfirmationDiscount,
} from './domain/confirmation';

export { onOrderAcceptedRewardsHook } from './domain/rewards-hook';
export type { RewardsHookOrder, RewardsHookOrderItem } from './domain/rewards-hook';
