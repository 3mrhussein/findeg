import { defineConfig } from "drizzle-kit";
import env from "@findeg/env";

export default defineConfig({
  dialect: "postgresql",
  schema: [
    "./schema/identity/*.ts",
    "./schema/catalog/*.ts",
    "./schema/sales/*.ts",
    "./schema/inventory/*.ts",
    "./schema/school-engine/*.ts",
    "./schema/system/*.ts",
    "./schema/*.ts",
  ],
  schemaFilter: ["public", "identity", "catalog", "sales", "inventory", "school_engine", "system"],
  out: "./migrations",
  dbCredentials: {
    url: env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
