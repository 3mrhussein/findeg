/**
 * Session payload stored in JWT.
 *
 * @description Represents the authenticated user's identity in the session token.
 */
import { z } from "zod";
export declare const SessionPayloadSchema: z.ZodObject<{
    userId: z.ZodNumber;
    portalRole: z.ZodEnum<{
        customer: "customer";
        staff: "staff";
        school_staff: "school_staff";
    }>;
    user: z.ZodObject<{
        email: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        fullName: z.ZodString;
    }, z.core.$strip>;
    subjectId: z.ZodOptional<z.ZodString>;
    actorType: z.ZodOptional<z.ZodEnum<{
        guest: "guest";
        user: "user";
        service: "service";
    }>>;
    activeRoleIds: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString>>>;
    permissionCodes: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString>>>;
    organizationId: z.ZodOptional<z.ZodString>;
    tokenVersion: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, z.core.$strip>;
export type SessionPayload = z.infer<typeof SessionPayloadSchema>;
