import type { Product } from "../../domain/entities/Product";
import type { ProductInput } from "@/features/administration/domain/types";

/**
 * Product filtering options for advanced search and categorization.
 */
export interface ProductFilters {
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isNew?: boolean;
  onSale?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  page?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "rating";
}

/**
 * Product Repository Interface
 *
 * Defines the contract for product data access across all layers.
 */
export interface IProductRepository {
  /**
   * Retrieves a single product by ID.
   */
  getById(id: number, language?: string): Promise<Product | null>;

  /**
   * Retrieves all products.
   */
  getAll(language?: string): Promise<Product[]>;

  /**
   * Retrieves featured products.
   */
  getFeatured(limit?: number, language?: string): Promise<Product[]>;

  /**
   * Retrieves products belonging to a specific category.
   */
  getByCategory(categoryId: number, language?: string): Promise<Product[]>;

  /**
   * Retrieves products belonging to a specific brand.
   */
  getByBrand(brandId: number, language?: string): Promise<Product[]>;

  /**
   * Performs full-text search across product name and description.
   */
  search(query: string, language?: string): Promise<Product[]>;

  /**
   * Retrieves a paginated list of products matching the given filters.
   */
  getFiltered(
    filters: ProductFilters,
    language?: string,
  ): Promise<{ products: Product[]; total: number }>;

  /**
   * Retrieves products with stock levels below the given threshold.
   */
  getLowStock(threshold?: number, language?: string): Promise<Product[]>;

  /**
   * Directly updates the stock quantity of a product.
   */
  updateStock(id: number, quantity: number): Promise<void>;

  /**
   * Updates both stock level and low-stock notification threshold.
   */
  updateStockConfiguration(
    id: number,
    config: { quantity: number; lowStockThreshold?: number },
  ): Promise<void>;

  /**
   * Performs a batch update of stock levels (optimized for performance).
   */
  bulkUpdateStock(updates: { id: number; quantity: number }[]): Promise<void>;

  /**
   * Persists a new product to the database.
   */
  create(input: ProductInput): Promise<Product>;

  /**
   * Updates an existing product's details and translations.
   */
  update(id: number, input: ProductInput): Promise<Product>;

  /**
   * Removes a product from the database.
   */
  delete(id: number): Promise<void>;

  /**
   * Counts the total number of products matching the given filters.
   */
  count(filters?: ProductFilters): Promise<number>;

  /**
   * Retrieves raw product data including all translations for administrative forms.
   */
  getByIdWithTranslations(id: number): Promise<(ProductInput & { id: number }) | null>;
}
