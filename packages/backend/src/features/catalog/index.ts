export * from "./domain";
export * from "./application";

// NOTE: Repository classes NOT exported because they have @ imports (db, schema)
// that break Turbopack bundling. Apps should implement their own data access layer.
// export { DrizzleProductRepository } from "./infrastructure/persistence/DrizzleProductRepository"; // REMOVED
// export { DrizzleCategoryRepository } from "./infrastructure/persistence/DrizzleCategoryRepository"; // REMOVED
// export { DrizzleBrandRepository } from "./infrastructure/persistence/DrizzleBrandRepository"; // REMOVED
// export { DrizzleTagRepository } from "./infrastructure/persistence/DrizzleTagRepository"; // REMOVED
// export { DrizzleInventoryRepository } from "./infrastructure/persistence/DrizzleInventoryRepository"; // REMOVED
