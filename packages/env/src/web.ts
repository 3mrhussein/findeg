import { z } from "zod";
import { baseSchema, loadEnv, validateEnv } from "./core";

loadEnv();

const webSchema = z.object({
  ...baseSchema,
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

export const env = validateEnv(webSchema);
export type WebEnv = z.infer<typeof webSchema>;
export default env;
