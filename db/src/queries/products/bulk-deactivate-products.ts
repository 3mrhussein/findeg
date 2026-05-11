import { inArray } from 'drizzle-orm';
import { db } from '../../connection';
import { products } from '../../schema';

export async function bulkDeactivateProducts(ids: number[]): Promise<void> {
  await db.update(products).set({ isActive: false }).where(inArray(products.id, ids));
}