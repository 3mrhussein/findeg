/**
 * RoleCard
 *
 * Displays a single admin role as a card with:
 * - Role name, code chip, permission count badge, user count badge
 * - Colored top accent border based on role category
 * - Protected badge for non-deletable roles (system_admin)
 * - Edit / Delete actions (hidden when protected or no write permission)
 * - Pending state (spinner overlay) during optimistic delete
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@findeg/ui";
import { Badge } from "@findeg/ui";
import { Button } from "@findeg/ui";
import { Icon } from "@findeg/ui";
import type { RoleWithPermissions } from "@/features/identity/application/hooks/useAdminRoles";

const PROTECTED_CODES = new Set(["system_admin", "user"]);

const ROLE_ACCENT: Record<string, string> = {
  system_admin: "border-t-amber-400",
  inventory_manager: "border-t-blue-500",
  editorial_manager: "border-t-purple-500",
  editorial: "border-t-purple-500",
  operations_manager: "border-t-green-500",
  customer_support: "border-t-cyan-500",
  business_analyst: "border-t-orange-500",
  school_liaison: "border-t-teal-500",
  catalog_admin: "border-t-rose-500",
};

interface RoleCardProps {
  role: RoleWithPermissions;
  isPending: boolean;
  canWrite: boolean;
  onEdit: (role: RoleWithPermissions) => void;
  onDelete: (role: RoleWithPermissions) => void;
}

/**
 *
 */
export function RoleCard({ role, isPending, canWrite, onEdit, onDelete }: RoleCardProps) {
  const t = useTranslations("Pages.Dashboard");
  const isProtected = PROTECTED_CODES.has(role.code);
  const accentClass = ROLE_ACCENT[role.code] ?? "border-t-gray-400";

  return (
    <Card
      className={`relative overflow-hidden border-t-4 transition-all duration-200 hover:shadow-md ${accentClass} ${isPending ? "opacity-60 pointer-events-none" : ""}`}
      aria-busy={isPending}
    >
      {/* Pending overlay spinner */}
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/40 z-10">
          <Icon name="progress_activity" className="text-primary animate-spin text-2xl" />
        </div>
      )}

      {/* Protected badge */}
      {isProtected && (
        <div className="absolute top-2 ltr:right-2 rtl:left-2" aria-label={t("Protected")}>
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 text-[10px] gap-1">
            <Icon name="lock" style={{ fontSize: 11 }} />
            {t("Protected")}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-2 pr-16">
        <CardTitle className="text-base leading-snug">{role.name}</CardTitle>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">{role.code}</p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Stats badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs gap-1">
            <Icon name="key" style={{ fontSize: 12 }} />
            {t("PermissionCount", { count: role.permissions.length })}
          </Badge>
          <Badge variant="outline" className="text-xs gap-1">
            <Icon name="group" style={{ fontSize: 12 }} />
            {t("UserCount", { count: role.userCount })}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(role)}
            aria-label={`${t("Edit")} ${role.name}`}
          >
            <Icon name="edit" style={{ fontSize: 14 }} className="ltr:mr-1 rtl:ml-1" />
            {t("Edit")}
          </Button>
          {!isProtected && canWrite && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-destructive border-destructive/40 hover:bg-destructive/10"
              onClick={() => onDelete(role)}
              disabled={role.userCount > 0}
              title={role.userCount > 0 ? t("CannotDeleteRoleWithUsers") : undefined}
              aria-label={`${t("Delete")} ${role.name}`}
            >
              <Icon name="delete" style={{ fontSize: 14 }} className="ltr:mr-1 rtl:ml-1" />
              {t("Delete")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
