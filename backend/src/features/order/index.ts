export * from "./domain";
export type { IOrderRepository } from "./application/interfaces/IOrderRepository";

// NOTE: Order actions contain @ imports (ServiceContainer, domain/cache)
// and cannot be exported. Apps should implement their own actions.
// export * from "./application/actions/order"; // REMOVED

// Service factory for apps to create service instances
export { createOrderServices, type OrderServices } from "./application/services/factory";

// Utility exports (pure TypeScript, no @ imports)
export * from "./application/utils/order-status-transitions";
export * from "./application/utils/order-payment-status-transitions";

// NOTE: Repository classes NOT exported because they have @ imports (db, schema)
// that break Turbopack bundling. Apps should implement their own data access layer.
// export { DrizzleOrderRepository } from "./infrastructure/persistence/DrizzleOrderRepository"; // REMOVED
