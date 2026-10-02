'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@lib/auth-guard';
import type { Locale } from 'next-intl';
import {
  createPartnerMembershipServices,
  type PartnerRole,
} from '@findeg/backend/features/partner-membership';
import { toStaffActor } from '../_lib/toStaffActor';

export interface InvitationActionState {
  status: 'idle' | 'done' | 'error';
  message?: string;
  /** Invitation link to copy, present after invite and resend. Shown once; the token is not stored. */
  link?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: 'You do not have permission to manage Business Partners.',
  'invalid-input': 'Enter a valid email address and choose at least one role.',
  'not-found': 'This Business Partner or invitation no longer exists.',
  'partner-not-open':
    'Invitations can only change while the Business Partner is onboarding or active.',
  'invitation-not-pending': 'This invitation is no longer pending.',
};

const fail = (error: string): InvitationActionState => ({
  status: 'error',
  message: ERROR_MESSAGES[error] ?? error,
});

function linkFor(locale: string, token: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
  return `${base}/${locale}/partner/invitations/${token}`;
}

const refresh = () => revalidatePath('/[locale]/partners/[id]', 'page');

export async function inviteAction(
  locale: Locale,
  partnerId: number,
  _previous: InvitationActionState,
  formData: FormData,
): Promise<InvitationActionState> {
  const actor = toStaffActor(await requireAdmin(locale));
  const { invitations } = createPartnerMembershipServices();
  const result = await invitations.invite(actor, partnerId, {
    email: String(formData.get('email') ?? ''),
    roles: formData.getAll('roles').map(String) as PartnerRole[],
  });
  if (!result.success) return fail(result.error);
  refresh();
  return { status: 'done', link: linkFor(locale, result.data.token) };
}

export async function resendInvitationAction(
  locale: Locale,
  invitationId: number,
): Promise<InvitationActionState> {
  const actor = toStaffActor(await requireAdmin(locale));
  const { invitations } = createPartnerMembershipServices();
  const result = await invitations.resendInvitation(actor, invitationId);
  if (!result.success) return fail(result.error);
  refresh();
  return { status: 'done', link: linkFor(locale, result.data.token) };
}

export async function revokeInvitationAction(
  locale: Locale,
  invitationId: number,
): Promise<InvitationActionState> {
  const actor = toStaffActor(await requireAdmin(locale));
  const { invitations } = createPartnerMembershipServices();
  const result = await invitations.revokeInvitation(actor, invitationId);
  if (!result.success) return fail(result.error);
  refresh();
  return { status: 'done' };
}
