/**
 * useAdminUsers
 *
 * Custom hook for managing admin users with optimistic updates,
 * loading states, and error handling.
 *
 * Provides: list, create, update, deactivate, reactivate, setPermissionOverrides
 */

'use client';

import { useState, useCallback } from 'react';
import {
  createAdminAction,
  updateAdminAction,
  setPermissionOverridesAction,
} from '@data/access/actions';
import { getAdminUsers } from '@data/access/queries';

import type {
  AdminUser,
  CreateAdminInput,
  UpdateAdminInput,
  PermissionOverrideInput,
} from '@findeg/backend/features/identity';

export interface AdminUserRole {
  id: number;
  code: string;
  name: string;
}

export interface PermissionOverride {
  permissionCode: string;
  action: 'grant' | 'revoke';
}

interface UseAdminUsersReturn {
  admins: AdminUser[];
  loading: boolean;
  error: string | null;
  pendingIds: Set<number>;
  fetchAdmins: () => Promise<void>;
  createAdmin: (input: CreateAdminInput) => Promise<void>;
  updateAdmin: (userId: number, input: UpdateAdminInput) => Promise<void>;
  deactivateAdmin: (userId: number) => Promise<void>;
  reactivateAdmin: (userId: number) => Promise<void>;
  setPermissionOverrides: (userId: number, overrides: PermissionOverrideInput[]) => Promise<void>;
}

/**
 * Hook for admin user CRUD with optimistic updates.
 *
 * Optimistic strategy:
 * - deactivate/reactivate: immediately flip isActive in local state, revert on error
 * - create/update: pessimistic (show spinner, then refresh)
 */
export function useAdminUsers(): UseAdminUsersReturn {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // IDs that are currently being mutated (shows per-row spinner)
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminUsers();
      setAdmins(result as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   *
   */
  const markPending = (id: number) => setPendingIds((prev) => new Set([...prev, id]));

  /**
   *
   */
  const clearPending = (id: number) =>
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  const createAdmin = useCallback(
    async (input: CreateAdminInput) => {
      const result = await createAdminAction(input);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create admin');
      }
      await fetchAdmins();
    },
    [fetchAdmins],
  );

  const updateAdmin = useCallback(
    async (userId: number, input: UpdateAdminInput) => {
      markPending(userId);
      try {
        const result = await updateAdminAction(userId, input);
        if (!result.success) {
          throw new Error(result.error || 'Failed to update admin');
        }
        await fetchAdmins();
      } finally {
        clearPending(userId);
      }
    },
    [fetchAdmins],
  );

  /** Optimistic deactivate — flips isActive immediately, reverts on error */
  const deactivateAdmin = useCallback(async (userId: number) => {
    // Optimistic update
    setAdmins((prev) => prev.map((a) => (a.id === userId ? { ...a, isActive: false } : a)));
    markPending(userId);
    try {
      const result = await updateAdminAction(userId, { isActive: false });
      if (!result.success) {
        throw new Error(result.error || 'Failed to deactivate admin');
      }
    } catch (err) {
      // Revert optimistic update
      setAdmins((prev) => prev.map((a) => (a.id === userId ? { ...a, isActive: true } : a)));
      throw err;
    } finally {
      clearPending(userId);
    }
  }, []);

  /** Optimistic reactivate */
  const reactivateAdmin = useCallback(async (userId: number) => {
    setAdmins((prev) => prev.map((a) => (a.id === userId ? { ...a, isActive: true } : a)));
    markPending(userId);
    try {
      const result = await updateAdminAction(userId, { isActive: true });
      if (!result.success) {
        throw new Error(result.error || 'Failed to reactivate admin');
      }
    } catch (err) {
      setAdmins((prev) => prev.map((a) => (a.id === userId ? { ...a, isActive: false } : a)));
      throw err;
    } finally {
      clearPending(userId);
    }
  }, []);

  const setPermissionOverrides = useCallback(
    async (userId: number, overrides: PermissionOverrideInput[]) => {
      const permIds = overrides.filter((o) => o.action === 'grant').map((o) => o.permissionId);
      const result = await setPermissionOverridesAction(userId, permIds);
      if (!result.success) {
        throw new Error(result.error || 'Failed to save overrides');
      }
    },
    [],
  );

  return {
    admins,
    loading,
    error,
    pendingIds,
    fetchAdmins,
    createAdmin,
    updateAdmin,
    deactivateAdmin,
    reactivateAdmin,
    setPermissionOverrides,
  };
}
