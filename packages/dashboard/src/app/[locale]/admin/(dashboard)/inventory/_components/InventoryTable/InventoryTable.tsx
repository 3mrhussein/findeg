"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@findeg/ui";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  bulkUpdateStockAction,
  updateStockAction,
} from "@/actions/admin-actions";
import type { Product } from "@/features/catalog/domain/entities/Product";
import type { InventoryTableProps, SortKey } from "./InventoryTable.interface";
import { InventoryFilters } from "./InventoryFilters";
import { InventoryBatchControls } from "./InventoryBatchControls";
import { InventoryRow } from "./InventoryRow";

/**
 * InventoryTable — orchestrates search/sort/filter, batch adjustment, and inline row editing.
 */
export function InventoryTable({ products }: InventoryTableProps) {
  const { toast } = useToast();
  const router = useRouter();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStock, setEditStock] = useState(0);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name-asc");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [batchDelta, setBatchDelta] = useState(1);
  const [batchSaving, setBatchSaving] = useState(false);

  const visibleProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const firstVariant = product.variants?.[0];
      const sku = firstVariant?.sku ?? "";
      const matchesSearch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        sku.toLowerCase().includes(query);
      const inv = firstVariant?.inventory?.[0];
      const onHand = inv ? inv.onHand - inv.reserved : undefined;
      const threshold = firstVariant?.lowStockThreshold;
      const isLow = onHand !== undefined && threshold !== undefined && onHand <= threshold;
      return matchesSearch && (!lowStockOnly || isLow);
    });
    return filtered.sort((a, b) => {
      const aStock = a.variants?.[0]?.inventory?.[0]?.onHand ?? 0;
      const bStock = b.variants?.[0]?.inventory?.[0]?.onHand ?? 0;
      if (sortKey === "stock-asc") return aStock - bStock;
      if (sortKey === "stock-desc") return bStock - aStock;
      return a.name.localeCompare(b.name);
    });
  }, [products, searchTerm, lowStockOnly, sortKey]);

  const selectedVisibleCount = visibleProducts.filter((p) =>
    selectedProductIds.includes(p.id),
  ).length;

  /**
   *
   */
  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditStock(product.variants?.[0]?.inventory?.[0]?.onHand ?? 0);
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
      const product = products.find((p) => p.id === productId);
      const result = await updateStockAction({
        variantId: product?.variants?.[0]?.id ?? 0,
        quantity: editStock,
      });
      if (result.success) {
        toast({ title: "Stock updated", description: "Inventory updated successfully." });
        setEditingId(null);
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  /**
   *
   */
  const toggleSelect = (id: number, checked: boolean) =>
    setSelectedProductIds((cur) =>
      checked ? [...new Set([...cur, id])] : cur.filter((x) => x !== id),
    );

  /**
   *
   */
  const toggleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedProductIds((cur) => cur.filter((id) => !visibleProducts.some((p) => p.id === id)));
    } else {
      setSelectedProductIds((cur) => [...new Set([...cur, ...visibleProducts.map((p) => p.id)])]);
    }
  };

  /**
   *
   */
  const applyBatch = async (direction: 1 | -1) => {
    if (selectedProductIds.length === 0 || !Number.isFinite(batchDelta) || batchDelta <= 0) return;
    const updates = selectedProductIds.flatMap((id) => {
      const product = products.find((p) => p.id === id);
      const variant = product?.variants?.[0];
      if (!variant) return [];
      const current = variant.inventory?.[0]?.onHand ?? 0;
      return [
        {
          variantId: variant.id,
          quantity: Math.max(0, current + direction * batchDelta),
          lowStockThreshold: variant.lowStockThreshold,
        },
      ];
    });
    if (updates.length === 0) return;
    setBatchSaving(true);
    try {
      const result = await bulkUpdateStockAction(updates);
      if (result.success) {
        toast({
          title: "Batch update complete",
          description: `Updated ${updates.length} products.`,
        });
        setSelectedProductIds([]);
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to apply batch update.",
      });
    } finally {
      setBatchSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <InventoryFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortKey={sortKey}
          onSortChange={setSortKey}
          lowStockOnly={lowStockOnly}
          onLowStockChange={setLowStockOnly}
        />
        <InventoryBatchControls
          selectedCount={selectedProductIds.length}
          selectedVisibleCount={selectedVisibleCount}
          batchDelta={batchDelta}
          batchSaving={batchSaving}
          onBatchDeltaChange={setBatchDelta}
          onIncrease={() => applyBatch(1)}
          onDecrease={() => applyBatch(-1)}
        />
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input
                  type="checkbox"
                  checked={
                    visibleProducts.length > 0 && selectedVisibleCount === visibleProducts.length
                  }
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  aria-label="Select visible products"
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleProducts.map((product) => (
              <InventoryRow
                key={product.id}
                product={product}
                isSelected={selectedProductIds.includes(product.id)}
                isEditing={editingId === product.id}
                editStock={editStock}
                saving={saving}
                onSelect={toggleSelect}
                onEdit={startEdit}
                onSave={saveEdit}
                onCancel={cancelEdit}
                onStockChange={setEditStock}
              />
            ))}
            {visibleProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                  No inventory rows match current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
