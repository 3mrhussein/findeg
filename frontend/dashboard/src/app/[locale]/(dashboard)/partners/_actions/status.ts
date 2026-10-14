'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { requireStaffAction } from '@lib/auth-guard';
import { PERMISSION_CODES } from '@findeg/identity/types';
import type { Locale } from '@findeg/domain';
import {
  createPartnerMembershipServices,
  type BusinessPartner,
  type ChangePartnerStatusError,
} from '@findeg/partners';
import { toStaffActor } from '../_lib/toStaffActor';

export type StatusActionState = { status: 'idle' } | { status: 'error'; message: string };

const ERROR_MESSAGES: Record<ChangePartnerStatusError, string> = {
  forbidden: 'You do not have permission to manage Business Partners.',
  'not-found': 'This Business Partner no longer exists.',
  'invalid-transition':
    'This status change is not allowed from the current status. Reload the page and try again.',
  'last-administrator':
    'A Business Partner can only be activated once it has an active Partner Administrator. Invite one and wait for them to accept.',
};

export async function changePartnerStatusAction(
  locale: Locale,
  partnerId: number,
  target: BusinessPartner['status'],
): Promise<StatusActionState> {
  try {
    const session = await requireStaffAction(
      PERMISSION_CODES.PARTNERS_MANAGE,
      'change partner status',
    );
    const actor = toStaffActor(session);
    const { partners } = createPartnerMembershipServices();
    const result = await partners.changePartnerStatus(actor, partnerId, target);
    if (!result.success) return { status: 'error', message: ERROR_MESSAGES[result.error] };
    revalidatePath('/[locale]/partners', 'page'); // the list shows status
    revalidatePath('/[locale]/partners/[id]', 'page');
    updateTag('partners');
    return { status: 'idle' };
  } catch {
    return { status: 'error', message: ERROR_MESSAGES.forbidden };
  }
}
