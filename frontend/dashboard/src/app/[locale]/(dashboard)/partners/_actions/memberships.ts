'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { requireStaffAction } from '@lib/auth-guard';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import type { Locale } from '@findeg/domain';
import {
  createPartnerMembershipServices,
  type UpdateMembershipInput,
} from '@findeg/backend/features/partner-membership';
import { toStaffActor } from '../_lib/toStaffActor';

export interface MembershipActionState {
  status: 'idle' | 'done' | 'error';
  message?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: 'You do not have permission to manage Business Partners.',
  'invalid-input': 'Choose at least one role.',
  'partner-not-open':
    'Memberships can only change while the Business Partner is onboarding or active.',
  'membership-ended': 'This membership has ended and cannot be changed.',
  'stale-membership': 'This member was changed by someone else. Reload the page and try again.',
  'last-administrator':
    'A Business Partner must keep at least one active Partner Administrator. Invite a replacement first.',
};

export async function updateMembershipAction(
  locale: Locale,
  membershipId: number,
  expectedVersion: number,
  input: UpdateMembershipInput,
): Promise<MembershipActionState> {
  try {
    const session = await requireStaffAction(
      PERMISSION_CODES.PARTNERS_MANAGE,
      'update partner membership',
    );
    const actor = toStaffActor(session);
    const { memberships } = createPartnerMembershipServices();
    const result = await memberships.updateMembership(actor, membershipId, input, expectedVersion);
    if (!result.success) {
      return {
        status: 'error',
        message: ERROR_MESSAGES[result.error] ?? 'Something went wrong. Try again.',
      };
    }
    revalidatePath('/[locale]/partners/[id]', 'page');
    updateTag('partners');
    return { status: 'done' };
  } catch {
    return { status: 'error', message: ERROR_MESSAGES.forbidden };
  }
}
