import { z, ZodError } from "zod";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

if (typeof process !== "undefined" && !process.env.NEXT_RUNTIME) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  dotenv.config({ path: path.join(__dirname, ".env") });
}

const stringToBool = z
  .string()
  .toLowerCase()
  .transform((v) => v === "true")
  .or(z.boolean());

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DATABASE_URL: z.string(),
  DB_MIGRATING: stringToBool.default(false),
  DB_SEEDING: stringToBool.default(false),
  DB_SSL: stringToBool.default(false),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  // Email / Notifications
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional().default("no-reply@findeg.com"),
  EMAIL_FROM_NAME: z.string().optional().default("Findeg"),

  // Frontend / Public URLs
  NEXT_PUBLIC_APP_URL: z.string().url().default("https://findeg.com"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://findeg.com"),

  // Third Party Services (Optional)
  CMS_API_URL: z.string().url().optional(),
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
