import { z } from 'zod';

type Environment = Readonly<Record<string, string | undefined>>;
const release = {
  RELEASE_REVISION: z.string().regex(/^[a-f0-9]{40}$/, 'must be a full Git commit SHA'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
};
const database = {
  DATABASE_URL: z
    .url()
    .refine((value) => ['postgres:', 'postgresql:'].includes(new URL(value).protocol)),
  DB_SSL: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
};
const webSchema = z.object({
  ...release,
  ...database,
  PARTNER_INVITATION_DAYS: z.coerce.number().int().min(1).max(30).default(7),
});

function parse<T>(schema: z.ZodType<T>, environment: Environment): T {
  const result = schema.safeParse(environment);
  if (!result.success) {
    // Report keys only: configuration values may contain credentials.
    throw new Error(
      `Invalid configuration: ${result.error.issues.map((issue) => issue.path.join('.')).join(', ')}`,
    );
  }
  return result.data;
}

export function readWebConfig(environment: Environment) {
  return parse(webSchema, environment);
}
export type WebConfig = ReturnType<typeof readWebConfig>;

const workerSchema = z.object({
  ...release,
  ...database,
  DELIVERY_ADAPTER: z.enum(['sink']).default('sink'),
  OUTBOX_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(20).default(5),
  OUTBOX_POLL_MS: z.coerce.number().int().min(10).max(60000).default(1000),
  OUTBOX_RETRY_MS: z.coerce.number().int().min(10).max(3600000).default(5000),
  OUTBOX_DELIVERY_TIMEOUT_MS: z.coerce.number().int().min(10).max(30000).default(10000),
  WORKER_HOST: z.string().min(1).default('127.0.0.1'),
  WORKER_PORT: z.coerce.number().int().min(1).max(65535).default(3100),
});
const migrationSchema = z.object({
  ...release,
  ...database,
});

export function readWorkerConfig(environment: Environment) {
  const config = parse(workerSchema, environment);
  // Environment flags cannot certify a provider. Add a reviewed production
  // adapter only after provider selection and controlled delivery validation.
  if (config.NODE_ENV === 'production') {
    throw new Error('Invalid configuration: DELIVERY_ADAPTER');
  }
  return config;
}
export function readMigrationConfig(environment: Environment) {
  return parse(migrationSchema, environment);
}
export type WorkerConfig = ReturnType<typeof readWorkerConfig>;
export type MigrationConfig = ReturnType<typeof readMigrationConfig>;
