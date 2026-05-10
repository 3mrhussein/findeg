import { z } from "zod";
import { baseSchema, loadEnv, validateEnv } from "./core";

loadEnv();

const databaseSchema = z.object({
  ...baseSchema,
  DATABASE_URL: z.string().min(1),
  DB_HOST: z.string().optional(),
  DB_PORT: z.coerce.number().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string().optional(),
});

export const env = validateEnv(databaseSchema);
export type DatabaseEnv = z.infer<typeof databaseSchema>;
export default env;
