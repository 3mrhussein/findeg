/**
 * Credentials for authentication (login).
 *
 * @description Used when a user attempts to log in via email and password.
 */

import { z } from "zod";
import { EmailSchema } from "../types/primitives";

export const AuthCredentialsSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, "Password is required"),
});

export type AuthCredentials = z.infer<typeof AuthCredentialsSchema>;
