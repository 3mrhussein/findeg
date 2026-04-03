/**
 * Database Configuration
 *
 * This file handles database connection configuration.
 * It reads from environment variables and provides
 * a configured database connection.
 */
import postgres from "postgres";
import * as schema from "./schema";
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
export declare function createDatabaseConnection(): import("drizzle-orm/postgres-js").PostgresJsDatabase<typeof schema> & {
    $client: postgres.Sql<{}>;
};
/**
 * Database connection instance
 *
 * This is a singleton connection that can be reused
 * throughout the application.
 */
export declare const db: import("drizzle-orm/postgres-js").PostgresJsDatabase<typeof schema> & {
    $client: postgres.Sql<{}>;
};
