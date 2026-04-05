/**
 * useAdminRoles
 *
 * Custom hook for managing roles and permissions with optimistic updates.
 *
 * Provides: list roles, list permissions, create role, update role permissions,
 * delete role — all with loading state.
 */

"use client";

import { useState, useCallback } from "react";

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
    const res = await fetch("/api/v1/admin/roles");
    if (!res.ok) throw new Error("Failed to fetch roles");
    const json = await res.json();
    setRoles(json.data?.roles ?? []);
  }, []);

  const fetchPermissions = useCallback(async () => {
    const res = await fetch("/api/v1/admin/permissions");
    if (!res.ok) throw new Error("Failed to fetch permissions");
    const json = await res.json();
    setPermissions(json.data?.permissions ?? []);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchRoles(), fetchPermissions()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [fetchRoles, fetchPermissions]);

  const createRole = useCallback(
    async (code: string, name: string, permissionIds: number[]) => {
      const res = await fetch("/api/v1/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name, permissionIds }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message ?? "Failed to create role");
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

        const res = await fetch(`/api/v1/admin/roles/${roleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissionIds }),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error?.message ?? "Failed to update role");
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
        const res = await fetch(`/api/v1/admin/roles/${roleId}`, { method: "DELETE" });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error?.message ?? "Failed to delete role");
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
