/**
 * DB Package Entry Point
 *
 * This entry exports both primitive types and Drizzle table definitions.
 * Client Components and pure shared schemas import '@findeg/db/types' instead,
 * so database implementation modules cannot enter their bundle.
 *
 * To access the database instance (db) or connection, import from '@findeg/db/connection'.
 */

export * from './types';
export * from './schema';
