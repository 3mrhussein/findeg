import { Suspense } from 'react';
import { getInvitationByToken } from '@data/partner/queries';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@findeg/ui';
import { getCachedSession } from '@data/auth/queries';
import { Link } from '@i18n/navigation';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { acceptInvitationAction, switchAccountAction } from './actions';

type PageProps = {
  params: Promise<{ locale: string; token: string }>;
  searchParams: Promise<{ error?: string }>;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export default async function InvitationPage({ params, searchParams }: PageProps) {
  const { locale, token } = await params;
  const t = await getTranslations({ locale, namespace: 'PartnerWorkspace' });
  return (
    <Suspense fallback={<main className="mx-auto max-w-xl p-8">{t('LoadingInvitation')}</main>}>
      <InvitationContent locale={locale} token={token} searchParams={searchParams} />
    </Suspense>
  );
}

async function InvitationContent({
  locale,
  token,
  searchParams,
}: {
  locale: string;
  token: string;
  searchParams: PageProps['searchParams'];
}) {
  const [viewResult, session, query, t] = await Promise.all([
    getInvitationByToken(token),
    getCachedSession(),
    searchParams,
    getTranslations({ locale, namespace: 'PartnerWorkspace' }),
  ]);
  if (!viewResult.success) {
    if (viewResult.error === 'not-found') notFound();
    throw new Error(viewResult.error);
  }
  const invitation = viewResult.data;
  const returnTo = `/partner/invitations/${encodeURIComponent(token)}`;
  const authQuery = { email: invitation.email, locked: '1', returnTo };

  const partnerName = locale === 'ar' ? invitation.partner.nameAr : invitation.partner.nameEn;
  const partnerAlt = locale === 'ar' ? invitation.partner.nameEn : invitation.partner.nameAr;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('InvitationTo', { partner: partnerName })}</CardTitle>
          <CardDescription>{partnerAlt}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-sm font-medium">{t('YourRoles')}</p>
            <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
              {invitation.roles.map((role) => (
                <li key={role}>
                  {t(`Roles.${role}`)} ({role})
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('InvitationExpires', {
              date: invitation.expiresAt.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-GB'),
            })}
          </p>

          {invitation.state !== 'pending' ? (
            <InvitationState locale={locale} state={invitation.state} />
          ) : !session ? (
            <div className="space-y-3">
              <p>{t('InvitationAuthPrompt', { email: invitation.email })}</p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href={{ pathname: '/login', query: authQuery }}>
                    {t('InvitationSignIn')}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={{ pathname: '/registration', query: authQuery }}>
                    {t('InvitationRegister')}
                  </Link>
                </Button>
              </div>
            </div>
          ) : normalizeEmail(session.user.email) !== invitation.email ? (
            <div className="space-y-3">
              <p>
                {t('InvitationEmailMismatch', {
                  signedEmail: session.user.email,
                  invitedEmail: invitation.email,
                })}
              </p>
              <form action={switchAccountAction.bind(null, locale, token, invitation.email)}>
                <Button type="submit" variant="outline">
                  {t('SwitchAccount')}
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              <p>{t('AcceptingConfirms', { email: invitation.email })}</p>
              {query.error ? (
                <p className="text-sm text-destructive" role="alert">
                  {t(`InvitationErrors.${query.error}`) ?? t('InvitationErrors.generic')}
                </p>
              ) : null}
              <form action={acceptInvitationAction.bind(null, locale, token)}>
                <Button type="submit">{t('AcceptInvitation')}</Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

async function InvitationState({
  locale,
  state,
}: {
  locale: string;
  state: 'expired' | 'accepted' | 'revoked';
}) {
  const t = await getTranslations({ locale, namespace: 'PartnerWorkspace' });
  return <p role="status">{t(`InvitationStates.${state}`)}</p>;
}
