import { z } from 'zod';
import { EmailSchema } from './common';
import { actorTypeEnum, portalRoleEnum } from '../schema/enums';


/**
 * Identity & Authorization Primitives for Database Layer
 */

/**
 * Actor categories that can hold a session.
 * Standardized on database enum values.
 */
export const ActorTypeSchema = z.enum(actorTypeEnum.enumValues);
export type ActorType = z.infer<typeof ActorTypeSchema>;

/** The application portal represented by a Current Session. */
export const ActivePortalSchema = z.enum(['storefront', 'dashboard']);
export type ActivePortal = z.infer<typeof ActivePortalSchema>;

/**
 * Legacy Portal Roles for session classification.
 */
export const PortalRoleSchema = z.enum(portalRoleEnum.enumValues);
export type PortalRole = z.infer<typeof PortalRoleSchema>;

/** Returns the portal selected when a Current Session is first established. */
export function defaultActivePortalForRole(portalRole: PortalRole): ActivePortal {
  return portalRole === 'customer' ? 'storefront' : 'dashboard';
}

/**
 * Returns the portals currently available to a User under the persisted portal-role model.
 * Staff may use the storefront as well as the Dashboard; customers only use the storefront.
 */
export function eligibleActivePortalsForRole(portalRole: PortalRole): ActivePortal[] {
  return portalRole === 'customer' ? ['storefront'] : ['storefront', 'dashboard'];
}

/**
 * Global registry of permission strings used throughout the application.
 */
export const PERMISSION_CODES = {
  // Portal & System
  ADMIN_PORTAL: 'admin.portal',
  ADMIN_DASHBOARD_READ: 'admin.dashboard.read',
  ADMIN_AUDIT_LOG_READ: 'admin.auditlog.read',

  // Catalog Management
  ADMIN_CATEGORIES_READ: 'admin.categories.read',
  ADMIN_CATEGORIES_WRITE: 'admin.categories.write',
  ADMIN_BRANDS_READ: 'admin.brands.read',
  ADMIN_BRANDS_WRITE: 'admin.brands.write',
  ADMIN_PRODUCTS_READ: 'admin.products.read',
  ADMIN_PRODUCTS_WRITE: 'admin.products.write',

  // Sales & Operations
  ADMIN_ORDERS_READ: 'admin.orders.read',
  ADMIN_ORDERS_WRITE: 'admin.orders.write',
  ADMIN_INVENTORY_READ: 'admin.inventory.read',
  ADMIN_INVENTORY_WRITE: 'admin.inventory.write',

  // Assets & Media
  ADMIN_MEDIA_READ: 'admin.media.read',
  ADMIN_MEDIA_WRITE: 'admin.media.write',

  // User & Access Control
  ADMIN_USERS_READ: 'admin.users.read',
  ADMIN_USERS_WRITE: 'admin.users.write',
  ADMIN_ROLES_READ: 'admin.roles.read',
  ADMIN_ROLES_WRITE: 'admin.roles.write',

  // Taxonomy & Groups
  ADMIN_TAGS_READ: 'admin.tags.read',
  ADMIN_TAGS_WRITE: 'admin.tags.write',
  ADMIN_COLLECTIONS_READ: 'admin.collections.read',
  ADMIN_COLLECTIONS_WRITE: 'admin.collections.write',

  // Feature Specific
  ADMIN_SCHOOL_LISTS_READ: 'admin.schoollists.read',
  ADMIN_SCHOOL_LISTS_WRITE: 'admin.schoollists.write',
  ADMIN_DISCOUNT_RULES_READ: 'admin.discountrules.read',
  ADMIN_DISCOUNT_RULES_WRITE: 'admin.discountrules.write',
} as const;

/**
 * Set of Role IDs that are considered administrative.
 */
export const ADMIN_ROLE_IDS = [
  'system_admin',
  'admin',
  'super_admin',
  'inventory_manager',
  'editorial',
  'operations_manager',
  'customer_support',
  'business_analyst',
  'school_liaison',
];

/**
 * Stable identifiers for RBAC and scoped authorization.
 */
export const RoleIdSchema = z.string().min(1);
export type RoleId = z.infer<typeof RoleIdSchema>;

export const PermissionIdSchema = z.string().min(1);
export type PermissionId = z.infer<typeof PermissionIdSchema>;

/**
 * Permission code format: dot-separated lower-case tokens (e.g., "catalog.read")
 */
export const PermissionCodeSchema = z
  .string()
  .regex(/^[a-z][a-z0-9]*(\.[a-z0-9]+)*$/, 'Invalid permission code format');
export type PermissionCode = z.infer<typeof PermissionCodeSchema>;

/**
 * Scope for role grants.
 */
export const RoleScopeSchema = z.enum(['global', 'organization']);
export type RoleScope = z.infer<typeof RoleScopeSchema>;

export const OrganizationIdSchema = z.string().min(1);
export type OrganizationId = z.infer<typeof OrganizationIdSchema>;

export const GuestPrincipalIdSchema = z.string().min(1);
export type GuestPrincipalId = z.infer<typeof GuestPrincipalIdSchema>;

export const UserVOSchema = z.object({
  email: EmailSchema,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  fullName: z.string().min(1),
});
export type UserVO = z.infer<typeof UserVOSchema>;

/**
 * Factory function to create a UserVO from constituent parts.
 * Automatically computes the fullName.
 */
export function createUserVO(data: {
  email: string;
  firstName?: string;
  lastName?: string;
}): UserVO {
  const fName = data.firstName?.trim() || 'Admin';
  const lName = data.lastName?.trim() || '';

  return {
    email: data.email,
    firstName: fName,
    lastName: lName,
    fullName: [fName, lName].filter(Boolean).join(' '),
  };
}

/**
 * Session payload stored in JWT.
 */
export const SessionPayloadSchema = z.object({
  userId: z.number().int().positive(),
  portalRole: PortalRoleSchema,
  // Optional to preserve valid version-1 cookies; the Current Session module derives it.
  activePortal: ActivePortalSchema.optional(),
  user: UserVOSchema,
  subjectId: z.string().min(1).optional(),
  actorType: ActorTypeSchema.optional(),
  activeRoleIds: z.array(RoleIdSchema).default([]).optional(),
  permissionCodes: z.array(PermissionCodeSchema).default([]).optional(),
  organizationId: OrganizationIdSchema.optional(),
  tokenVersion: z.number().int().positive().default(1).optional(),
});
export type SessionPayload = z.infer<typeof SessionPayloadSchema>;

// ─── Predicates ─────────────────────────────────────────────────────────────

export function staffRole(portalRole?: string | null): boolean {
  return portalRole === 'staff';
}

export function schoolRole(portalRole?: string | null): boolean {
  return portalRole === 'school_staff';
}

export function customerRole(portalRole?: string | null): boolean {
  return portalRole === 'customer';
}

export function systemAdmin(session: SessionPayload): boolean {
  return session.activeRoleIds?.includes('system_admin') === true;
}

export function adminSession(session: SessionPayload): boolean {
  if (session.portalRole === 'staff' || session.portalRole === 'school_staff') return true;
  if (session.activeRoleIds?.some((roleId) => ADMIN_ROLE_IDS.includes(roleId))) return true;
  if (session.permissionCodes?.includes(PERMISSION_CODES.ADMIN_PORTAL as any)) return true;
  return false;
}

export function hasPermission(session: SessionPayload, requiredPermission: string): boolean {
  if (systemAdmin(session)) return true;
  return session.permissionCodes?.includes(requiredPermission as any) === true;
}

export function hasAnyPermission(session: SessionPayload, requiredPermissions: string[]): boolean {
  return requiredPermissions.some((permission) => hasPermission(session, permission));
}

export function hasAllPermissions(session: SessionPayload, requiredPermissions: string[]): boolean {
  return requiredPermissions.every((permission) => hasPermission(session, permission));
}

/**
 * Authentication provider classification for linked accounts.
 */
export const AuthProviderSchema = z.enum(['credentials', 'google', 'facebook', 'apple', 'other']);
export type AuthProvider = z.infer<typeof AuthProviderSchema>;

/**
 * Saved payment token provider classification.
 */
export const PaymentProviderSchema = z.enum(['paymob', 'stripe', 'manual', 'other']);
export type PaymentProvider = z.infer<typeof PaymentProviderSchema>;

export const LinkedAuthAccountSchema = z.object({
  id: z.string().min(1),
  provider: AuthProviderSchema,
  providerAccountId: z.string().min(1),
  isPrimary: z.boolean().optional(),
});
export type LinkedAuthAccount = z.infer<typeof LinkedAuthAccountSchema>;

/**
 * Scoped role assignment shape.
 */
export const RoleGrantSchema = z
  .object({
    roleId: RoleIdSchema,
    scope: RoleScopeSchema,
    organizationId: OrganizationIdSchema.optional(),
    permissionCodes: z.array(PermissionCodeSchema).optional(),
  })
  .refine(
    (value) => {
      if (value.scope === 'organization') {
        return !!value.organizationId;
      }
      return true;
    },
    { message: 'organizationId is required when scope is organization' },
  );
export type RoleGrant = z.infer<typeof RoleGrantSchema>;

export const OrganizationMembershipStatusSchema = z.enum(['active', 'invited', 'suspended']);
export type OrganizationMembershipStatus = z.infer<typeof OrganizationMembershipStatusSchema>;

export const OrganizationMembershipSchema = z.object({
  id: z.string().min(1),
  organizationId: OrganizationIdSchema,
  status: OrganizationMembershipStatusSchema,
  roleGrants: z.array(RoleGrantSchema),
});
export type OrganizationMembership = z.infer<typeof OrganizationMembershipSchema>;

/**
 * Saved payment method token.
 */
export const SavedPaymentMethodSchema = z.object({
  id: z.string().min(1),
  provider: PaymentProviderSchema,
  tokenReference: z.string().min(1),
  isDefault: z.boolean().default(false),
});
export type SavedPaymentMethod = z.infer<typeof SavedPaymentMethodSchema>;
