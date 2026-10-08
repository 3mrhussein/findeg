// Public barrel for the order feature. Client Components needing only
// ShippingAddressSchema/VariantSnapshotSchema/OrderStatusUpdateSchema should
// import from './schemas' instead, which has no import path to
// './factory' or 'db/src/connection.ts'. See
// docs/adr/0001-backend-feature-barrels.md.
export type { Order, OrderItem } from './domain/entities/Order';
export {
  ORDER_STATISTICS_TIME_ZONE,
  type OrderStats,
  type OrderStatsOptions,
  type OrderStatisticsDependencies,
  type OrderDatabase,
} from './statistics';
export {
  ShippingAddressSchema,
  type ShippingAddress,
} from './domain/value-objects/ShippingAddress';
export {
  VariantSnapshotSchema,
  type VariantSnapshot,
} from './domain/value-objects/VariantSnapshot';
export {
  OrderStatusUpdateSchema,
  type OrderStatusUpdate,
} from './application/dtos/OrderStatusUpdate';
export {
  createOrders,
  type Orders,
  type OrdersDependencies,
  type OrderFilters,
  type OrderActivityEntry,
} from './factory';
export { canWriteOrders, assertCanWriteOrders, type OrderStaffActor } from './actor';
export {
  OrderNotFoundError,
  InvalidOrderStatusTransitionError,
  InvalidPaymentStatusTransitionError,
  InvalidOrderStatusValueError,
} from './errors';
export type { OrderStatusTransitionResult, PaymentStatusTransitionResult } from './transitions';
export { NotAuthorizedError } from '../core/errors';
export {
  ORDER_STATUS_OPTIONS,
  getAllowedOrderStatusTransitions,
  canTransitionOrderStatus,
  getOrderStatusLabel,
} from './application/utils/order-status-transitions';
export {
  PAYMENT_STATUS_OPTIONS,
  paymentStatus,
  getAllowedPaymentStatusTransitions,
  canTransitionPaymentStatus,
  getPaymentStatusLabel,
} from './application/utils/order-payment-status-transitions';
