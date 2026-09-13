/**
 * useAdminRoles
 *
 * Custom hook for managing roles and permissions with optimistic updates.
 *
 * Provides: list roles, list permissions, create role, update role permissions,
 * delete role — all with loading state.
 */

'use client';

import { useState, useCallback } from 'react';
import {
  createRoleAction,
  updateRolePermissionsAction,
  deleteRoleAction,
} from '@data/access/actions';
import { getSystemRoles, getPermissionCodes } from '@data/access/queries';

export interface Permission {
  id: number;
  code: string;
  name: string;
}

export interface RoleWithPermissions {
  id: number;
  code: string;
  name: string;
  permissions: Permission[];
  userCount: number;
}

interface UseAdminRolesReturn {
  roles: RoleWithPermissions[];
  permissions: Permission[];
  loading: boolean;
  error: string | null;
  pendingRoleIds: Set<number>;
  fetchRoles: () => Promise<void>;
  fetchPermissions: () => Promise<void>;
  fetchAll: () => Promise<void>;
  createRole: (code: string, name: string, permissionIds: number[]) => Promise<void>;
  updateRolePermissions: (roleId: number, permissionIds: number[]) => Promise<void>;
  deleteRole: (roleId: number) => Promise<void>;
}

/**
 * Hook for role and permission management with per-role pending tracking.
 */
export function useAdminRoles(): UseAdminRolesReturn {
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingRoleIds, setPendingRoleIds] = useState<Set<number>>(new Set());

  /**
   *
   */
  const markPending = (id: number) => setPendingRoleIds((prev) => new Set([...prev, id]));
  /**
   *
   */
  const clearPending = (id: number) =>
    setPendingRoleIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  const fetchRoles = useCallback(async () => {
    const roles = await getSystemRoles();
    setRoles(roles as any);
  }, []);

  const fetchPermissions = useCallback(async () => {
    const permissions = await getPermissionCodes();
    setPermissions(permissions as any);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchRoles(), fetchPermissions()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }, [fetchRoles, fetchPermissions]);

  const createRole = useCallback(
    async (code: string, name: string, permissionIds: number[]) => {
      const result = await createRoleAction(code, name, permissionIds);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create role');
      }
      await fetchRoles();
    },
    [fetchRoles],
  );

  const updateRolePermissions = useCallback(
    async (roleId: number, permissionIds: number[]) => {
      markPending(roleId);
      try {
        // Optimistic update
        setRoles((prev) =>
          prev.map((r) =>
            r.id === roleId
              ? {
                  ...r,
                  permissions: permissions.filter((p) => permissionIds.includes(p.id)),
                }
              : r,
          ),
        );

        const result = await updateRolePermissionsAction(roleId, permissionIds);
        if (!result.success) {
          throw new Error(result.error || 'Failed to update role');
        }
        // Refresh to get accurate server state
        await fetchRoles();
      } catch (err) {
        // Revert by re-fetching
        await fetchRoles();
        throw err;
      } finally {
        clearPending(roleId);
      }
    },
    [fetchRoles, permissions],
  );

  /** Optimistic delete — removes card immediately, restores on error */
  const deleteRole = useCallback(
    async (roleId: number) => {
      const snapshot = [...roles];
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      markPending(roleId);
      try {
        const result = await deleteRoleAction(roleId);
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete role');
        }
      } catch (err) {
        setRoles(snapshot);
        throw err;
      } finally {
        clearPending(roleId);
      }
    },
    [roles],
  );

  return {
    roles,
    permissions,
    loading,
    error,
    pendingRoleIds,
    fetchRoles,
    fetchPermissions,
    fetchAll,
    createRole,
    updateRolePermissions,
    deleteRole,
  };
}
