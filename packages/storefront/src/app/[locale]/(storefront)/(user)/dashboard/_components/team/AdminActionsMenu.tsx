/**
 * AdminActionsMenu
 *
 * Three-dot (⋮) action dropdown for an admin user row.
 * Shows: Edit, Manage Permissions, Deactivate/Reactivate.
 *
 * Accessibility: Opens on Enter/Space, arrow-key navigable,
 * closes on Escape.
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@findeg/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@findeg/ui";
import { Icon } from "@findeg/ui";

interface AdminActionsMenuProps {
  userId: number;
  userName: string;
  isActive: boolean;
  isPending: boolean;
  canWrite: boolean;
  onEdit: () => void;
  onManagePermissions: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
}

/**
 * Renders the ⋮ dropdown for one admin user row.
 */
export function AdminActionsMenu({
  userName,
  isActive,
  isPending,
  canWrite,
  onEdit,
  onManagePermissions,
  onDeactivate,
  onReactivate,
}: AdminActionsMenuProps) {
  const t = useTranslations("Pages.Dashboard");

  if (!canWrite) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 data-[state=open]:bg-muted"
          aria-label={t("ActionsFor", { name: userName })}
          disabled={isPending}
        >
          {isPending ? (
            <Icon name="progress_activity" className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <Icon name="more_horiz" className="w-4 h-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onEdit}>
          <Icon name="edit" className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
          {t("Edit")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onManagePermissions}>
          <Icon name="key" className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
          {t("ManagePermissions")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isActive ? (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={onDeactivate}
          >
            <Icon name="person_off" className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            {t("Deactivate")}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem className="text-green-600 focus:text-green-600" onClick={onReactivate}>
            <Icon name="person_check" className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            {t("Reactivate")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
