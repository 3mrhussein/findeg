import { z } from "zod";
/**
 * Actor categories that can hold a session.
 */
export declare const ActorTypeSchema: z.ZodEnum<{
    guest: "guest";
    user: "user";
    service: "service";
}>;
export type ActorType = z.infer<typeof ActorTypeSchema>;
/**
 * Stable identifiers for RBAC and scoped authorization.
 * Kept as strings to support numeric IDs, UUIDs, or code-based IDs.
 */
export declare const RoleIdSchema: z.ZodString;
export type RoleId = z.infer<typeof RoleIdSchema>;
export declare const PermissionIdSchema: z.ZodString;
export type PermissionId = z.infer<typeof PermissionIdSchema>;
/**
 * Permission code format:
 * - dot-separated lower-case tokens
 * - examples: "catalog.read", "catalog.write", "order.refund"
 */
export declare const PermissionCodeSchema: z.ZodString;
export type PermissionCode = z.infer<typeof PermissionCodeSchema>;
/**
 * Scope for role grants.
 */
export declare const RoleScopeSchema: z.ZodEnum<{
    global: "global";
    organization: "organization";
}>;
export type RoleScope = z.infer<typeof RoleScopeSchema>;
export declare const OrganizationIdSchema: z.ZodString;
export type OrganizationId = z.infer<typeof OrganizationIdSchema>;
export declare const GuestPrincipalIdSchema: z.ZodString;
export type GuestPrincipalId = z.infer<typeof GuestPrincipalIdSchema>;
/**
 * Authentication provider classification for linked accounts.
 */
export declare const AuthProviderSchema: z.ZodEnum<{
    credentials: "credentials";
    google: "google";
    facebook: "facebook";
    apple: "apple";
    other: "other";
}>;
export type AuthProvider = z.infer<typeof AuthProviderSchema>;
/**
 * Saved payment token provider classification.
 */
export declare const PaymentProviderSchema: z.ZodEnum<{
    other: "other";
    paymob: "paymob";
    stripe: "stripe";
    manual: "manual";
}>;
export type PaymentProvider = z.infer<typeof PaymentProviderSchema>;
/**
 * Scoped role assignment shape.
 */
export declare const RoleGrantSchema: z.ZodObject<{
    roleId: z.ZodString;
    scope: z.ZodEnum<{
        global: "global";
        organization: "organization";
    }>;
    organizationId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type RoleGrant = z.infer<typeof RoleGrantSchema>;
