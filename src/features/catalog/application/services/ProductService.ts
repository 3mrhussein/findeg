import { ID } from "@/features/core/domain/types/common";
import type { IProductRepository } from "../interfaces/IProductRepository";
import type { IProductService } from "@/features/catalog/application/interfaces/IProductService";
import type { Product } from "@/features/catalog/domain/entities/Product";
import { CustomerGroup, UomCode } from "@/features/core/domain/types/common";
import { VariantSellOption } from "../interfaces/IProductRepository";

/**
 * Product Service — Handles product retrieval and search for the public shop.
 */
export class ProductService implements IProductService {
  /**
   * Creates an instance of ProductService.
   *
   * @param productRepository - The repository for product data access.
   */
  constructor(private productRepository: IProductRepository) {}

  /**
   * Retrieves all products, optionally localized to a specific language.
   *
   * @param language - Optional ISO language code (e.g., 'en', 'ar').
   * @returns A list of products.
   */
  async getAll(language?: string): Promise<Product[]> {
    return this.productRepository.getAll(language);
  }

  /**
   * Retrieves a single product by its unique identifier.
   *
   * @param id - The product ID.
   * @param language - Optional language for localized content.
   * @returns The product if found, null otherwise.
   */
  async getById(id: ID, language?: string): Promise<Product | null> {
    return this.productRepository.getById(id, language);
  }

  /**
   * Retrieves a list of featured products to display on the home or landing pages.
   *
   * @param limit - Maximum number of products to return.
   * @param language - Optional language for localized content.
   * @returns A list of featured products.
   */
  async getFeaturedProducts(limit: number = 8, language?: string): Promise<Product[]> {
    return this.productRepository.getFeatured(limit, language);
  }

  /**
   * Performs a full-text search across product name and description.
   *
   * @param query - The search query string.
   * @param language - Optional language for localized content.
   * @returns A list of products matching the query.
   */
  async searchProducts(query: string, language?: string): Promise<Product[]> {
    return this.productRepository.search(query, language);
  }

  /**
   * Retrieves all products belonging to a specific category.
   *
   * @param categoryId - The unique identifier of the category.
   * @param language - Optional language for localized content.
   * @returns A list of products in the category.
   */
  async getByCategory(categoryId: ID, language?: string): Promise<Product[]> {
    return this.productRepository.getByCategory(categoryId, language);
  }

  /**
   * Retrieves sell options for a variant and optional customer group.
   *
   * @param productId - Product identifier.
   * @param variantKey - Stable key for variant in product variants JSON.
   * @param customerGroup - Optional pricing context.
   */
  async getVariantSellOptions(
    productId: ID,
    variantKey: string,
    customerGroup?: CustomerGroup,
  ): Promise<VariantSellOption[]> {
    return this.productRepository.getVariantSellOptions(productId, variantKey, customerGroup);
  }

  /**
   * Resolves effective unit price for variant, uom, and customer group.
   *
   * @param productId - Product identifier.
   * @param variantKey - Stable key for variant in product variants JSON.
   * @param uomCode - Selected sellable unit.
   * @param customerGroup - Customer pricing group.
   */
  async quoteVariantUnitPrice(
    productId: ID,
    variantKey: string,
    uomCode: UomCode,
    customerGroup: CustomerGroup,
  ): Promise<{ unitPrice: number; currency: string; isSellable: boolean } | null> {
    return this.productRepository.resolveVariantUnitPrice(
      productId,
      variantKey,
      uomCode,
      customerGroup,
    );
  }
}
