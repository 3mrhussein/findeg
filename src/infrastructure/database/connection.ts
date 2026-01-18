/**
 * Database Connection
 *
 * This file exports the database connection instance.
 * It uses the postgres driver with connection pooling, wrapped by Drizzle ORM.
 *
 * Import this file to get the database connection:
 * ```typescript
 * import { db } from '@/infrastructure/database/connection';
 * ```
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { createDatabaseConnection } from '../config/database.config';

/**
 * Postgres client instance (raw connection)
 */
const client = createDatabaseConnection();

/**
 * Drizzle database instance
 *
 * This is a singleton database instance that can be reused
 * throughout the application. It handles:
 * - Type-safe queries
 * - Connection pooling (via postgres client)
 * - Automatic reconnection
 *
 * Usage:
 * ```typescript
 * import { db } from '@/infrastructure/database/connection';
 *
 * const products = await db.select().from(products);
 * ```
 */
export const db = drizzle(client);