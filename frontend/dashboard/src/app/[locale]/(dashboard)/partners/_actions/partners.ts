'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@lib/auth-guard';
import type { Locale } from 'next-intl';
import { createPartnerMembershipServices } from '@findeg/backend/features/partner-membership';
import { toStaffActor } from '../_lib/toStaffActor';

export interface PartnerFormState {
  status: 'idle' | 'saved' | 'error';
  message?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: 'You do not have permission to manage Business Partners.',
  'invalid-input':
    'Check the fields: the code must be lowercase letters, digits and hyphens, and both names are required.',
  'code-taken': 'Another Business Partner already uses this code.',
  'code-locked': 'The code can only be changed while the Business Partner is onboarding.',
  'not-found': 'This Business Partner no longer exists.',
};

/** Create (`partnerId` null) or update a Business Partner from the form. */
export async function savePartnerAction(
  partnerId: number | null,
  _previous: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  const actor = toStaffActor(await requireAdmin('en' as Locale));
  const { partners } = createPartnerMembershipServices();
  const fields = {
    code: String(formData.get('code') ?? '').trim(),
    nameEn: String(formData.get('nameEn') ?? ''),
    nameAr: String(formData.get('nameAr') ?? ''),
  };

  const result =
    partnerId === null
      ? await partners.createPartner(actor, fields)
      : await partners.updatePartner(actor, partnerId, fields);

  if (!result.success) {
    return { status: 'error', message: ERROR_MESSAGES[result.error] ?? result.error };
  }
  revalidatePath('/[locale]/partners', 'page');
  return { status: 'saved' };
}
