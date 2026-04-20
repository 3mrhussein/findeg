/**
 * ProductTable — shared types & interfaces
 */

import type { Product } from "@findeg/backend/features/catalog";

export interface ProductFilters {
  search: string;
  categoryId?: number;
  brandId?: number;
  isActive: string;
  stockLevel?: string;
}

export interface ProductTableProps {
  data: Product[];
  page: number;
  limit: number;
  total: number;
  filters: ProductFilters;
  categories: Array<{ id: number; name: string }>;
  brands: Array<{ id: number; name: string }>;
}

export interface UpdateQueryParams {
  search?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: string;
  stockLevel?: string;
  page?: string;
}
