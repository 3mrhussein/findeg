'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { requireStaffAction } from '@lib/auth-guard';
import { PERMISSION_CODES } from '@findeg/identity/types';
import type { Locale } from '@findeg/domain';
import { createPartnerMembershipServices, type PartnerRole } from '@findeg/partners';
import { createInvitationServices, drainOutboxAfterResponse } from '../_lib/invitationServices';
import { toStaffActor } from '../_lib/toStaffActor';

export interface InvitationActionState {
  status: 'idle' | 'done' | 'error';
  message?: string;
  /** Invitation link to copy, present after invite and resend. Shown once; the token is not stored. */
  link?: string;
}

const fail = (error: string): InvitationActionState => ({
  status: 'error',
  message: error,
});

function linkFor(locale: string, token: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
  return `${base}/${locale}/partner/invitations/${token}`;
}

const refresh = () => {
  revalidatePath('/[locale]/partners/[id]', 'page');
  updateTag('partners');
};

export async function inviteAction(
  locale: Locale,
  partnerId: number,
  _previous: InvitationActionState,
  formData: FormData,
): Promise<InvitationActionState> {
  try {
    const session = await requireStaffAction(
      PERMISSION_CODES.PARTNERS_MANAGE,
      'invite partner member',
    );
    const actor = toStaffActor(session);
    const invitations = createInvitationServices();
    const result = await invitations.invite(actor, partnerId, {
      email: String(formData.get('email') ?? ''),
      roles: formData.getAll('roles').map(String) as PartnerRole[],
    });
    if (!result.success) return fail(result.error);
    drainOutboxAfterResponse();
    refresh();
    return { status: 'done', link: linkFor(locale, result.data.token) };
  } catch {
    return fail('forbidden');
  }
}

export async function resendInvitationAction(
  locale: Locale,
  invitationId: number,
): Promise<InvitationActionState> {
  try {
    const session = await requireStaffAction(
      PERMISSION_CODES.PARTNERS_MANAGE,
      'resend partner invitation',
    );
    const actor = toStaffActor(session);
    const invitations = createInvitationServices();
    const result = await invitations.resendInvitation(actor, invitationId);
    if (!result.success) return fail(result.error);
    drainOutboxAfterResponse();
    refresh();
    return { status: 'done', link: linkFor(locale, result.data.token) };
  } catch {
    return fail('forbidden');
  }
}

export async function revokeInvitationAction(
  locale: Locale,
  invitationId: number,
): Promise<InvitationActionState> {
  try {
    const session = await requireStaffAction(
      PERMISSION_CODES.PARTNERS_MANAGE,
      'revoke partner invitation',
    );
    const actor = toStaffActor(session);
    const { invitations } = createPartnerMembershipServices();
    const result = await invitations.revokeInvitation(actor, invitationId);
    if (!result.success) return fail(result.error);
    refresh();
    return { status: 'done' };
  } catch {
    return fail('forbidden');
  }
}
