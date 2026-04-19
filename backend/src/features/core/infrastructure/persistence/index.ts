/**
 * Persistence Layer Exports
 * 
 * Note: Infrastructure code is not exposed via package.json exports.
 * This keeps backend framework-agnostic (no React/Next.js dependencies).
 * Apps access backend only through application and presentation layers.
 */

export { db } from "./database.config";
export * from "./contracts";
