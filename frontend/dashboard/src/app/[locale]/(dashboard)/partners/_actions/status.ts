'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@lib/auth-guard';
import type { Locale } from 'next-intl';
import {
  createPartnerMembershipServices,
  type BusinessPartner,
  type ChangePartnerStatusError,
} from '@findeg/backend/features/partner-membership';
import { toStaffActor } from '../_lib/toStaffActor';

export type StatusActionState = { status: 'idle' } | { status: 'error'; message: string };

const ERROR_MESSAGES: Record<ChangePartnerStatusError, string> = {
  forbidden: 'You do not have permission to manage Business Partners.',
  'not-found': 'This Business Partner no longer exists.',
  'invalid-transition':
    'This status change is not allowed from the current status. Reload the page and try again.',
  'no-active-administrator':
    'A Business Partner can only be activated once it has an active Partner Administrator. Invite one and wait for them to accept.',
};

export async function changePartnerStatusAction(
  locale: Locale,
  partnerId: number,
  target: BusinessPartner['status'],
): Promise<StatusActionState> {
  const actor = toStaffActor(await requireAdmin(locale));
  const { partners } = createPartnerMembershipServices();
  const result = await partners.changePartnerStatus(actor, partnerId, target);
  if (!result.success) return { status: 'error', message: ERROR_MESSAGES[result.error] };
  revalidatePath('/[locale]/partners', 'page'); // the list shows status
  revalidatePath('/[locale]/partners/[id]', 'page');
  return { status: 'idle' };
}
