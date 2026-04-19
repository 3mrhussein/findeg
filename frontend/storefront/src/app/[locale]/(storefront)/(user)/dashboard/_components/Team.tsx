/**
 * Team View — Admin User Management (Refactored)
 *
 * Thin orchestrator: composes atomic sub-components.
 * All data logic lives in useAdminUsers hook.
 * All UI pieces are in ./team/ sub-folder.
 *
 * Features:
 * - Optimistic deactivate/reactivate
 * - Per-row pending state (spinner)
 * - Deactivate confirmation dialog
 * - Search filter (client-side)
 * - Skeleton loading
 * - Toast notifications (via browser custom event)
 * - Full accessibility (aria-label, aria-busy, focus management)
 */

"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@ui";
import { Input } from "@ui";
import { Badge } from "@ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui";
import { Icon } from "@ui";
import { PERMISSION_CODES } from "@backend/features/core";
import { usePermissions } from "@providers/PermissionsProvider";
// @ts-ignore
import { useAdminUsers, type AdminUser } from "@hooks/useAdminUsers";
import { AdminStatsBar } from "./team/AdminStatsBar";
import { AdminActionsMenu } from "./team/AdminActionsMenu";
import { AdminUserRow, AdminUserRowSkeleton } from "./team/AdminUserRow";
import { DeactivateConfirmDialog } from "./team/DeactivateConfirmDialog";
import { AdminUserDialog } from "./AdminUserDialog";

/**
 * Uses the browser's custom event pattern to fire toasts
 * without a global state library.
 */
function fireToast(message: string, type: "success" | "error" = "success") {
  window.dispatchEvent(new CustomEvent("dashboard-toast", { detail: { message, type } }));
}

/**
 *
 */
export function TeamView() {
  const t = useTranslations("Pages.Dashboard");
  const { hasPermission } = usePermissions();
  const canWrite = hasPermission(PERMISSION_CODES.ADMIN_USERS_WRITE);

  const { admins, loading, error, pendingIds, fetchAdmins, deactivateAdmin, reactivateAdmin } =
    useAdminUsers();

  const [search, setSearch] = useState("");
  const [isPendingSearch, startTransition] = useTransition();

  /**
   *
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    startTransition(() => {
      setSearch(e.target.value);
    });
  };

  const [deactivateTarget, setDeactivateTarget] = useState<AdminUser | null>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  // "permissions" tab opens directly when coming from "Manage Permissions" menu item
  const [dialogDefaultTab, setDialogDefaultTab] = useState<"profile" | "roles" | "overrides">(
    "profile",
  );

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Client-side search filter
  const filteredAdmins = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter(
      (a: any) =>
        a.email.toLowerCase().includes(q) ||
        [a.firstName, a.lastName].filter(Boolean).join(" ").toLowerCase().includes(q) ||
        a.roles.some((r: any) => r.name.toLowerCase().includes(q)),
    );
  }, [admins, search]);

  /**
   *
   */
  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;
    setDeactivateLoading(true);
    try {
      await deactivateAdmin(deactivateTarget.id);
      fireToast(t("Deactivated", { name: deactivateTarget.firstName ?? deactivateTarget.email }));
      setDeactivateTarget(null);
    } catch {
      fireToast(t("DeactivateFailed"), "error");
    } finally {
      setDeactivateLoading(false);
    }
  };

  /**
   *
   */
  const handleReactivate = async (user: AdminUser) => {
    try {
      await reactivateAdmin(user.id);
      fireToast(t("Reactivated", { name: user.firstName ?? user.email }));
    } catch {
      fireToast(t("ReactivateFailed"), "error");
    }
  };

  /**
   *
   */
  const handleDialogClose = (refreshed?: boolean) => {
    setDialogOpen(false);
    setEditingUser(null);
    if (refreshed) fetchAdmins();
  };

  /**
   *
   */
  const openEdit = (user: AdminUser, tab: "profile" | "roles" | "overrides" = "profile") => {
    setEditingUser(user);
    setDialogDefaultTab(tab);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("Team")}</h2>
          <p className="text-muted-foreground text-sm mt-0.5">{t("TeamDescription")}</p>
        </div>
        {canWrite && (
          <Button
            onClick={() => {
              setEditingUser(null);
              setDialogDefaultTab("profile");
              setDialogOpen(true);
            }}
          >
            <Icon name="person_add" className="text-base ltr:mr-2 rtl:ml-2" />
            {t("NewAdmin")}
          </Button>
        )}
      </div>

      {/* Stats */}
      <AdminStatsBar admins={admins} loading={loading} />

      {/* Search */}
      <div className="relative w-full md:max-w-sm">
        <Icon
          name="search"
          className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base pointer-events-none"
        />
        <Input
          type="search"
          placeholder={t("SearchAdmins")}
          value={search}
          onChange={handleSearchChange}
          className="ltr:pl-9 rtl:pr-9"
          aria-label={t("SearchAdmins")}
        />
        {isPendingSearch && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Icon name="progress_activity" className="animate-spin text-muted-foreground text-sm" />
          </div>
        )}
      </div>

      {/* Error state */}
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
            onClick={fetchAdmins}
            className="ltr:ml-auto rtl:mr-auto"
          >
            {t("TryAgain")}
          </Button>
        </div>
      )}

      {/* Mobile card layout (< md) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-28 rounded bg-muted" />
                  <div className="h-3 w-40 rounded bg-muted" />
                </div>
              </div>
            </div>
          ))
        ) : filteredAdmins.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <Icon name={search ? "search_off" : "group"} style={{ fontSize: 40 }} />
            <p className="text-sm">{search ? t("NoSearchResults") : t("TeamEmpty")}</p>
          </div>
        ) : (
          filteredAdmins.map((admin: any, i: number) => (
            <div
              key={admin.id}
              className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                    [
                      "bg-amber-500",
                      "bg-purple-500",
                      "bg-blue-500",
                      "bg-green-500",
                      "bg-rose-500",
                      "bg-teal-500",
                    ][i % 6]
                  }`}
                >
                  {admin.firstName && admin.lastName
                    ? `${admin.firstName[0]}${admin.lastName[0]}`.toUpperCase()
                    : admin.email.slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {[admin.firstName, admin.lastName].filter(Boolean).join(" ") || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {admin.roles.map((role: any) => (
                      <Badge key={role.id} variant="outline" className="text-xs">
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    {pendingIds.has(admin.id) ? (
                      <>
                        <Icon
                          name="progress_activity"
                          className="text-primary animate-spin"
                          style={{ fontSize: 12 }}
                        />
                        <span className="text-xs text-muted-foreground">{t("Updating")}</span>
                      </>
                    ) : (
                      <>
                        <div
                          className={`h-2 w-2 rounded-full ${admin.isActive ? "bg-green-500" : "bg-red-400"}`}
                        />
                        <span className="text-xs">
                          {admin.isActive ? t("Active") : t("Inactive")}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {canWrite && (
                  <AdminActionsMenu
                    userId={admin.id}
                    userName={
                      [admin.firstName, admin.lastName].filter(Boolean).join(" ") || admin.email
                    }
                    isActive={admin.isActive}
                    isPending={pendingIds.has(admin.id)}
                    canWrite={canWrite}
                    onEdit={() => openEdit(admin, "profile")}
                    onManagePermissions={() => openEdit(admin, "overrides")}
                    onDeactivate={() => setDeactivateTarget(admin)}
                    onReactivate={() => handleReactivate(admin)}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table (md+) */}
      <div className="hidden md:block rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table aria-label={t("Team")}>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-12" aria-hidden="true" />
              <TableHead>{t("TeamTable.Name")}</TableHead>
              <TableHead>{t("TeamTable.Email")}</TableHead>
              <TableHead>{t("TeamTable.Roles")}</TableHead>
              <TableHead>{t("TeamTable.Status")}</TableHead>
              {canWrite && <TableHead className="w-12" aria-hidden="true" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <AdminUserRowSkeleton key={i} />)
            ) : filteredAdmins.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canWrite ? 6 : 5}
                  className="text-center h-32 text-muted-foreground"
                >
                  {search ? (
                    <div className="flex flex-col items-center gap-2">
                      <Icon name="search_off" style={{ fontSize: 32 }} />
                      <p>{t("NoSearchResults")}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Icon name="group" style={{ fontSize: 32 }} />
                      <p>{t("TeamEmpty")}</p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmins.map((admin: any, i: number) => (
                <AdminUserRow
                  key={admin.id}
                  user={admin}
                  index={i}
                  isPending={pendingIds.has(admin.id)}
                  canWrite={canWrite}
                  onEdit={(u) => openEdit(u, "profile")}
                  onManagePermissions={(u) => openEdit(u, "overrides")}
                  onDeactivate={(u) => setDeactivateTarget(u)}
                  onReactivate={handleReactivate}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <DeactivateConfirmDialog
        open={deactivateTarget !== null}
        userName={
          deactivateTarget
            ? [deactivateTarget.firstName, deactivateTarget.lastName].filter(Boolean).join(" ") ||
              deactivateTarget.email
            : ""
        }
        loading={deactivateLoading}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => setDeactivateTarget(null)}
      />

      <AdminUserDialog
        open={dialogOpen}
        user={editingUser as any}
        defaultTab={dialogDefaultTab}
        onClose={handleDialogClose}
      />
    </div>
  );
}
