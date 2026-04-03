import { pgSchema } from "drizzle-orm/pg-core";

/**
 * Database Schemas
 *
 * Centralizing schema definitions avoids circular dependencies
 * during Drizzle initialization.
 */

export const identitySchema = pgSchema("identity");
export const catalogSchema = pgSchema("catalog");
export const salesSchema = pgSchema("sales");
export const inventorySchema = pgSchema("inventory");
export const schoolEngineSchema = pgSchema("school_engine");
export const systemSchema = pgSchema("system");
