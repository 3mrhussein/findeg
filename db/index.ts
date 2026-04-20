import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
export * from "./schema";
import env from "../env";

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

export type Db = typeof db;
export const db = drizzle(connection, { schema, logger: true });
