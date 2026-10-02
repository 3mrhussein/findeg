'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@lib/auth-guard';
import type { Locale } from 'next-intl';
import { createPartnerMembershipServices } from '@findeg/backend/features/partner-membership';
import { toStaffActor } from '../_lib/toStaffActor';

export interface StatusActionState {
  status: 'idle' | 'done' | 'error';
  message?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: 'You do not have permission to manage Business Partners.',
  'not-found': 'This Business Partner no longer exists.',
  'invalid-transition':
    'This status change is not allowed from the current status. Reload the page and try again.',
  'last-administrator':
    'A Business Partner can only be activated once it has an active Partner Administrator. Invite one and wait for them to accept.',
};

const TARGETS = ['active', 'suspended', 'closed'] as const;
type Target = (typeof TARGETS)[number];

export async function changePartnerStatusAction(
  locale: Locale,
  partnerId: number,
  target: string,
): Promise<StatusActionState> {
  const actor = toStaffActor(await requireAdmin(locale));
  if (!TARGETS.includes(target as Target)) {
    return { status: 'error', message: ERROR_MESSAGES['invalid-transition'] };
  }
  const { partners } = createPartnerMembershipServices();
  const result = await partners.changePartnerStatus(actor, partnerId, target as Target);
  if (!result.success) {
    return { status: 'error', message: ERROR_MESSAGES[result.error] ?? result.error };
  }
  revalidatePath('/[locale]/partners', 'page');
  revalidatePath('/[locale]/partners/[id]', 'page');
  return { status: 'done' };
}
