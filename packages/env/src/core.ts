import { z, ZodError, ZodObject, ZodRawShape } from "zod";
import { loadEnvFile } from "node:process";
import { join } from "node:path";

const isServer = typeof window === "undefined";

/**
 * Automatically try to load .env from common locations in a monorepo
 */
export function loadEnv() {
  if (!isServer) return;

  const paths = [
    join(process.cwd(), ".env"),
    join(process.cwd(), "../.env"),
    join(process.cwd(), "../../.env"),
  ];

  for (const path of paths) {
    try {
      loadEnvFile(path);
      break; // Stop after first successful load
    } catch {
      // Continue to next path
    }
  }
}

/**
 * Common validation logic
 */
export function validateEnv<T extends ZodRawShape>(schema: ZodObject<T>) {
  try {
    return schema.parse(process.env);
  } catch (error) {
    if (error instanceof ZodError && isServer) {
      const message =
        "❌ Invalid environment variables:\n" +
        error.issues.map((i) => ` - ${i.path.join(".")}: ${i.message}`).join("\n");

      throw new Error(message);
    }

    return process.env as any;
  }
}

/**
 * Base schema included in all environments
 */
export const baseSchema = {
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
};
