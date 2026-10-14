import type {
  CheckoutAcceptedOrder,
  CheckoutOrderContext,
  CheckoutOrderInput,
  CheckoutQuote,
  CheckoutValidateInput,
} from '../checkout-input/types';
import type { DbTransaction } from '@findeg/db/queries';

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
    listItemIds?: number[];
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
      | 'idempotency-in-progress'
      | 'list-unavailable'
      | 'selection-invalid';
    message: string;
    quote?: CheckoutQuote;
    shortfalls?: Array<{ variantId: number; requested: number; available: number }>;
    listItemIds?: number[];
  };
}

export type CheckoutAcceptResult = CheckoutAcceptSuccess | CheckoutAcceptFailure;

/**
 * Outbox enqueue port. Backend infrastructure supplies it; the row commits or rolls back with the
 * Order on the same transaction. Payloads hold ids only (ADR-0008).
 */
export type OutboxEnqueue = (
  tx: DbTransaction,
  id: string,
  kind: string,
  payload: Record<string, unknown>,
) => Promise<void>;

export interface ICheckoutService {
  validate(input: CheckoutValidateInput): Promise<CheckoutValidateResult>;
  accept(input: CheckoutOrderInput, context?: CheckoutOrderContext): Promise<CheckoutAcceptResult>;
}

export interface CheckoutServiceOptions {
  /** Source of the acceptance time that decides whether a List Offer is active. */
  clock?: () => Date;
  /** Writes the order-accepted outbox row on the acceptance transaction. */
  enqueue: OutboxEnqueue;
}
