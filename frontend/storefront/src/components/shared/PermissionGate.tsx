"use client";

import React from "react";
import { usePermissions } from "@providers/PermissionsProvider";
import { PermissionCode } from "@findeg/backend/features/core";

interface PermissionGateProps {
  children: React.ReactNode;
  /**
   * Single permission code required to show children.
   */
  permission?: PermissionCode | string;
  /**
   * Array of permissions where ANY one is sufficient.
   */
  any?: Array<PermissionCode | string>;
  /**
   * Array of permissions where ALL are required.
   */
  all?: Array<PermissionCode | string>;
  /**
   * Optional fallback to show if permission check fails.
   */
  fallback?: React.ReactNode;
  /**
   * If true, even system admins will be checked strictly (not common).
   */
  strict?: boolean;
}

/**
 * PermissionGate
 *
 * A declarative component to show/hide UI elements based on user permissions.
 */
export function PermissionGate({
  children,
  permission,
  any,
  all,
  fallback = null,
  strict = false,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, systemAdmin } = usePermissions();

  // System admins bypass checks unless strict mode is on.
  if (systemAdmin && !strict) {
    return <>{children}</>;
  }

  let allowed = true;

  if (permission) {
    allowed = hasPermission(permission);
  } else if (any) {
    allowed = hasAnyPermission(any);
  } else if (all) {
    allowed = hasAllPermissions(all);
  }

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
