'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { requireStaffAction } from '@lib/auth-guard';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import type { Locale } from '@findeg/domain';
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
  locale: Locale,
  partnerId: number | null,
  _previous: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  try {
    const session = await requireStaffAction(PERMISSION_CODES.PARTNERS_MANAGE, 'manage partners');
    const actor = toStaffActor(session);
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
    updateTag('partners');
    return { status: 'saved' };
  } catch {
    return { status: 'error', message: ERROR_MESSAGES.forbidden };
  }
}
