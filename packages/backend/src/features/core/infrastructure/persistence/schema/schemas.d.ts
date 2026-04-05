/**
 * Database Schemas
 *
 * Centralizing schema definitions avoids circular dependencies
 * during Drizzle initialization.
 */
export declare const identitySchema: import("drizzle-orm/pg-core").PgSchema<"identity">;
export declare const catalogSchema: import("drizzle-orm/pg-core").PgSchema<"catalog">;
export declare const salesSchema: import("drizzle-orm/pg-core").PgSchema<"sales">;
export declare const inventorySchema: import("drizzle-orm/pg-core").PgSchema<"inventory">;
export declare const schoolEngineSchema: import("drizzle-orm/pg-core").PgSchema<"school_engine">;
export declare const systemSchema: import("drizzle-orm/pg-core").PgSchema<"system">;
