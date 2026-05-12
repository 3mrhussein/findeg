import {
    getCategoryById,
    getBrandById,
    getProductById,
} from '@findeg/db/queries';
import type { ID } from '../../../../core/domain/types/common';

export async function ensureCategoryExists(
    categoryId?: number | null,
): Promise<void> {
    if (!categoryId) return;

    const category = await getCategoryById(categoryId);
    if (!category) throw new Error(`Category ${categoryId} not found`);
}

export async function ensureBrandExists(
    brandId?: number | null,
): Promise<void> {
    if (!brandId) return;

    const brand = await getBrandById(brandId);
    if (!brand) throw new Error(`Brand ${brandId} not found`);
}

/**
 * Verifies that a product exists in the database
 * @param id - Product ID
 * @returns Product row if exists
 * @throws Error if product not found
 */
export async function getExistingProductOrThrow(id: ID) {
    const existing = await getProductById(id as number);
    if (!existing) throw new Error(`Product ${id} not found`);

    return existing;
}