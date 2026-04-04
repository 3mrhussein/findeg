/**
 * DeactivateConfirmDialog
 *
 * Modal confirmation before deactivating an admin user.
 * Shows their name, warns about immediate access loss,
 * and provides a clear destructive CTA.
 *
 * Accessibility: focus trapped inside modal, Escape closes,
 * destructive action is not the default focused button.
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@findeg/ui";
import { Button } from "@findeg/ui";
import { Icon } from "@findeg/ui";

interface DeactivateConfirmDialogProps {
  open: boolean;
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Renders a small confirmation modal for the deactivate action.
 * The Cancel button gets autofocus so the user must explicitly click Deactivate.
 */
export function DeactivateConfirmDialog({
  open,
  userName,
  onConfirm,
  onCancel,
  loading,
}: DeactivateConfirmDialogProps) {
  const t = useTranslations("Pages.Dashboard");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-sm" aria-describedby="deactivate-body">
        <DialogHeader className="items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <Icon name="warning" className="text-destructive" style={{ fontSize: 28 }} />
          </div>
          <DialogTitle className="text-xl">{t("DeactivateTitle")}</DialogTitle>
        </DialogHeader>

        <p id="deactivate-body" className="text-center text-sm text-muted-foreground px-2">
          {t("DeactivateBody", { name: userName })}
        </p>

        <DialogFooter className="flex-row gap-2 sm:flex-row">
          {/* Cancel is first in DOM → gets focus first via Tab */}
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            autoFocus
            disabled={loading}
          >
            {t("KeepActive")}
          </Button>
          <Button variant="destructive" className="flex-1" onClick={onConfirm} disabled={loading}>
            {loading && (
              <Icon name="progress_activity" className="w-4 h-4 ltr:mr-2 rtl:ml-2 animate-spin" />
            )}
            {t("Deactivate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
