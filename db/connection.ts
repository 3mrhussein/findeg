import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import env from "../env";

/**
 * Database Connection Configuration
 * 
 * This file should ONLY be imported in server-side code (Server Components, 
 * API Routes, or Backend Services). Importing this in Client Components 
 * will cause build errors due to Node.js native module dependencies (net, tls).
 */

export const connection = postgres(env.DATABASE_URL, {
  // Connection pool configuration
  max: env.DB_MIGRATING || env.DB_SEEDING ? 1 : undefined,
  onnotice: env.DB_SEEDING ? () => {} : undefined,

  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds

  // SSL configuration (for production)
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,

  // Transform configuration
  transform: {
    // Transform undefined to null for PostgreSQL compatibility
    undefined: null,
  },
});

export const db = drizzle(connection, { schema, logger: true });
export type Db = typeof db;
