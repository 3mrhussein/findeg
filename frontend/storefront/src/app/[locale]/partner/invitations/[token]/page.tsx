import { Suspense } from 'react';
import { createPartnerMembershipServices } from '@findeg/backend/features/partner-membership';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@findeg/ui';
import { getCachedSession } from '@data/auth/queries';
import { Link } from '@i18n/navigation';
import { notFound } from 'next/navigation';
import { acceptInvitationAction, switchAccountAction } from './actions';

type PageProps = {
  params: Promise<{ locale: string; token: string }>;
  searchParams: Promise<{ error?: string }>;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const errorMessages: Record<string, string> = {
  'not-authenticated': 'Please sign in before accepting this invitation.',
  'email-mismatch': 'This invitation belongs to a different email address.',
  'invitation-not-pending': 'This invitation is no longer available.',
  'invitation-expired': 'This invitation has expired. Ask the Business Partner for a new one.',
  'partner-not-open': 'This Business Partner is not currently accepting members.',
  'already-member': 'You already have a current membership for this Business Partner.',
  'not-found': 'This invitation could not be found.',
};

export default async function InvitationPage({ params, searchParams }: PageProps) {
  const { locale, token } = await params;
  return (
    <Suspense fallback={<main className="mx-auto max-w-xl p-8">Loading invitation…</main>}>
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
  const [viewResult, session, query] = await Promise.all([
    createPartnerMembershipServices().invitations.getInvitation(token),
    getCachedSession(),
    searchParams,
  ]);
  if (!viewResult.success) notFound();
  const invitation = viewResult.data;
  const returnTo = `/partner/invitations/${encodeURIComponent(token)}`;
  const authQuery = { email: invitation.email, locked: '1', returnTo };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Invitation to {invitation.partner.nameEn}</CardTitle>
          <CardDescription>{invitation.partner.nameAr}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-sm font-medium">Partner Roles</p>
            <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
              {invitation.roles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            Expires {invitation.expiresAt.toLocaleDateString(locale)}
          </p>

          {invitation.state !== 'pending' ? (
            <InvitationState state={invitation.state} />
          ) : !session ? (
            <div className="space-y-3">
              <p>Sign in or create an account with {invitation.email} to continue.</p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href={{ pathname: '/login', query: authQuery }}>Sign in</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={{ pathname: '/registration', query: authQuery }}>Register</Link>
                </Button>
              </div>
            </div>
          ) : normalizeEmail(session.user.email) !== invitation.email ? (
            <div className="space-y-3">
              <p>
                You are signed in as {session.user.email}, but this invitation is for{' '}
                {invitation.email}.
              </p>
              <form action={switchAccountAction.bind(null, locale, token, invitation.email)}>
                <Button type="submit" variant="outline">
                  Switch account
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              <p>Accepting confirms that you control {invitation.email}.</p>
              {query.error ? (
                <p className="text-sm text-destructive" role="alert">
                  {errorMessages[query.error] ?? 'The invitation could not be accepted.'}
                </p>
              ) : null}
              <form action={acceptInvitationAction.bind(null, locale, token)}>
                <Button type="submit">Accept invitation</Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function InvitationState({ state }: { state: 'expired' | 'accepted' | 'revoked' }) {
  const messages = {
    expired: 'This invitation has expired. Ask the Business Partner for a new invitation.',
    accepted: 'This invitation has already been accepted.',
    revoked: 'This invitation was revoked. Ask the Business Partner for a new invitation.',
  };
  return <p role="status">{messages[state]}</p>;
}
