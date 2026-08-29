import { z } from "zod";
import { baseSchema, loadEnv, validateEnv } from "./core";

loadEnv();

const backendSchema = z.object({
  ...baseSchema,
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32).optional(),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  RESEND_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_DASHBOARD_URL: z.string().url().default('http://localhost:3001'),
});

export const env = validateEnv(backendSchema);
export type BackendEnv = z.infer<typeof backendSchema>;
export default env;
