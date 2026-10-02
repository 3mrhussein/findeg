'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@lib/auth-guard';
import type { Locale } from 'next-intl';
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
  const actor = toStaffActor(await requireAdmin(locale));
  const { memberships } = createPartnerMembershipServices();
  const result = await memberships.updateMembership(actor, membershipId, input, expectedVersion);
  if (!result.success) {
    return { status: 'error', message: ERROR_MESSAGES[result.error] ?? result.error };
  }
  revalidatePath('/[locale]/partners/[id]', 'page');
  return { status: 'done' };
}
