import { ID, Price, Quantity, CustomerGroup, UomCode } from "@/features/core/domain/types/common";
import type { Product } from "../../domain/entities/Product";
import type { ProductInput } from "@/features/administration/domain/types";

export interface VariantSellableUomInput {
  uomCode: UomCode;
  factorToBase: number;
  isEnabled?: boolean;
}

export interface VariantPriceListInput {
  customerGroup: CustomerGroup;
  uomCode: UomCode;
  unitPrice: Price;
  currency?: string;
  isSellable?: boolean;
}

export interface VariantSellOption {
  uomCode: UomCode;
  factorToBase: number;
  isEnabled: boolean;
  unitPrice?: Price;
  currency?: string;
  isSellable?: boolean;
}

/**
 * Product filtering options for advanced search and categorization.
 */
export interface ProductFilters {
  categoryId?: ID;
  brandId?: ID;
  minPrice?: Price;
  maxPrice?: Price;
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
  getById(id: ID, language?: string): Promise<Product | null>;

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
  getByCategory(categoryId: ID, language?: string): Promise<Product[]>;

  /**
   * Retrieves products belonging to a specific brand.
   */
  getByBrand(brandId: ID, language?: string): Promise<Product[]>;

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
  getLowStock(threshold?: Quantity, language?: string): Promise<Product[]>;

  /**
   * Directly updates the stock quantity of a product.
   */
  updateStock(id: ID, quantity: Quantity): Promise<void>;

  /**
   * Updates both stock level and low-stock notification threshold.
   */
  updateStockConfiguration(
    id: ID,
    config: { quantity: Quantity; lowStockThreshold?: Quantity },
  ): Promise<void>;

  /**
   * Performs a batch update of stock levels (optimized for performance).
   */
  bulkUpdateStock(updates: { id: ID; quantity: Quantity }[]): Promise<void>;

  /**
   * Persists a new product to the database.
   */
  create(input: ProductInput): Promise<Product>;

  /**
   * Updates an existing product's details and translations.
   */
  update(id: ID, input: ProductInput): Promise<Product>;

  /**
   * Removes a product from the database.
   */
  delete(id: ID): Promise<void>;

  /**
   * Counts the total number of products matching the given filters.
   */
  count(filters?: ProductFilters): Promise<number>;

  /**
   * Retrieves raw product data including all translations for administrative forms.
   */
  getByIdWithTranslations(id: ID): Promise<(ProductInput & { id: ID }) | null>;

  /**
   * Upserts sellable UoM definitions for a product variant.
   */
  upsertVariantSellableUoms(
    productId: ID,
    variantKey: string,
    uoms: VariantSellableUomInput[],
  ): Promise<void>;

  /**
   * Upserts customer-group price lists for a product variant.
   */
  upsertVariantPriceLists(
    productId: ID,
    variantKey: string,
    prices: VariantPriceListInput[],
  ): Promise<void>;

  /**
   * Gets combined sell options (UoM + optional prices) for a variant.
   */
  getVariantSellOptions(
    productId: ID,
    variantKey: string,
    customerGroup?: CustomerGroup,
  ): Promise<VariantSellOption[]>;

  /**
   * Resolves effective unit price for a variant/UoM/customer group.
   */
  resolveVariantUnitPrice(
    productId: ID,
    variantKey: string,
    uomCode: UomCode,
    customerGroup: CustomerGroup,
  ): Promise<{ unitPrice: Price; currency: string; isSellable: boolean } | null>;
}
