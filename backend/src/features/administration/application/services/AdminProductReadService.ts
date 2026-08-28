import type { ID } from '../../../core/domain/types/common';
import type { Locale } from '../../../core/domain/value-objects';
import {
    getAdminProductForEditRaw,
    getAdminProductsListRaw,
    getAllProducts,
    getProductById,
    countProducts,
    type ProductRow,
} from '@findeg/db/queries';
import { mapAdminProductEditData, mapAdminProductListResult } from './helpers';
import type {
    ProductEditData,
    ProductListFilters,
    ProductListResult,
} from '../interfaces/IAdminProductService';

/**
 * Admin Product Read Service
 *
 * Handles all product read operations for the admin dashboard.
 * Uses query primitives from @findeg/db/queries for direct database access.
 * Domain mapping handled by mappers for admin-specific transformations.
 */
export class AdminProductReadService {
    async getProductsList(filters: ProductListFilters): Promise<ProductListResult> {
        const result = await getAdminProductsListRaw(filters);
        return mapAdminProductListResult(result);
    }

    /**
     * Get all products (legacy method - returns raw database rows)
     * @param _language - Ignored for query primitive compatibility
     */
    async getAll(_language?: Locale): Promise<ProductRow[]> {
        return getAllProducts();
    }

    /**
     * Get product by ID (legacy method - returns raw database row)
     * @param id - Product ID
     * @param _language - Ignored for query primitive compatibility
     */
    async getById(id: ID, _language?: Locale): Promise<ProductRow | null> {
        return getProductById(id as number);
    }

    /**
     * Count total products in the system
     */
    async count(): Promise<number> {
        return countProducts();
    }

    /**
     * Get product with full edit data including variants and tags
     */
    async getProductForEdit(id: number): Promise<ProductEditData | null> {
        const data = await getAdminProductForEditRaw(id);

        if (!data) return null;

        return mapAdminProductEditData(data);
    }
}