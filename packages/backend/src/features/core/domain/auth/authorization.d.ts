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
export declare const PERMISSION_CODES: {
    readonly ADMIN_PORTAL: "admin.portal";
    readonly ADMIN_DASHBOARD_READ: "admin.dashboard.read";
    readonly ADMIN_AUDIT_LOG_READ: "admin.auditlog.read";
    readonly ADMIN_CATEGORIES_READ: "admin.categories.read";
    readonly ADMIN_CATEGORIES_WRITE: "admin.categories.write";
    readonly ADMIN_BRANDS_READ: "admin.brands.read";
    readonly ADMIN_BRANDS_WRITE: "admin.brands.write";
    readonly ADMIN_PRODUCTS_READ: "admin.products.read";
    readonly ADMIN_PRODUCTS_WRITE: "admin.products.write";
    readonly ADMIN_ORDERS_READ: "admin.orders.read";
    readonly ADMIN_ORDERS_WRITE: "admin.orders.write";
    readonly ADMIN_INVENTORY_READ: "admin.inventory.read";
    readonly ADMIN_INVENTORY_WRITE: "admin.inventory.write";
    readonly ADMIN_MEDIA_READ: "admin.media.read";
    readonly ADMIN_MEDIA_WRITE: "admin.media.write";
    readonly ADMIN_USERS_READ: "admin.users.read";
    readonly ADMIN_USERS_WRITE: "admin.users.write";
    readonly ADMIN_ROLES_READ: "admin.roles.read";
    readonly ADMIN_ROLES_WRITE: "admin.roles.write";
    readonly ADMIN_TAGS_READ: "admin.tags.read";
    readonly ADMIN_TAGS_WRITE: "admin.tags.write";
    readonly ADMIN_COLLECTIONS_READ: "admin.collections.read";
    readonly ADMIN_COLLECTIONS_WRITE: "admin.collections.write";
    readonly ADMIN_SCHOOL_LISTS_READ: "admin.schoollists.read";
    readonly ADMIN_SCHOOL_LISTS_WRITE: "admin.schoollists.write";
    readonly ADMIN_DISCOUNT_RULES_READ: "admin.discountrules.read";
    readonly ADMIN_DISCOUNT_RULES_WRITE: "admin.discountrules.write";
};
/**
 * Determiner for System Administrators.
 *
 * System Admins bypass almost all granular permission checks. Use this
 * with caution.
 *
 * @param session - The active user session payload.
 * @returns True if the user has the 'system_admin' role active.
 */
export declare function isSystemAdmin(session: SessionPayload): boolean;
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
export declare function isAdminSession(session: SessionPayload): boolean;
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
export declare function hasPermission(session: SessionPayload, requiredPermission: PermissionCode): boolean;
/**
 * "at Least One" Permission Guard.
 *
 * @param session - The active user session payload.
 * @param requiredPermissions - Array of permission codes.
 * @returns True if the user has AT LEAST ONE of the provided permissions.
 */
export declare function hasAnyPermission(session: SessionPayload, requiredPermissions: PermissionCode[]): boolean;
/**
 * "All Required" Permission Guard.
 *
 * @param session - The active user session payload.
 * @param requiredPermissions - Array of permission codes.
 * @returns True only if the user has EVERY permission provided in the array.
 */
export declare function hasAllPermissions(session: SessionPayload, requiredPermissions: PermissionCode[]): boolean;
