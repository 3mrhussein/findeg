import bcrypt from "bcryptjs";
import { z } from "zod";

import { sql, type Table, type InferInsertModel } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export async function hashPassword(plain: string): Promise<string> {
  return await bcrypt.hash(plain, 12);
}

export async function ensureParents(
  db: PostgresJsDatabase<any>,
  parents: { name: string; table?: any }[],
): Promise<void> {
  for (const parent of parents) {
    const result = (await db.execute(sql.raw(`SELECT count(*) as count FROM ${parent.name}`))) as {
      count: string;
    }[];
    const count = Number(result[0].count);
    if (count === 0) {
      throw new Error(
        `❌ Structural Seeding Error: Parent table "${parent.name}" is empty. Please seed it before proceeding.`,
      );
    }
  }
}

export type ProcessedSeed<T> = {
  [K in keyof T]: T[K] extends string
    ? K extends `${string}At` | "emailVerified" | "expires"
      ? Date | null
      : T[K]
    : T[K];
};

export function prepareSeedData<TTable extends Table>(
  table: TTable,
  data: any[],
  schema?: z.ZodSchema<any>,
): InferInsertModel<TTable>[] {
  return data.map((item, index) => {
    // Optional schema validation
    if (schema) {
      const result = schema.safeParse(item);
      if (!result.success) {
        const firstError = result.error.issues[0];
        throw new Error(
          `❌ Seed Validation Error at index ${index}: [${firstError.path.join(".")}] ${firstError.message}`,
        );
      }
    }

    const newItem = { ...item };
    for (const key in newItem) {
      const val = newItem[key];
      // Convert date strings
      if (
        (key.endsWith("At") ||
          key.endsWith("Date") ||
          key === "emailVerified" ||
          key === "expires") &&
        typeof val === "string"
      ) {
        newItem[key] = new Date(val);
      }
      // Convert numbers to strings for Drizzle Decimal/Numeric types
      if (
        typeof val === "number" &&
        (key.endsWith("Price") ||
          key.endsWith("Amount") ||
          key.endsWith("Cost") ||
          key.endsWith("Rate") ||
          key.endsWith("factorToBase") ||
          key === "rating" ||
          key === "totalPrice" ||
          key === "valueNum")
      ) {
        newItem[key] = val.toString();
      }
    }
    return newItem as InferInsertModel<TTable>;
  });
}

export async function truncateTables(db: PostgresJsDatabase<any>) {
  console.log("🧹 Truncating tables securely across all schemas...");

  const schemas = ["identity", "catalog", "sales", "inventory", "school_engine", "system"];

  for (const schemaName of schemas) {
    try {
      // Get all table names in the schema
      const tables = (await db.execute(
        sql.raw(`
        SELECT tablename FROM pg_catalog.pg_tables 
        WHERE schemaname = '${schemaName}';
      `),
      )) as { tablename: string }[];

      if (tables.length > 0) {
        const tableNames = tables.map((t) => `"${schemaName}"."${t.tablename}"`).join(", ");
        console.log(`  - Truncating ${tables.length} tables in schema "${schemaName}"...`);
        await db.execute(sql.raw(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`));
      }
    } catch (e) {
      console.warn(`⚠️ Failed to truncate schema "${schemaName}" (it might not exist yet):`, e);
    }
  }

  console.log("✅ All tables truncated.");
}
