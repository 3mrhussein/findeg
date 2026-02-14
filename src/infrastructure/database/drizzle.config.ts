/**
 * Drizzle ORM Configuration
 *
 * This file configures Drizzle Kit for:
 * - Schema generation
 * - Migration generation
 * - Database introspection
 */

import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config();

/**
 * Drizzle Kit Configuration
 *
 * This configuration tells Drizzle:
 * - Where to find schema files
 * - Where to output migrations
 * - Database connection details
 */
export default {
  // Schema files location
  schema: "./src/infrastructure/database/schema/*.ts",

  // Output directory for migrations
  out: "./drizzle",

  // Database driver
  dialect: "postgresql",

  // Database connection
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },

  // Verbose output
  verbose: true,

  // Strict mode
  strict: true,
} satisfies Config;
