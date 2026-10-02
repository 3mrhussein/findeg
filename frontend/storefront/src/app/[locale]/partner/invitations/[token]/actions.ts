'use server';

import { createPartnerMembershipServices } from '@findeg/backend/features/partner-membership';
import { deleteSession, getSession } from '@lib/session';
import { redirect } from 'next/navigation';

const invitationPath = (locale: string, token: string) =>
  `/${locale === 'ar' ? 'ar' : 'en'}/partner/invitations/${encodeURIComponent(token)}`;

export async function acceptInvitationAction(locale: string, token: string): Promise<never> {
  const session = await getSession();
  const result = await createPartnerMembershipServices().memberships.acceptInvitation(
    token,
    session ? { userId: session.userId, user: { email: session.user.email } } : null,
  );

  if (result.success) {
    redirect(`/${locale === 'ar' ? 'ar' : 'en'}/partner/${result.data.partner.code}`);
  }
  redirect(`${invitationPath(locale, token)}?error=${encodeURIComponent(result.error)}`);
}

export async function switchAccountAction(
  locale: string,
  token: string,
  email: string,
): Promise<never> {
  await deleteSession();
  const returnTo = `/partner/invitations/${encodeURIComponent(token)}`;
  const query = new URLSearchParams({ email, locked: '1', returnTo });
  redirect(`/${locale === 'ar' ? 'ar' : 'en'}/login?${query.toString()}`);
}
