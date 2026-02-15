/**
 * Input for creating/updating a product
 */
export interface ProductInput {
  sku?: string;
  price: number;
  strikePrice?: number;
  /** FK ID for category */
  categoryId?: number;
  /** Legacy text category (optional transition) */
  category?: string;
  brandId?: number;
  images?: string[];
  isActive?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  isNew?: boolean;
  variants?: Record<string, any>;
  translations: {
    language: string;
    name: string;
    description: string;
    longDescription: string;
  }[];
}
