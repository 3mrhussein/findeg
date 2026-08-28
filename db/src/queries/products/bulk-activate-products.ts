import { inArray } from 'drizzle-orm';
import { db } from '../../connection';
import { products } from '../../schema';

export async function bulkActivateProducts(ids: number[]): Promise<void> {
  await db.update(products).set({ isActive: true }).where(inArray(products.id, ids));
}