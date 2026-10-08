'use server';

import { deleteProduct, setProductStatus } from '@data/products/actions';

type MutationResult = { success: boolean; error?: string };
type BulkResult = MutationResult & { failedIds: number[] };

/** Apply a product mutation to every id and report every failure, with the ids that failed. */
async function applyToEach(
  ids: number[],
  mutate: (id: number) => Promise<MutationResult>,
): Promise<BulkResult> {
  const failures: string[] = [];
  const failedIds: number[] = [];
  for (const id of ids) {
    const result = await mutate(id);
    if (!result.success) {
      failures.push(`#${id}: ${result.error ?? 'failed'}`);
      failedIds.push(id);
    }
  }
  return failures.length > 0
    ? { success: false, error: failures.join('; '), failedIds }
    : { success: true, failedIds };
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
