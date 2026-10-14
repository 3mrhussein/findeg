'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { NotAuthorizedError } from '@findeg/domain-errors';
import { requireStaffAction } from '@lib/auth-guard';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import type { AcademicSystem, Governorate, Locale, SchoolType } from '@findeg/domain';
import { createPartnerMembershipServices } from '@findeg/partners';
import { toStaffActor } from '../_lib/toStaffActor';

export interface PartnerFormState {
  status: 'idle' | 'saved' | 'error';
  message?: string;
}

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

    const area = String(formData.get('area') ?? '').trim();
    const logoUrl = String(formData.get('logoUrl') ?? '').trim();
    // Default selects alone do not request a profile; names-only edits remain valid.
    const wantsProfile = Boolean(area || logoUrl);
    if (wantsProfile && !area) {
      return { status: 'error', message: 'invalid-input' };
    }
    const schoolProfile = wantsProfile
      ? {
          governorate: String(formData.get('governorate') ?? '') as Governorate,
          area,
          schoolType: String(formData.get('schoolType') ?? '') as SchoolType,
          academicSystem: String(formData.get('academicSystem') ?? '') as AcademicSystem,
          logoUrl: logoUrl || null,
        }
      : undefined;
    const input = { ...fields, schoolProfile };
    const result =
      partnerId === null
        ? await partners.createPartner(actor, input)
        : await partners.updatePartner(actor, partnerId, input);
    if (!result.success) {
      return { status: 'error', message: result.error };
    }

    revalidatePath('/[locale]/partners', 'page');
    revalidatePath('/[locale]/partners/[id]', 'page');
    updateTag('partners');
    return { status: 'saved' };
  } catch (error) {
    if (!(error instanceof NotAuthorizedError)) throw error;
    return { status: 'error', message: 'forbidden' };
  }
}
