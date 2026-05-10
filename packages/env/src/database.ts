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
  DB_MIGRATING: z.coerce.boolean().optional(),
  DB_SEEDING: z.coerce.boolean().optional(),
  DB_SSL: z
    .preprocess((val) => {
      if (val === 'false') return false;
      if (val === 'true') return true;
      return val;
    }, z.coerce.boolean())
    .optional(),
});

export const env = validateEnv(databaseSchema);
export type DatabaseEnv = z.infer<typeof databaseSchema>;
export default env;
