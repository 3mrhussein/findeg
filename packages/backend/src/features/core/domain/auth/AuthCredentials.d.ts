/**
 * Credentials for authentication (login).
 *
 * @description Used when a user attempts to log in via email and password.
 */
import { z } from "zod";
export declare const AuthCredentialsSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type AuthCredentials = z.infer<typeof AuthCredentialsSchema>;
