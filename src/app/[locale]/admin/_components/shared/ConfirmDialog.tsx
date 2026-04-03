/**
 * ConfirmDialog Component
 *
 * Confirmation modal for destructive actions (delete, archive, etc.).
 *
 * Location: src/app/[locale]/admin/_components/shared/ (admin-wide)
 */

"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmDialogProps {
  /** Dialog open state */
  open: boolean;
  /** Close handler */
  onOpenChange: (open: boolean) => void;
  /** Confirm handler */
  onConfirm: () => void | Promise<void>;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description: string;
  /** Confirm button label (default: "Confirm") */
  confirmLabel?: string;
  /** Cancel button label (default: "Cancel") */
  cancelLabel?: string;
  /** Destructive action styling (default: true) */
  variant?: "destructive" | "default";
  /** Loading state */
  loading?: boolean;
}

/**
 * ConfirmDialog — Destructive action confirmation
 *
 * @example
 * <ConfirmDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onConfirm={handleDelete}
 *   title="Delete Product"
 *   description="Are you sure you want to delete this product? This action cannot be undone."
 *   confirmLabel="Delete"
 *   loading={isDeleting}
 * />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button onClick={handleConfirm} disabled={loading} variant={variant}>
            {loading ? "Processing..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
