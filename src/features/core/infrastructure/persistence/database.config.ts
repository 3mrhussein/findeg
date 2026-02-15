/**
 * Database Configuration
 *
 * This file handles database connection configuration.
 * It reads from environment variables and provides
 * a configured database connection.
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

/**
 * Get database connection string from environment
 *
 * @returns Database connection string
 * @throws Error if DATABASE_URL is not set
 */
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " + "Please set it in your .env file.",
    );
  }

  return url;
}

/**
 * Create database connection
 *
 * This creates a connection pool using the postgres driver.
 * The connection is configured with:
 * - Connection pooling
 * - SSL mode (if needed)
 * - Max connections
 *
 * @returns Postgres client instance
 */
export function createDatabaseConnection() {
  const connectionString = getDatabaseUrl();

  const client = postgres(connectionString, {
    // Connection pool configuration
    max: 10, // Maximum number of connections in the pool
    idle_timeout: 20, // Close idle connections after 20 seconds
    connect_timeout: 10, // Connection timeout in seconds

    // SSL configuration (for production)
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,

    // Transform configuration
    transform: {
      // Transform undefined to null for PostgreSQL compatibility
      undefined: null,
    },
  });

  return drizzle(client, { schema });
}

/**
 * Database connection instance
 *
 * This is a singleton connection that can be reused
 * throughout the application.
 */
export const db = createDatabaseConnection();
