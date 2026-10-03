/**
 * Dashboard Outbox Server Actions
 */

'use server';

import { revalidatePath } from 'next/cache';
import { adminSession } from '@findeg/backend/features/core';
import { retryOutbox } from '@findeg/backend/features/outbox';
import { getSession } from '@lib/session';
import { getErrorMessage } from '@lib/type-guards';

/** Server Action: Staff retry of one exhausted outbox row. */
export async function retryOutboxAction(id: string) {
  try {
    const session = await getSession();
    if (!session || !adminSession(session)) return { success: false, error: 'Unauthorized' };

    const requeued = await retryOutbox(id);
    revalidatePath('/', 'layout');
    return requeued ? { success: true } : { success: false, error: 'Row is no longer exhausted' };
  } catch (error: unknown) {
    console.error('[retryOutboxAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}
