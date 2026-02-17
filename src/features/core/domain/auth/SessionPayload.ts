/**
 * Session payload stored in JWT.
 *
 * @description Represents the authenticated user's identity in the session token.
 */

import { z } from "zod";
import { EmailSchema } from "../types/common";
import { UserRoleSchema } from "../types/common";

export const SessionPayloadSchema = z.object({
  userId: z.number().int().positive(),
  email: EmailSchema,
  role: UserRoleSchema,
});

export type SessionPayload = z.infer<typeof SessionPayloadSchema>;
