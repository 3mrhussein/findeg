"use client";

import { Button } from "@findeg/ui";
import { Archive, Trash2, Eye, EyeOff } from "lucide-react";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  adminUpdateProductAction,
  adminArchiveProductAction,
  adminDeleteProductAction,
  adminSetProductStatusAction,
} from "@/features/administration/application/actions/admin-product-actions";
import { useRouter } from "next/navigation";

interface ProductBulkActionBarProps {
  selectedIds: number[];
  onClearSelection: () => void;
}

/**
 *
 */
export function ProductBulkActionBar({ selectedIds, onClearSelection }: ProductBulkActionBarProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  if (selectedIds.length === 0) return null;

  /**
   *
   */
  const handleBulkAction = (action: "active" | "draft" | "archive" | "delete") => {
    if (action === "delete") {
      if (
        !confirm(
          `Are you sure you want to delete ${selectedIds.length} products? This cannot be undone.`,
        )
      ) {
        return;
      }
    }

    startTransition(async () => {
      let successCount = 0;
      let failureCount = 0;

      for (const id of selectedIds) {
        let result;
        try {
          if (action === "active") {
            result = await adminSetProductStatusAction(id, true);
          } else if (action === "draft") {
            result = await adminSetProductStatusAction(id, false);
          } else if (action === "archive") {
            // Note: Since we don't have an archive method, we might just set isActive to false or use it if available.
            // Assuming adminArchiveProductAction exists.
            result = await adminArchiveProductAction(id);
          } else if (action === "delete") {
            result = await adminDeleteProductAction(id);
          }

          if (result?.success) {
            successCount++;
          } else {
            failureCount++;
          }
        } catch {
          failureCount++;
        }
      }

      toast({
        title: "Bulk Action Completed",
        description: `Successfully updated ${successCount} products. ${failureCount > 0 ? `Failed: ${failureCount}.` : ""}`,
      });

      onClearSelection();
      router.refresh();
    });
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-popover border shadow-lg rounded-full px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-5">
      <div className="font-medium text-sm whitespace-nowrap">
        <span className="bg-primary text-primary-foreground text-xs py-0.5 px-2 rounded-full mr-2">
          {selectedIds.length}
        </span>
        selected
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        className="text-xs"
        onClick={() => handleBulkAction("active")}
      >
        <Eye className="w-4 h-4 mr-2" />
        Set Active
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        className="text-xs"
        onClick={() => handleBulkAction("draft")}
      >
        <EyeOff className="w-4 h-4 mr-2" />
        Set Draft
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        className="text-xs"
        onClick={() => handleBulkAction("archive")}
      >
        <Archive className="w-4 h-4 mr-2" />
        Archive
      </Button>

      <div className="w-px h-6 bg-border mx-2" />

      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => handleBulkAction("delete")}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </Button>
    </div>
  );
}
