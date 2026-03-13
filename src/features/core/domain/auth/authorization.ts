import type { SessionPayload } from "./SessionPayload";
import type { PermissionCode } from "../value-objects";

/**
 * Global registry of permission strings used throughout the application.
 *
 * This object serves as the single source of truth for all "Action-Resource"
 * pairs. Use these keys when calling `hasPermission` or `can` to ensure
 * consistency and avoid typos.
 *
 * @example
 * if (hasPermission(session, PERMISSION_CODES.ADMIN_PRODUCTS_WRITE)) { ... }
 */
export const PERMISSION_CODES = {
  // Portal & System
  ADMIN_PORTAL: "admin.portal",
  ADMIN_DASHBOARD_READ: "admin.dashboard.read",
  ADMIN_AUDIT_LOG_READ: "admin.auditlog.read",

  // Catalog Management
  ADMIN_CATEGORIES_READ: "admin.categories.read",
  ADMIN_CATEGORIES_WRITE: "admin.categories.write",
  ADMIN_BRANDS_READ: "admin.brands.read",
  ADMIN_BRANDS_WRITE: "admin.brands.write",
  ADMIN_PRODUCTS_READ: "admin.products.read",
  ADMIN_PRODUCTS_WRITE: "admin.products.write",

  // Sales & Operations
  ADMIN_ORDERS_READ: "admin.orders.read",
  ADMIN_ORDERS_WRITE: "admin.orders.write",
  ADMIN_INVENTORY_READ: "admin.inventory.read",
  ADMIN_INVENTORY_WRITE: "admin.inventory.write",

  // Assets & Media
  ADMIN_MEDIA_READ: "admin.media.read",
  ADMIN_MEDIA_WRITE: "admin.media.write",

  // User & Access Control
  ADMIN_USERS_READ: "admin.users.read",
  ADMIN_USERS_WRITE: "admin.users.write",
  ADMIN_ROLES_READ: "admin.roles.read",
  ADMIN_ROLES_WRITE: "admin.roles.write",

  // Taxonomy & Groups
  ADMIN_TAGS_READ: "admin.tags.read",
  ADMIN_TAGS_WRITE: "admin.tags.write",
  ADMIN_COLLECTIONS_READ: "admin.collections.read",
  ADMIN_COLLECTIONS_WRITE: "admin.collections.write",

  // Feature Specific
  ADMIN_SCHOOL_LISTS_READ: "admin.schoollists.read",
  ADMIN_SCHOOL_LISTS_WRITE: "admin.schoollists.write",
  ADMIN_DISCOUNT_RULES_READ: "admin.discountrules.read",
  ADMIN_DISCOUNT_RULES_WRITE: "admin.discountrules.write",
} as const;

/**
 * Set of Role IDs that are considered administrative.
 * Used primarily for portal-level access gating.
 */
const ADMIN_ROLE_IDS = new Set([
  "system_admin",
  "admin",
  "super_admin",
  "inventory_manager",
  "editorial",
  "operations_manager",
  "customer_support",
  "business_analyst",
  "school_liaison",
]);

/**
 * Determiner for System Administrators.
 *
 * System Admins bypass almost all granular permission checks. Use this
 * with caution.
 *
 * @param session - The active user session payload.
 * @returns True if the user has the 'system_admin' role active.
 */
export function isSystemAdmin(session: SessionPayload): boolean {
  return session.activeRoleIds?.includes("system_admin") === true;
}

/**
 * Validates if a session belongs to an administrator.
 *
 * This is a "Wide Gate" check. It returns true if the user satisfies
 * ANY of the following:
 * 1. Has the generic 'admin' role.
 * 2. Has an active administrative role (from ADMIN_ROLE_IDS).
 * 3. Has the 'admin.portal' permission code.
 *
 * Use this for high-level routing guards.
 *
 * @param session - The active user session payload.
 */
export function isAdminSession(session: SessionPayload): boolean {
  if (session.role === "admin") return true;

  if (session.activeRoleIds?.some((roleId) => ADMIN_ROLE_IDS.has(roleId))) {
    return true;
  }

  if (session.permissionCodes?.includes(PERMISSION_CODES.ADMIN_PORTAL)) {
    return true;
  }

  return false;
}

/**
 * The Core Permission Guard.
 *
 * Evaluates whether a user can perform a specific action.
 * Logic Flow:
 * 1. If user is a System Admin -> GRANT (Bypass).
 * 2. If session has no codes -> DENY.
 * 3. Check if required code exists in session's effective codes.
 *
 * @param session - The active user session payload.
 * @param requiredPermission - The specific code to search for (from PERMISSION_CODES).
 */
export function hasPermission(
  session: SessionPayload,
  requiredPermission: PermissionCode,
): boolean {
  if (isSystemAdmin(session)) return true;

  if (!session.permissionCodes || session.permissionCodes.length === 0) {
    return false;
  }

  return session.permissionCodes.includes(requiredPermission);
}

/**
 * "at Least One" Permission Guard.
 *
 * @param session - The active user session payload.
 * @param requiredPermissions - Array of permission codes.
 * @returns True if the user has AT LEAST ONE of the provided permissions.
 */
export function hasAnyPermission(
  session: SessionPayload,
  requiredPermissions: PermissionCode[],
): boolean {
  return requiredPermissions.some((permission) => hasPermission(session, permission));
}

/**
 * "All Required" Permission Guard.
 *
 * @param session - The active user session payload.
 * @param requiredPermissions - Array of permission codes.
 * @returns True only if the user has EVERY permission provided in the array.
 */
export function hasAllPermissions(
  session: SessionPayload,
  requiredPermissions: PermissionCode[],
): boolean {
  return requiredPermissions.every((permission) => hasPermission(session, permission));
}
