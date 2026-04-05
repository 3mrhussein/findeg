/**
 * Input for user registration.
 */

import { z } from "zod";
import { EmailSchema } from "../types/common";

export const RegisterInputSchema = z
  .object({
    email: EmailSchema,
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
  })
  .strict();

export type RegisterInput = z.infer<typeof RegisterInputSchema>;
