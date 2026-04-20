/**
 * AdminUserRow
 *
 * A single data row in the Team Management table.
 * Renders: avatar, name, email, role badges, status dot, actions menu.
 *
 * Shows an inline spinner + "Updating..." when pending (optimistic update in progress).
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "@findeg/ui";
import { Badge } from "@findeg/ui";
import { TableCell, TableRow } from "@findeg/ui";
import { Skeleton } from "@findeg/ui";
import { Icon } from "@findeg/ui";
import { type AdminUser } from "@hooks/useAdminUsers";
import { AdminActionsMenu } from "./AdminActionsMenu";

/** Pastel badge colors mapped to role codes */
const ROLE_COLORS: Record<string, string> = {
  system_admin:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  inventory_manager:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
  editorial_manager:
    "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
  editorial:
    "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
  operations_manager:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300",
  customer_support:
    "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300",
  business_analyst:
    "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300",
  school_liaison:
    "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300",
  catalog_admin: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300",
};

/** Avatar background colors cycling across users */
const AVATAR_COLORS = [
  "bg-amber-500",
  "bg-purple-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-rose-500",
  "bg-teal-500",
];

/**
 *
 */
function getInitials(user: AdminUser): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  if (user.firstName) return user.firstName.slice(0, 2).toUpperCase();
  return user.email.slice(0, 2).toUpperCase();
}

/**
 *
 */
function getFullName(user: AdminUser): string {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || "—";
}

interface AdminUserRowProps {
  user: AdminUser;
  index: number;
  isPending: boolean;
  canWrite: boolean;
  onEdit: (user: AdminUser) => void;
  onManagePermissions: (user: AdminUser) => void;
  onDeactivate: (user: AdminUser) => void;
  onReactivate: (user: AdminUser) => void;
}

/**
 * Renders one row in the Team Management table.
 * When isPending, shows an inline "Updating..." state instead of the status badge.
 */
export function AdminUserRow({
  user,
  index,
  isPending,
  canWrite,
  onEdit,
  onManagePermissions,
  onDeactivate,
  onReactivate,
}: AdminUserRowProps) {
  const t = useTranslations("Pages.Dashboard");
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <TableRow
      className={`transition-colors hover:bg-muted/40 ${isPending ? "opacity-70" : ""}`}
      aria-busy={isPending}
    >
      {/* Avatar */}
      <TableCell>
        <Avatar className="h-9 w-9">
          <AvatarFallback className={`text-xs font-bold text-white ${avatarColor}`}>
            {getInitials(user)}
          </AvatarFallback>
        </Avatar>
      </TableCell>

      {/* Name */}
      <TableCell className="font-medium whitespace-nowrap">{getFullName(user)}</TableCell>

      {/* Email */}
      <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>

      {/* Roles */}
      <TableCell>
        <div className="flex flex-wrap gap-1.5">
          {user.roles.length === 0 ? (
            <span className="text-xs text-muted-foreground italic">{t("NoRoles")}</span>
          ) : (
            user.roles.map((role: any) => (
              <Badge
                key={role.id}
                variant="outline"
                className={`text-xs ${ROLE_COLORS[role.code] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}
              >
                {role.name}
              </Badge>
            ))
          )}
        </div>
      </TableCell>

      {/* Status — shows spinner when a mutation is pending */}
      <TableCell>
        {isPending ? (
          <div className="flex items-center gap-2">
            <Icon
              name="progress_activity"
              className="text-primary animate-spin"
              style={{ fontSize: 14 }}
            />
            <span className="text-xs text-muted-foreground">{t("Updating")}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full shrink-0 ${user.isActive ? "bg-green-500" : "bg-red-400"}`}
              aria-hidden="true"
            />
            <span className="text-sm">{user.isActive ? t("Active") : t("Inactive")}</span>
          </div>
        )}
      </TableCell>

      {/* Actions */}
      {canWrite && (
        <TableCell>
          <AdminActionsMenu
            userId={user.id}
            userName={getFullName(user)}
            isActive={!!(user as any).isActive}
            isPending={isPending}
            canWrite={canWrite}
            onEdit={() => onEdit(user)}
            onManagePermissions={() => onManagePermissions(user)}
            onDeactivate={() => onDeactivate(user)}
            onReactivate={() => onReactivate(user)}
          />
        </TableCell>
      )}
    </TableRow>
  );
}

/** Skeleton row shown during initial data load */
export function AdminUserRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-9 w-9 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-44" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-24 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-8 rounded" />
      </TableCell>
    </TableRow>
  );
}
