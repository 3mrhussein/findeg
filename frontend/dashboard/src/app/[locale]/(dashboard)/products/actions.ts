'use server';

import { deleteProduct, setProductStatus } from '@data/products/actions';

type BulkResult = { success: boolean; error?: string };

/** Apply a product mutation to every id and report the first failure, if any. */
async function applyToEach(
  ids: number[],
  mutate: (id: number) => Promise<BulkResult>,
): Promise<BulkResult> {
  const failures: string[] = [];
  for (const id of ids) {
    const result = await mutate(id);
    if (!result.success) {
      failures.push(`#${id}: ${result.error ?? 'failed'}`);
    }
  }
  return failures.length > 0 ? { success: false, error: failures.join('; ') } : { success: true };
}

export async function duplicateProductAction(_id: number) {
  return { success: false, error: 'Not implemented - needs repository-based refactoring' };
}

export async function bulkActivateAction(ids: number[]) {
  return applyToEach(ids, (id) => setProductStatus(id, true));
}

export async function bulkDeactivateAction(ids: number[]) {
  return applyToEach(ids, (id) => setProductStatus(id, false));
}

export async function bulkDeleteAction(ids: number[]) {
  return applyToEach(ids, deleteProduct);
}
