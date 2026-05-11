export * from './domain';
export * from './application/dtos';

// Export the service factory used by apps and server actions.
export { createAdministrationServices } from './application/services/factory';
export type { AdministrationServices } from './application/services/factory';

// Service classes are not exported because they contain server-only imports.
// Apps should consume the factory and DTO exports above.
// admin-orders-page query is also intentionally not exported for the same reason.
// export * from "./application/queries/admin-orders-page"; // REMOVED
// Repository classes are not exported because they depend on db/schema internals.
// export { DrizzleAuditLogRepository } from "./infrastructure"; // REMOVED
