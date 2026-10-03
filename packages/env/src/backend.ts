import { z } from 'zod';
import { baseSchema, loadEnv, validateEnv } from './core';

loadEnv();

const backendSchema = z.object({
  ...baseSchema,
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32).optional(),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('no-reply@findeg.com'),
  EMAIL_FROM_NAME: z.string().default('Findeg'),
  /** Bearer secret for POST /api/internal/outbox/drain; the sweeper rejects every call when unset. */
  OUTBOX_SWEEPER_SECRET: z.string().min(16).optional(),
  /** Signs Guest Order Access codes' hashes and the order cookie; guest access fails closed when unset. */
  GUEST_ACCESS_SECRET: z.string().min(32).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

export const env = validateEnv(backendSchema);
export type BackendEnv = z.infer<typeof backendSchema>;
export default env;
