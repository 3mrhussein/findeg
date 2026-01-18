/**
 * Database Module Exports
 *
 * This file exports all database-related functionality:
 * - Database connection
 * - Database schemas
 * - Database utilities
 */

// Export database connection
export { db } from './connection';

// Export schemas
export * from './schema/products';

// Export database utilities
export * from '../config/database.config';