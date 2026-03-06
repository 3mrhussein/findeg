"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { AlertTriangle, Loader2, Save } from "lucide-react";
import type { Product } from "@/features/catalog/domain/entities/Product";

interface InventoryRowProps {
  product: Product;
  isSelected: boolean;
  isEditing: boolean;
  editStock: number;
  saving: boolean;
  onSelect: (id: number, checked: boolean) => void;
  onEdit: (product: Product) => void;
  onSave: (id: number) => void;
  onCancel: () => void;
  onStockChange: (value: number) => void;
}

/**
 * Single inventory row — displays product stock, supports inline editing.
 */
export function InventoryRow({
  product,
  isSelected,
  isEditing,
  editStock,
  saving,
  onSelect,
  onEdit,
  onSave,
  onCancel,
  onStockChange,
}: InventoryRowProps) {
  const firstVariant = product.variants?.[0];
  const inv = firstVariant?.inventory?.[0];
  const onHand = inv ? inv.onHand - inv.reserved : 0;
  const threshold = firstVariant?.lowStockThreshold;
  const isLow = threshold !== undefined && onHand <= threshold;

  return (
    <TableRow data-testid={`admin-inventory-row-${product.id}`}>
      <TableCell>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(product.id, e.target.checked)}
          aria-label={`Select ${product.name}`}
        />
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span>{product.name}</span>
          {isLow && (
            <span className="text-xs text-red-500 flex items-center mt-1">
              <AlertTriangle className="h-3 w-3 mr-1" /> Low Stock (Limit: {threshold})
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{firstVariant?.sku ?? "–"}</TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="number"
            data-testid={`admin-inventory-stock-input-${product.id}`}
            value={editStock}
            onChange={(e) => onStockChange(parseInt(e.target.value) || 0)}
            className="w-24 h-8"
          />
        ) : (
          <span
            data-testid={`admin-inventory-stock-value-${product.id}`}
            className={isLow ? "text-red-600 font-bold" : ""}
          >
            {onHand}
          </span>
        )}
      </TableCell>
      <TableCell className="text-right">
        {isEditing ? (
          <div className="flex justify-end space-x-2">
            <Button
              size="sm"
              variant="ghost"
              data-testid={`admin-inventory-cancel-${product.id}`}
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              data-testid={`admin-inventory-save-${product.id}`}
              onClick={() => onSave(product.id)}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            data-testid={`admin-inventory-edit-${product.id}`}
            onClick={() => onEdit(product)}
          >
            Edit Stock
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
