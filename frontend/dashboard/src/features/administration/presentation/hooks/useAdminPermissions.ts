/**
 * Admin Permissions Hook
 *
 * Wraps the core usePermissions hook with admin-specific helpers.
 * This hook is the primary way admin components check permissions.
 *
 * Location: presentation/hooks/ (pure .ts file - no JSX)
 *
 * @example
 * const { can, portalRole, isStaff } = useAdminPermissions();
 * if (can('admin.products.write')) { ... }
 */

"use client";

import { usePermissions } from "@providers/PermissionsProvider";
import { useSession } from "@providers/SessionProvider";
import { useMemo } from "react";
import { isStaffRole, type PortalRole, type PermissionCode } from "@findeg/backend/features/core";

/**
 * Admin-specific permission helper interface
 */
export interface AdminPermissions {
  /**
   * Check if the current user has a specific permission
   * @param permission - Permission code to check (e.g., 'admin.products.write')
   */
  can: (permission: string | PermissionCode) => boolean;

  /**
   * Current user's portal role
   */
  portalRole: PortalRole;

  /**
   * True if user is a staff member (portalRole === 'staff')
   */
  isStaff: boolean;

  /**
   * True if user is a system admin (bypasses all permission checks)
   */
  isSystemAdmin: boolean;

  /**
   * All permission codes granted to the user
   */
  permissionCodes: string[];
}

/**
 * Hook for admin portal permission checks
 *
 * Wraps usePermissions with admin-specific helpers and session data.
 * Use this hook in all admin UI components for permission gating.
 *
 * @throws Error if used outside PermissionsProvider or SessionProvider
 * @returns {AdminPermissions} Permission helpers and user role info
 */
export function useAdminPermissions(): AdminPermissions {
  const { hasPermission, isSystemAdmin, permissionCodes } = usePermissions();
  const session = useSession();

  const value = useMemo<AdminPermissions>(
    () => ({
      can: (permission: string | PermissionCode) => hasPermission(permission),
      portalRole: session.portalRole,
      isStaff: isStaffRole(session.portalRole),
      isSystemAdmin,
      permissionCodes,
    }),
    [hasPermission, session.portalRole, isSystemAdmin, permissionCodes],
  );

  return value;
}
