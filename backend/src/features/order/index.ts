export * from './domain';
export type { IOrderRepository } from './application/interfaces/IOrderRepository';
export * from './application/dtos';

// Apps should use the service factory from the application layer.
export { createOrderServices, type OrderServices } from './application/services/factory';

// Utility exports remain pure TypeScript.
export * from './application/utils/order-status-transitions';
export * from './application/utils/order-payment-status-transitions';

