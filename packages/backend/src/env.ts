import { z, ZodError } from "zod";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DATABASE_URL: z.url(),
  DB_MIGRATING: z.stringbool().default(false),
  DB_SEEDING: z.stringbool().default(false),
  DB_SSL: z.boolean().default(false),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  // Third Party Services (Optional)
  RESEND_API_KEY: z.string().optional(),
  CMS_API_URL: z.url().optional(),
  CMS_API_KEY: z.string().optional(),

  // Storage
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_REGION: z.string().optional(),
});

try {
  envSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    let message = "❌ Missing or invalid required values in .env:\n";
    error.issues.forEach((issue) => {
      message += ` - ${String(issue.path[0])}: ${issue.message}\n`;
    });
    const e = new Error(message);
    e.stack = "";
    throw e;
  } else {
    console.error("❌ Unexpected error during environment validation:", error);
  }
}

export type EnvSchema = z.infer<typeof envSchema>;

export default envSchema.parse(process.env);
