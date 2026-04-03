import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load local env files explicitly for Drizzle CLI runs.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const databaseUrl =
  process.env.DATABASE_URL ||
  `postgres://${process.env.POSTGRES_USER || "findeg_user"}:${process.env.POSTGRES_PASSWORD || "findeg_dev_password"}@${process.env.POSTGRES_HOST || "localhost"}:${process.env.POSTGRES_PORT || "5432"}/${process.env.POSTGRES_DB || "findeg_dev"}`;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Please define it in your environment.");
}

export default defineConfig({
  schema: "./src/features/core/infrastructure/persistence/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  schemaFilter: ["public", "identity", "catalog", "sales", "inventory", "school_engine", "system"],
  verbose: true,
  strict: true,
});
