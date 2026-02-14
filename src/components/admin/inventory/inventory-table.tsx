"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/domain/entities/Product";
import { useState } from "react";
import { updateStockAction } from "@/application/actions/admin/inventory";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InventoryTableProps {
  products: Product[];
}

/**
 *
 */
export function InventoryTable({ products }: InventoryTableProps) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  /**
   *
   */
  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditStock(product.stockQuantity || 0);
  };

  /**
   *
   */
  const cancelEdit = () => {
    setEditingId(null);
    setEditStock(0);
  };

  /**
   *
   */
  const saveEdit = async (productId: number) => {
    setSaving(true);
    try {
      const result = await updateStockAction({
        productId,
        quantity: editStock,
      });

      if (result.success) {
        toast({ title: "Stock updated", description: "Inventory updated successfully." });
        setEditingId(null);
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search / Filters could go here */}

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Current Stock</TableHead>
              {/* <TableHead>Threshold</TableHead> */}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{product.name}</span>
                    {product.stockQuantity !== undefined &&
                      product.lowStockThreshold !== undefined &&
                      product.stockQuantity <= product.lowStockThreshold && (
                        <span className="text-xs text-red-500 flex items-center mt-1">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Low Stock (Limit:{" "}
                          {product.lowStockThreshold})
                        </span>
                      )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{product.sku || "-"}</TableCell>
                <TableCell>
                  {editingId === product.id ? (
                    <Input
                      type="number"
                      value={editStock}
                      onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                      className="w-24 h-8"
                    />
                  ) : (
                    <span
                      className={
                        product.stockQuantity !== undefined &&
                        product.lowStockThreshold !== undefined &&
                        product.stockQuantity <= product.lowStockThreshold
                          ? "text-red-600 font-bold"
                          : ""
                      }
                    >
                      {product.stockQuantity || 0}
                    </span>
                  )}
                </TableCell>
                {/* <TableCell>{product.lowStockThreshold}</TableCell> */}
                <TableCell className="text-right">
                  {editingId === product.id ? (
                    <div className="flex justify-end space-x-2">
                      <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={saving}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => saveEdit(product.id)} disabled={saving}>
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => startEdit(product)}>
                      Edit Stock
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
