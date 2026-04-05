/**
 * Persistence Layer Exports
 * 
 * Note: Database configuration and contracts are intended for server-side use only.
 * The framework layer (dashboard/storefront apps) is responsible for ensuring server-only execution.
 */
export { db } from "./database.config";
export * from "./contracts";
