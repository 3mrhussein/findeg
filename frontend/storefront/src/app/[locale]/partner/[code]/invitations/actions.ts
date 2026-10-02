'use server';

import { revalidatePath } from 'next/cache';
import env from '@findeg/env';
import {
  createPartnerMembershipServices,
  PARTNER_ADMINISTRATOR,
  type InviteError,
  type PartnerRole,
  type ResendError,
  type RevokeError,
} from '@findeg/backend/features/partner-membership';
import { actionError, type ActionState } from '../_lib/action-state';
import { resolvePartnerAccess, type PartnerAccess } from '../_lib/access';

type InvitationError = InviteError | ResendError | RevokeError;

const ERROR_MESSAGES: Record<InvitationError, string> = {
  forbidden: 'You do not have permission to manage invitations.',
  'invalid-input': 'Enter a valid email address and choose at least one role.',
  'not-found': 'This invitation no longer exists.',
  'partner-not-open':
    'Invitations can only change while the Business Partner is onboarding or active.',
  'invitation-not-pending': 'This invitation is no longer pending.',
  'already-member': 'This person is already a member of this Business Partner.',
};

const fail = (error: InvitationError) => actionError(ERROR_MESSAGES, error);

/** `en` or `ar`: anything else falls back to `en`, so a crafted locale never reaches a path. */
const normalizeLocale = (locale: string) => (locale === 'ar' ? 'ar' : 'en');

// Until the Outbox delivers invitation emails, Partner Administrators share the link themselves.
function linkFor(locale: string, token: string): string {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  return `${base}/${normalizeLocale(locale)}/partner/invitations/${encodeURIComponent(token)}`;
}

const refresh = () => revalidatePath('/[locale]/partner/[code]/invitations', 'page');

const resolveAdministrator = (code: string) =>
  resolvePartnerAccess(code, { roles: [PARTNER_ADMINISTRATOR], action: 'membership-change' });

// The service authorizes against the invitation's own partner, so tie the id to the workspace
// `code` the administrator is acting in: an administrator of two partners cannot act on one
// partner's invitation from the other's page. Another partner's invitation reads as not pending.
async function isPendingInvitationOf(access: PartnerAccess, invitationId: number) {
  const pending = await createPartnerMembershipServices().invitations.listPendingInvitations(
    access.actor,
    access.context.partner.id,
  );
  return pending.success && pending.data.some((invitation) => invitation.id === invitationId);
}

// Resolves the administrator and checks the invitation belongs to this workspace's partner.
async function authorizeInvitation(code: string, invitationId: number) {
  const access = await resolveAdministrator(code);
  if (!access) return fail('forbidden');
  if (!(await isPendingInvitationOf(access, invitationId))) return fail('invitation-not-pending');
  return access;
}

export async function inviteAction(
  locale: string,
  code: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await resolveAdministrator(code);
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
  const access = await authorizeInvitation(code, invitationId);
  if ('status' in access) return access;
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
  const access = await authorizeInvitation(code, invitationId);
  if ('status' in access) return access;
  const result = await createPartnerMembershipServices().invitations.revokeInvitation(
    access.actor,
    invitationId,
  );
  if (!result.success) return fail(result.error);
  refresh();
  return { status: 'done' };
}
