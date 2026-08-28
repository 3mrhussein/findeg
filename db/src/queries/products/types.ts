export interface AdminProductListQueryFilters {
  search?: string;
  categoryIds?: number[];
  brandIds?: number[];
  status?: 'active' | 'inactive';
  completeness?: 'complete' | 'no-category' | 'no-images' | 'no-price' | 'draft';
  sortBy?: 'name' | 'price' | 'stock' | 'updatedAt';
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface AdminProductListRowRaw {
  id: number;
  localizedName: Record<string, string>;
  categoryId: number | null;
  categoryName: string | null;
  brandId: number | null;
  brandName: string | null;
  isActive: boolean;
  updatedAt: Date;
  defaultVariantPrice: number | null;
  variantCount: number;
  totalStock: number;
  hasImages: boolean;
  thumbnailUrl: string | null;
}

export interface AdminProductListQueryResult {
  rows: AdminProductListRowRaw[];
  total: number;
  page: number;
  pageSize: number;
}