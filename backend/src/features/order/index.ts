export type { Order, OrderItem } from './domain/entities/Order';
export { ShippingAddressSchema, type ShippingAddress } from './domain/value-objects/ShippingAddress';
export { VariantSnapshotSchema, type VariantSnapshot } from './domain/value-objects/VariantSnapshot';
export type { IOrderRepository, OrderFilters } from './application/interfaces/IOrderRepository';
export type { IOrderService, CheckoutPrefillData } from './application/interfaces/IOrderService';
export { OrderStatusUpdateSchema, type OrderStatusUpdate } from './application/dtos/OrderStatusUpdate';
export { createOrderServices, type OrderServices } from './application/services/factory';
export {
  ORDER_STATUS_OPTIONS,
  normalizeOrderStatus,
  getAllowedOrderStatusTransitions,
  canTransitionOrderStatus,
  getOrderStatusLabel,
} from './application/utils/order-status-transitions';
export {
  PAYMENT_STATUS_OPTIONS,
  paymentStatus,
  normalizePaymentStatus,
  getAllowedPaymentStatusTransitions,
  canTransitionPaymentStatus,
  getPaymentStatusLabel,
} from './application/utils/order-payment-status-transitions';
