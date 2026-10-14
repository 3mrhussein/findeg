/**
 * Order vocabulary for Staff and customer reads and lifecycle commands, Checkout (Quote, Order
 * Acceptance) and Guest Order Access. The server factories, typed errors and Staff write permission
 * are runtime values; the input schemas and the Order-status message protocol are pure and load
 * without application configuration. Database modules load only when an operation runs.
 */
export { createOrders } from './helpers';
export type {
  Order,
  OrderActivityEntry,
  OrderDatabase,
  OrderDetail,
  OrderFilters,
  OrderItem,
  OrderNote,
  Orders,
  OrdersDependencies,
  OrderStats,
  OrderStatsOptions,
} from './types';
export * from './features/input-schemas';
export * from './features/order-events';
export {
  InvalidOrderStatusTransitionError,
  InvalidPaymentStatusTransitionError,
  OrderNotFoundError,
} from './features/order-errors';
export type {
  OrderStatusTransitionResult,
  PaymentStatusTransitionResult,
} from './features/order-errors';
export { assertCanWriteOrders, canWriteOrders } from './features/write-permission';
export type { OrderStaffActor } from './features/write-permission';
export { DomainError, NotAuthorizedError } from '@findeg/domain-errors';

export {
  CheckoutLineSchema,
  CheckoutOrderSchema,
  CheckoutShippingAddressSchema,
  CheckoutValidateSchema,
  ListCheckoutLineSchema,
} from './features/checkout-input';
export { createCheckoutService, CheckoutService } from './features/order-acceptance';
export {
  ORDER_ACCEPTED_KIND,
  ORDER_SUCCESS_MESSAGES,
  orderAcceptedId,
} from './features/order-acceptance';
export { computeOrderFingerprint } from './features/checkout-idempotency';
export {
  ListUnavailableError,
  SelectionInvalidError,
  UnavailableVariantError,
} from './features/checkout-errors';
export { hashCode, mintCode } from './features/guest-access-codes';
export { GUEST_ORDER_COOKIE, GUEST_ORDER_TOKEN_SECONDS } from './features/guest-access-token';
export { createGuestAccessService, GuestAccessService } from './features/guest-access';
export { GUEST_ACCESS_KIND, guestAccessId } from './features/guest-access';
export { GuestAccessRequestSchema, GuestAccessVerifySchema } from './features/guest-access-input';
