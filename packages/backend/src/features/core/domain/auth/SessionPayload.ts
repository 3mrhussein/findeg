/**
 * Session payload stored in JWT.
 *
 * @description Represents the authenticated user's identity in the session token.
 */

import { z } from "zod";
import { EmailSchema, PortalRoleSchema } from "../types/primitives";
import {
  ActorTypeSchema,
  OrganizationIdSchema,
  PermissionCodeSchema,
  RoleIdSchema,
  UserVOSchema,
} from "../value-objects";

export const SessionPayloadSchema = z.object({
  userId: z.number().int().positive(),
  portalRole: PortalRoleSchema,
  user: UserVOSchema,

  // Additive v2 identity/session fields.
  subjectId: z.string().min(1).optional(),
  actorType: ActorTypeSchema.optional(),
  activeRoleIds: z.array(RoleIdSchema).default([]).optional(),
  permissionCodes: z.array(PermissionCodeSchema).default([]).optional(),
  organizationId: OrganizationIdSchema.optional(),
  tokenVersion: z.number().int().positive().default(1).optional(),
});

export type SessionPayload = z.infer<typeof SessionPayloadSchema>;
