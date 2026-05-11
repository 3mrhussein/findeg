import { inArray } from 'drizzle-orm';
import { db } from '../../connection';
import { products } from '../../schema';

export async function bulkDeleteProducts(ids: number[]): Promise<void> {
  await db.delete(products).where(inArray(products.id, ids));
}