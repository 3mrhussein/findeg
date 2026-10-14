/**
 * Order vocabulary for Staff and customer reads and lifecycle commands. The server factory,
 * typed errors and Staff write permission are runtime values; the input schemas and the
 * Order-status message protocol are pure and load without application configuration.
 */
export { createOrders } from './helpers';
export type {
  Order,
  OrderActivityEntry,
  OrderDatabase,
  OrderDetail,
  OrderFilters,
  OrderItem,
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
