// NOTE: Domain types are NOT exported (removed from domain/index.ts) because many have @ imports
// that break Turbopack bundling (e.g., TagInput imports from @features/catalog/domain/entities/Tag)
// Apps should define their own input types or use minimal interfaces
export * from "./domain";
export * from "./application/interfaces";

// ✅ NEW: Service factory for administration feature
// Export factory function that apps can use to get service instances
export { createAdministrationServices } from "./application/services/factory";
export type { AdministrationServices } from "./application/services/factory";

// NOTE: Service classes are NOT exported because they contain @ imports
// that break Turbopack bundling. Apps should use the factory function above.
// NOTE: admin-orders-page query NOT exported because it has @ imports (getServices, core types)
// Apps should implement their own queries using repository classes
// export * from "./application/queries/admin-orders-page"; // REMOVED

// NOTE: Repository classes NOT exported because they have @ imports (db, schema)
// that break Turbopack bundling. Apps should implement their own data access layer.
// export { DrizzleAuditLogRepository } from "./infrastructure"; // REMOVED
