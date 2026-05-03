import { z, ZodError } from "zod";

// env.ts
const isServer = typeof window === "undefined";

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
  DB_USER: isServer ? z.string() : z.string().optional(),
  DB_PASSWORD: isServer ? z.string() : z.string().optional(),
  DB_NAME: isServer ? z.string() : z.string().optional(),
  DATABASE_URL: isServer ? z.string() : z.string().optional(),
  DB_MIGRATING: stringToBool.default(false),
  DB_SEEDING: stringToBool.default(false),
  DB_SSL: stringToBool.default(false),

  // JWT
  JWT_SECRET: isServer ? z.string().min(32) : z.string().optional(),
  JWT_REFRESH_SECRET: isServer ? z.string().min(32) : z.string().optional(),

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

function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof ZodError && isServer) {
      let message = "❌ Missing or invalid required values in .env:\n";
      error.issues.forEach((issue) => {
        message += ` - ${String(issue.path[0])}: ${issue.message}\n`;
      });
      const e = new Error(message);
      e.stack = "";
      throw e;
    }
    // In client, we just return what we have (likely partially parsed)
    return process.env as any;
  }
}

const env = validateEnv();

export type EnvSchema = z.infer<typeof envSchema>;
export default env as EnvSchema;
