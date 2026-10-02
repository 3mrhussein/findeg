'use server';

import { getLocale } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import {
  createPartnerMembershipServices,
  type LeaveError,
} from '@findeg/backend/features/partner-membership';
import { redirect } from '@i18n/navigation';
import { actionError, type ActionState } from './_lib/action-state';
import { resolvePartnerAccess } from './_lib/access';

const LEAVE_ERRORS: Record<LeaveError, string> = {
  forbidden: 'You cannot leave this Business Partner.',
  'membership-ended': 'You have already left this Business Partner.',
  'last-administrator':
    'You are the last active Partner Administrator. Make someone else an administrator first.',
};

/** Ends the signed-in member's own membership, then sends them to their remaining workspaces. */
export async function leaveAction(code: string): Promise<ActionState> {
  const access = await resolvePartnerAccess(code);
  if (!access) return actionError(LEAVE_ERRORS, 'forbidden');
  const result = await createPartnerMembershipServices().memberships.leave(
    access.actor,
    access.context.membership.id,
  );
  if (!result.success) return actionError(LEAVE_ERRORS, result.error);
  revalidatePath('/[locale]/partner/[code]', 'layout');
  return redirect({ href: '/partner', locale: await getLocale() });
}
