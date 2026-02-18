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
import { Product } from "@/features/catalog/domain/entities/Product";
import { useMemo, useState } from "react";
import {
  bulkUpdateStockAction,
  updateStockAction,
} from "@/features/administration/application/actions/inventory";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface InventoryTableProps {
  products: Product[];
}

/**
 *
 */
export function InventoryTable({ products }: InventoryTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortKey, setSortKey] = useState<"name-asc" | "stock-asc" | "stock-desc">("name-asc");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [batchDelta, setBatchDelta] = useState<number>(1);
  const [batchSaving, setBatchSaving] = useState(false);

  const visibleProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesSearch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        (product.sku || "").toLowerCase().includes(query);

      const isLowStock =
        product.stockQuantity !== undefined &&
        product.lowStockThreshold !== undefined &&
        product.stockQuantity <= product.lowStockThreshold;

      const matchesLowStock = !lowStockOnly || isLowStock;
      return matchesSearch && matchesLowStock;
    });

    return filtered.sort((a, b) => {
      if (sortKey === "stock-asc") return (a.stockQuantity || 0) - (b.stockQuantity || 0);
      if (sortKey === "stock-desc") return (b.stockQuantity || 0) - (a.stockQuantity || 0);
      return a.name.localeCompare(b.name);
    });
  }, [products, searchTerm, lowStockOnly, sortKey]);

  const selectedVisibleCount = visibleProducts.filter((product) =>
    selectedProductIds.includes(product.id),
  ).length;

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
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  /**
   *
   */
  const toggleProductSelection = (productId: number, checked: boolean) => {
    setSelectedProductIds((current) =>
      checked ? [...new Set([...current, productId])] : current.filter((id) => id !== productId),
    );
  };

  /**
   *
   */
  const toggleSelectAllVisible = (checked: boolean) => {
    if (!checked) {
      setSelectedProductIds((current) =>
        current.filter((id) => !visibleProducts.some((product) => product.id === id)),
      );
      return;
    }

    setSelectedProductIds((current) => [
      ...new Set([...current, ...visibleProducts.map((product) => product.id)]),
    ]);
  };

  /**
   *
   */
  const applyBatchAdjustment = async (direction: 1 | -1) => {
    if (selectedProductIds.length === 0) return;
    if (!Number.isFinite(batchDelta) || batchDelta <= 0) return;

    const updates: Array<{ productId: number; quantity: number; lowStockThreshold?: number }> = [];
    selectedProductIds.forEach((productId) => {
      const product = products.find((item) => item.id === productId);
      if (!product) return;

      const currentStock = product.stockQuantity || 0;
      const nextStock = Math.max(0, currentStock + direction * batchDelta);
      updates.push({
        productId,
        quantity: nextStock,
        lowStockThreshold: product.lowStockThreshold,
      });
    });

    if (updates.length === 0) return;

    setBatchSaving(true);
    try {
      const result = await bulkUpdateStockAction(updates);
      if (result.success) {
        toast({
          title: "Batch update complete",
          description: `Updated stock for ${updates.length} products.`,
        });
        setSelectedProductIds([]);
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to apply batch update." });
    } finally {
      setBatchSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium">Search</p>
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Filter by product name or SKU"
              className="w-full md:w-80"
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Sort</p>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as typeof sortKey)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="stock-asc">Stock (Low to High)</option>
              <option value="stock-desc">Stock (High to Low)</option>
            </select>
          </div>
          <label className="inline-flex items-center gap-2 text-sm md:mt-6">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(event) => setLowStockOnly(event.target.checked)}
            />
            Low stock only
          </label>
        </div>

        <div className="rounded-md border p-3">
          <p className="text-sm font-medium">Batch adjustment</p>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedProductIds.length} selected ({selectedVisibleCount} visible)
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Input
              type="number"
              min={1}
              value={batchDelta}
              onChange={(event) => setBatchDelta(Math.max(1, Number(event.target.value) || 1))}
              className="h-8 w-24"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={batchSaving || selectedProductIds.length === 0}
              onClick={() => applyBatchAdjustment(1)}
            >
              Increase
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={batchSaving || selectedProductIds.length === 0}
              onClick={() => applyBatchAdjustment(-1)}
            >
              Decrease
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input
                  type="checkbox"
                  checked={visibleProducts.length > 0 && selectedVisibleCount === visibleProducts.length}
                  onChange={(event) => toggleSelectAllVisible(event.target.checked)}
                  aria-label="Select visible products"
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Current Stock</TableHead>
              {/* <TableHead>Threshold</TableHead> */}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleProducts.map((product) => (
              <TableRow key={product.id} data-testid={`admin-inventory-row-${product.id}`}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(product.id)}
                    onChange={(event) => toggleProductSelection(product.id, event.target.checked)}
                    aria-label={`Select ${product.name}`}
                  />
                </TableCell>
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
                      data-testid={`admin-inventory-stock-input-${product.id}`}
                      value={editStock}
                      onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                      className="w-24 h-8"
                    />
                  ) : (
                    <span
                      data-testid={`admin-inventory-stock-value-${product.id}`}
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
                      <Button
                        size="sm"
                        variant="ghost"
                        data-testid={`admin-inventory-cancel-${product.id}`}
                        onClick={cancelEdit}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        data-testid={`admin-inventory-save-${product.id}`}
                        onClick={() => saveEdit(product.id)}
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`admin-inventory-edit-${product.id}`}
                      onClick={() => startEdit(product)}
                    >
                      Edit Stock
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {visibleProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                  No inventory rows match current filters.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
