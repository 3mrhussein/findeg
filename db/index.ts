/**
 * DB Package Entry Point
 * 
 * This file only exports schemas and enums. It is SAFE to import in:
 * - Client Components (for types and Zod schemas)
 * - Shared domain logic
 * 
 * To access the database instance (db) or connection, import from '@findeg/db/connection'.
 */

export * from "./schema";
export * from "./types";
