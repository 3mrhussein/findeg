import { Suspense } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@findeg/ui';
import { getCachedPartnerContext } from '@data/partner/queries';
import { Link } from '@i18n/navigation';
import { notFound } from 'next/navigation';
import { LeaveButton } from './LeaveButton';

export default async function PartnerWorkspacePage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl p-8">Loading workspace…</main>}>
      <PartnerWorkspace locale={locale} code={code} />
    </Suspense>
  );
}

async function PartnerWorkspace({ locale, code }: { locale: string; code: string }) {
  const context = await getCachedPartnerContext(code);
  if (!context.success) notFound();
  const isAdministrator = context.data.membership.roles.includes('partner-administrator');

  return (
    <main className="mx-auto min-h-[70vh] max-w-3xl p-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>{context.data.partner.nameEn}</CardTitle>
          <CardDescription>{context.data.partner.nameAr}</CardDescription>
        </CardHeader>
        <CardContent>
          <h2 className="font-semibold">Your Partner Roles</h2>
          <ul className="mt-3 list-inside list-disc text-muted-foreground">
            {context.data.membership.roles.map((role) => (
              <li key={role}>{role}</li>
            ))}
          </ul>
          {isAdministrator && (
            <nav className="mt-6 flex gap-3">
              <Button asChild variant="outline">
                <Link href={`/partner/${code}/members`}>Members</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/partner/${code}/invitations`}>Invitations</Link>
              </Button>
            </nav>
          )}
          <div className="mt-6">
            <LeaveButton locale={locale} code={code} membershipId={context.data.membership.id} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
