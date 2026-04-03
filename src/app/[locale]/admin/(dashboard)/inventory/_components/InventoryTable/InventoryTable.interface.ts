/**
 * InventoryTable — shared types & interfaces
 */

import type { Product } from "@/features/catalog/domain/entities/Product";

export interface InventoryTableProps {
  products: Product[];
}

export type SortKey = "name-asc" | "stock-asc" | "stock-desc";

export interface InventoryEditState {
  editingId: number | null;
  editStock: number;
  saving: boolean;
}
