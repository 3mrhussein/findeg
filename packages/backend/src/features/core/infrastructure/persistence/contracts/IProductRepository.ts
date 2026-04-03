/**
 * Product Repository Contract
 * 
 * Defines the interface for product data access operations.
 * Backend package exports this interface; frontend packages import it.
 */

export type Product = {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  categoryId: string;
  brandId: string | null;
  stock: number;
  sku: string | null;
  isActive: boolean;
  isFeatured: boolean;
  images: string[]; // Array of image URLs
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type ProductFilters = {
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string; // search by name or SKU
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'price' | 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
};

export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProductInput = Partial<CreateProductInput>;

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findMany(filters: ProductFilters): Promise<Product[]>;
  create(data: CreateProductInput): Promise<Product>;
  update(id: string, data: UpdateProductInput): Promise<Product>;
  delete(id: string): Promise<void>;
  count(filters?: ProductFilters): Promise<number>;
}
