import { z } from "zod";
/**
 * Actor categories that can hold a session.
 */
export const ActorTypeSchema = z.enum(["guest", "user", "service"]);
/**
 * Stable identifiers for RBAC and scoped authorization.
 * Kept as strings to support numeric IDs, UUIDs, or code-based IDs.
 */
export const RoleIdSchema = z.string().min(1);
export const PermissionIdSchema = z.string().min(1);
/**
 * Permission code format:
 * - dot-separated lower-case tokens
 * - examples: "catalog.read", "catalog.write", "order.refund"
 */
export const PermissionCodeSchema = z
    .string()
    .regex(/^[a-z][a-z0-9]*(\.[a-z0-9]+)*$/, "Invalid permission code format");
/**
 * Scope for role grants.
 */
export const RoleScopeSchema = z.enum(["global", "organization"]);
export const OrganizationIdSchema = z.string().min(1);
export const GuestPrincipalIdSchema = z.string().min(1);
/**
 * Authentication provider classification for linked accounts.
 */
export const AuthProviderSchema = z.enum(["credentials", "google", "facebook", "apple", "other"]);
/**
 * Saved payment token provider classification.
 */
export const PaymentProviderSchema = z.enum(["paymob", "stripe", "manual", "other"]);
/**
 * Scoped role assignment shape.
 */
export const RoleGrantSchema = z
    .object({
    roleId: RoleIdSchema,
    scope: RoleScopeSchema,
    organizationId: OrganizationIdSchema.optional(),
})
    .refine((value) => {
    if (value.scope === "organization") {
        return !!value.organizationId;
    }
    return true;
}, { message: "organizationId is required when scope is organization" });
