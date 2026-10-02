'use server';

import { revalidatePath } from 'next/cache';
import {
  createPartnerMembershipServices,
  type PartnerRole,
} from '@findeg/backend/features/partner-membership';
import { resolvePartnerAccess } from '../_lib/access';
import type { ActionState } from '../_lib/roles';

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: 'You do not have permission to manage invitations.',
  'invalid-input': 'Enter a valid email address and choose at least one role.',
  'not-found': 'This invitation no longer exists.',
  'partner-not-open':
    'Invitations can only change while the Business Partner is onboarding or active.',
  'invitation-not-pending': 'This invitation is no longer pending.',
  'already-member': 'This person is already a member of this Business Partner.',
};

const fail = (error: string): ActionState => ({
  status: 'error',
  message: ERROR_MESSAGES[error] ?? error,
});

function linkFor(locale: string, token: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
  return `${base}/${locale === 'ar' ? 'ar' : 'en'}/partner/invitations/${token}`;
}

const refresh = () => revalidatePath('/[locale]/partner/[code]/invitations', 'page');

export async function inviteAction(
  locale: string,
  code: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await resolvePartnerAccess(code);
  if (!access) return fail('forbidden');
  const result = await createPartnerMembershipServices().invitations.invite(
    access.actor,
    access.context.partner.id,
    {
      email: String(formData.get('email') ?? ''),
      roles: formData.getAll('roles').map(String) as PartnerRole[],
    },
  );
  if (!result.success) return fail(result.error);
  refresh();
  return { status: 'done', link: linkFor(locale, result.data.token) };
}

export async function resendInvitationAction(
  locale: string,
  code: string,
  invitationId: number,
): Promise<ActionState> {
  const access = await resolvePartnerAccess(code);
  if (!access) return fail('forbidden');
  const result = await createPartnerMembershipServices().invitations.resendInvitation(
    access.actor,
    invitationId,
  );
  if (!result.success) return fail(result.error);
  refresh();
  return { status: 'done', link: linkFor(locale, result.data.token) };
}

export async function revokeInvitationAction(
  code: string,
  invitationId: number,
): Promise<ActionState> {
  const access = await resolvePartnerAccess(code);
  if (!access) return fail('forbidden');
  const result = await createPartnerMembershipServices().invitations.revokeInvitation(
    access.actor,
    invitationId,
  );
  if (!result.success) return fail(result.error);
  refresh();
  return { status: 'done' };
}
