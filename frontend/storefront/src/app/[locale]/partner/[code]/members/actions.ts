'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createPartnerMembershipServices,
  type PartnerRole,
  type UpdateMembershipInput,
} from '@findeg/backend/features/partner-membership';
import { resolvePartnerAccess } from '../_lib/access';
import type { ActionState } from '../_lib/roles';

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: 'You do not have permission to do that.',
  'invalid-input': 'Choose at least one role.',
  'not-found': 'This member no longer exists.',
  'partner-not-open': 'Members can only change while the Business Partner is onboarding or active.',
  'membership-ended': 'This membership has already ended.',
  'stale-membership': 'This member was changed by someone else. Reload the page and try again.',
  'last-administrator': 'A Business Partner must keep at least one active Partner Administrator.',
};

const fail = (error: string): ActionState => ({
  status: 'error',
  message: ERROR_MESSAGES[error] ?? error,
});

export async function updateMemberAction(
  code: string,
  membershipId: number,
  expectedVersion: number,
  input: { roles?: PartnerRole[]; status?: UpdateMembershipInput['status'] },
): Promise<ActionState> {
  const access = await resolvePartnerAccess(code);
  if (!access) return fail('forbidden');
  const result = await createPartnerMembershipServices().memberships.updateMembership(
    access.actor,
    membershipId,
    input,
    expectedVersion,
  );
  if (!result.success) return fail(result.error);
  revalidatePath('/[locale]/partner/[code]', 'layout');
  return { status: 'done' };
}

export async function leaveAction(
  locale: string,
  code: string,
  membershipId: number,
): Promise<ActionState> {
  const access = await resolvePartnerAccess(code);
  if (!access) return fail('forbidden');
  const result = await createPartnerMembershipServices().memberships.leave(
    access.actor,
    membershipId,
  );
  if (!result.success) return fail(result.error);
  redirect(`/${locale === 'ar' ? 'ar' : 'en'}`);
}
