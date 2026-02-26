import type { SessionPayload } from "./SessionPayload";
import type { PermissionCode } from "../value-objects";

export const PERMISSION_CODES = {
  ADMIN_PORTAL: "admin.portal",
  ADMIN_DASHBOARD_READ: "admin.dashboard.read",
  ADMIN_AUDIT_LOG_READ: "admin.auditlog.read",
  ADMIN_CATEGORIES_READ: "admin.categories.read",
  ADMIN_CATEGORIES_WRITE: "admin.categories.write",
  ADMIN_BRANDS_READ: "admin.brands.read",
  ADMIN_BRANDS_WRITE: "admin.brands.write",
  ADMIN_PRODUCTS_READ: "admin.products.read",
  ADMIN_PRODUCTS_WRITE: "admin.products.write",
  ADMIN_ORDERS_READ: "admin.orders.read",
  ADMIN_ORDERS_WRITE: "admin.orders.write",
  ADMIN_INVENTORY_READ: "admin.inventory.read",
  ADMIN_INVENTORY_WRITE: "admin.inventory.write",
  ADMIN_MEDIA_READ: "admin.media.read",
  ADMIN_MEDIA_WRITE: "admin.media.write",
} as const;

const ADMIN_ROLE_IDS = new Set(["admin", "super_admin"]);

/**
 * Legacy-compatible admin check that supports additive permission/role-id model.
 */
export function isAdminSession(session: SessionPayload): boolean {
  if (session.role === "admin") return true;

  if (session.activeRoleIds && session.activeRoleIds.some((roleId) => ADMIN_ROLE_IDS.has(roleId))) {
    return true;
  }

  if (session.permissionCodes?.includes(PERMISSION_CODES.ADMIN_PORTAL)) {
    return true;
  }

  return false;
}

/**
 * Permission guard helper that preserves legacy admin access compatibility.
 */
export function hasPermission(
  session: SessionPayload,
  requiredPermission: PermissionCode,
): boolean {
  if (isAdminSession(session)) return true;

  if (!session.permissionCodes || session.permissionCodes.length === 0) {
    return false;
  }

  return (
    session.permissionCodes.includes(requiredPermission) ||
    session.permissionCodes.includes(PERMISSION_CODES.ADMIN_PORTAL)
  );
}

/**
 * Returns true if actor has at least one permission from the list.
 */
export function hasAnyPermission(
  session: SessionPayload,
  requiredPermissions: PermissionCode[],
): boolean {
  return requiredPermissions.some((permission) => hasPermission(session, permission));
}

/**
 * Returns true if actor has all permissions from the list.
 */
export function hasAllPermissions(
  session: SessionPayload,
  requiredPermissions: PermissionCode[],
): boolean {
  return requiredPermissions.every((permission) => hasPermission(session, permission));
}
