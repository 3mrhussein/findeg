'use server';

import { revalidatePath } from 'next/cache';
import {
  createPartnerMembershipServices,
  type UpdateMembershipError,
  type UpdateMembershipInput,
} from '@findeg/backend/features/partner-membership';
import { actionError, type ActionState } from '../_lib/action-state';
import { resolvePartnerAccess } from '../_lib/access';

const UPDATE_ERRORS: Record<UpdateMembershipError, string> = {
  forbidden: 'You do not have permission to do that.',
  'invalid-input': 'Choose at least one role.',
  'partner-not-open': 'Members can only change while the Business Partner is onboarding or active.',
  'membership-ended': 'This membership has already ended.',
  'stale-membership': 'This member was changed by someone else. Reload the page and try again.',
  'last-administrator': 'A Business Partner must keep at least one active Partner Administrator.',
};

export async function updateMemberAction(
  code: string,
  membershipId: number,
  expectedVersion: number,
  input: UpdateMembershipInput,
): Promise<ActionState> {
  const access = await resolvePartnerAccess(code);
  if (!access) return actionError(UPDATE_ERRORS, 'forbidden');
  const result = await createPartnerMembershipServices().memberships.updateMembership(
    access.actor,
    membershipId,
    input,
    expectedVersion,
  );
  if (!result.success) {
    return {
      ...actionError(UPDATE_ERRORS, result.error),
      stale: result.error === 'stale-membership',
    };
  }
  revalidatePath('/[locale]/partner/[code]', 'layout');
  return { status: 'done' };
}
