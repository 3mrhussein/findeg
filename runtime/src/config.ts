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
  WORKER_HOST: z.string().min(1).default('127.0.0.1'),
  WORKER_PORT: z.coerce.number().int().min(1).max(65535).default(3100),
});
const migrationSchema = z.object({
  ...release,
  ...database,
});

export function readWorkerConfig(environment: Environment) {
  return parse(workerSchema, environment);
}
export function readMigrationConfig(environment: Environment) {
  return parse(migrationSchema, environment);
}
export type WorkerConfig = ReturnType<typeof readWorkerConfig>;
export type MigrationConfig = ReturnType<typeof readMigrationConfig>;
