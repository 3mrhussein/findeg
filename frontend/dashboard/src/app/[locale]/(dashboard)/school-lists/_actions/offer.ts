'use server';

import { revalidatePath } from 'next/cache';
import { requireStaffAction } from '@lib/auth-guard';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import type { Locale } from '@findeg/domain';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import { toListActor } from '../_lib/toListActor';
import { parseOfferForm } from '../_lib/offerForm';

export interface OfferFormState {
  status: 'idle' | 'saved' | 'cleared' | 'error';
  message?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: 'You do not have permission to edit School Supply Lists.',
  'invalid-input': 'Check the offer: 0 to 100 percent, and the end must be after the start.',
  'not-found': 'This School Supply List no longer exists.',
  'partner-school-not-found': 'This list does not belong to a Partner School.',
};

const fail = (error: string): OfferFormState => ({
  status: 'error',
  message: ERROR_MESSAGES[error] ?? error,
});

const refresh = () => revalidatePath('/[locale]/school-lists/[id]', 'page');

/** Set or replace a list's List Offer. The list keeps its code and stays published. */
export async function saveOfferAction(
  locale: Locale,
  listId: number,
  _previous: OfferFormState,
  formData: FormData,
): Promise<OfferFormState> {
  try {
    const session = await requireStaffAction(
      PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE,
      'edit School Supply Lists',
    );
    const actor = toListActor(session);
    const parsed = parseOfferForm(formData);
    if (!parsed.ok) return { status: 'error', message: parsed.message };
    const { schoolSupplyLists } = createAdministrationServices();
    const result = await schoolSupplyLists.setOffer(actor, listId, parsed.offer);
    if (!result.success) return fail(result.error);
    refresh();
    return { status: 'saved' };
  } catch {
    return fail('forbidden');
  }
}

export async function clearOfferAction(
  locale: Locale,
  listId: number,
  _previous: OfferFormState,
): Promise<OfferFormState> {
  try {
    const session = await requireStaffAction(
      PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE,
      'edit School Supply Lists',
    );
    const actor = toListActor(session);
    const { schoolSupplyLists } = createAdministrationServices();
    const result = await schoolSupplyLists.clearOffer(actor, listId);
    if (!result.success) return fail(result.error);
    refresh();
    return { status: 'cleared' };
  } catch {
    return fail('forbidden');
  }
}
