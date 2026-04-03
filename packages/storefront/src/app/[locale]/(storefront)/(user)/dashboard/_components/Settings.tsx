/**
 * Settings View — Roles & Permissions (Refactored)
 *
 * Thin orchestrator composing:
 * - RoleCard (./settings/RoleCard)
 * - PermissionMatrixDialog (./settings/PermissionMatrixDialog)
 * - CreateRoleDialog (inline — kept small here)
 *
 * All data logic lives in useAdminRoles hook.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/shared/Icon";
import { PERMISSION_CODES } from "@/features/core/domain/auth";
import { usePermissions } from "@/providers/PermissionsProvider";
import { useAdminRoles } from "@/features/identity/application/hooks/useAdminRoles";
import type { RoleWithPermissions } from "@/features/identity/application/hooks/useAdminRoles";
import { RoleCard } from "./settings/RoleCard";
import { PermissionMatrixDialog } from "./settings/PermissionMatrixDialog";
import { CreateRoleDialog } from "./settings/CreateRoleDialog";

/**
 *
 */
function fireToast(message: string, type: "success" | "error" = "success") {
  window.dispatchEvent(new CustomEvent("dashboard-toast", { detail: { message, type } }));
}

/**
 *
 */
export function SettingsView() {
  const t = useTranslations("Pages.Dashboard");
  const { hasPermission } = usePermissions();
  const canWrite = hasPermission(PERMISSION_CODES.ADMIN_ROLES_WRITE);

  const {
    roles,
    permissions,
    loading,
    error,
    pendingRoleIds,
    fetchAll,
    createRole,
    updateRolePermissions,
    deleteRole,
  } = useAdminRoles();

  const [editRole, setEditRole] = useState<RoleWithPermissions | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /**
   *
   */
  const handleUpdatePermissions = async (roleId: number, permIds: number[]) => {
    try {
      await updateRolePermissions(roleId, permIds);
      fireToast(t("RoleUpdated"));
    } catch (err) {
      fireToast(err instanceof Error ? err.message : t("RoleUpdateFailed"), "error");
      throw err;
    }
  };

  /**
   *
   */
  const handleDelete = async (role: RoleWithPermissions) => {
    if (!confirm(t("DeleteRoleConfirm", { name: role.name }))) return;
    try {
      await deleteRole(role.id);
      fireToast(t("RoleDeleted", { name: role.name }));
    } catch (err) {
      fireToast(err instanceof Error ? err.message : t("RoleDeleteFailed"), "error");
    }
  };

  /**
   *
   */
  const handleCreate = async (code: string, name: string, permIds: number[]) => {
    try {
      await createRole(code, name, permIds);
      fireToast(t("RoleCreated", { name }));
      setCreateOpen(false);
    } catch (err) {
      fireToast(err instanceof Error ? err.message : t("RoleCreateFailed"), "error");
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("Settings")}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{t("SettingsDescription")}</p>
        </div>
        {canWrite && (
          <Button onClick={() => setCreateOpen(true)}>
            <Icon name="add" className="text-base ltr:mr-2 rtl:ml-2" />
            {t("NewRole")}
          </Button>
        )}
      </div>

      {/* Error */}
      {error && !loading && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <Icon name="error" className="shrink-0" />
          <span>{error}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchAll}
            className="ltr:ml-auto rtl:mr-auto"
          >
            {t("TryAgain")}
          </Button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-lg border bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              isPending={pendingRoleIds.has(role.id)}
              canWrite={canWrite}
              onEdit={(r) => setEditRole(r)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Permission Matrix Editor */}
      <PermissionMatrixDialog
        role={editRole}
        allPermissions={permissions}
        onSave={handleUpdatePermissions}
        onClose={() => setEditRole(null)}
      />

      <CreateRoleDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        permissions={permissions}
        onCreate={handleCreate}
      />
    </div>
  );
}
