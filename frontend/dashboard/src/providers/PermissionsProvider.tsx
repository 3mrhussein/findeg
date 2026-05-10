/**
 * Permissions Infrastructure
 *
 * This module provides the client-side bridge for the application's
 * permission system. It consumes the session data (usually from a Server Component)
 * and exposes it via a React Context to the rest of the component tree.
 */

'use client';

import React, { createContext, useContext, useMemo } from 'react';
import {
  hasPermission,
  systemAdmin as checkSystemAdmin,
  hasAnyPermission,
  hasAllPermissions,
  SessionPayload,
} from '@findeg/backend/features/core';
import type { PermissionCode } from '@findeg/db';

/**
 * The set of helpers available to any component nested within a PermissionsProvider.
 */
interface PermissionsContextValue {
  /**
   * Check if the user has a specific permission.
   * @example if (hasPermission(PERMISSION_CODES.ADMIN_PRODUCTS_WRITE)) { ... }
   */
  hasPermission: (code: PermissionCode | string) => boolean;

  /**
   * Check if the user has AT LEAST ONE of the given permissions.
   */
  hasAnyPermission: (codes: Array<PermissionCode | string>) => boolean;

  /**
   * Check if the user has ALL of the given permissions.
   */
  hasAllPermissions: (codes: Array<PermissionCode | string>) => boolean;

  /**
   * Flag indicating if the user is a 'system_admin'.
   * If true, all permission checks will implicitly return true.
   */
  systemAdmin: boolean;

  /**
   * The list of effective permission codes derived from the user's roles and overrides.
   */
  permissionCodes: string[];
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

/**
 * Standard Provider for the Permissions Context.
 *
 * This component SHOULD be placed high up in the component tree of protected
 * routes (like the Admin Portal). It acts as a bridge, taking the session
 * data from the server and providing it to client-side permission guards.
 *
 * @param session - The SessionPayload retrieved from the server.
 * @param children - The component tree that needs access to permission guards.
 */
export function PermissionsProvider({
  session,
  children,
}: {
  session: SessionPayload | null;
  children: React.ReactNode;
}) {
  const value = useMemo<PermissionsContextValue>(
    () => ({
      /**
       * Check if a specific permission code is present in the session.
       */
      hasPermission: (code) => session ? hasPermission(session, code as PermissionCode) : false,

      /**
       * Check if the session contains any of the provided codes.
       */
      hasAnyPermission: (codes) => session ? hasAnyPermission(session, codes as PermissionCode[]) : false,

      /**
       * Check if the session contains all of the provided codes.
       */
      hasAllPermissions: (codes) => session ? hasAllPermissions(session, codes as PermissionCode[]) : false,

      /**
       * Boolean flag for system administrators.
       */
      systemAdmin: session ? checkSystemAdmin(session) : false,

      /**
       * The raw array of effective permission codes.
       */
      permissionCodes: session?.permissionCodes ?? [],
    }),
    [session],
  );

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

/**
 * Access the Permission System from any Client Component.
 *
 * This hook is the primary way to implement UI-level access control (hiding buttons,
 * showing extra tabs, etc.).
 *
 * @throws Error if called outside of a PermissionsProvider.
 * @returns {PermissionsContextValue} The permission helpers (hasPermission, hasAnyPermission, etc.).
 *
 * @example
 * const { hasPermission } = usePermissions();
 * return hasPermission('admin.products.write') ? <EditButton /> : null;
 */
export function usePermissions(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error('usePermissions() must be used inside <PermissionsProvider>');
  }
  return ctx;
}
