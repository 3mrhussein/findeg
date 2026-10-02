import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@findeg/ui';
import { getCachedActivePartnerMemberships } from '@data/partner/queries';
import { requireAuth } from '@lib/auth-guard';
import { Link, redirect } from '@i18n/navigation';

export default async function PartnerIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl p-8">Loading workspaces…</main>}>
      <PartnerIndex params={params} />
    </Suspense>
  );
}

async function PartnerIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireAuth(locale);
  const memberships = await getCachedActivePartnerMemberships();

  if (memberships.length === 1) {
    redirect({ href: `/partner/${memberships[0].partner.code}`, locale });
  }

  return (
    <main className="mx-auto min-h-[70vh] max-w-3xl p-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Your Partner Workspaces</CardTitle>
          <CardDescription>Choose the Business Partner you want to work in.</CardDescription>
        </CardHeader>
        <CardContent>
          {memberships.length === 0 ? (
            <p className="text-muted-foreground">
              You are not an active member of any Business Partner.
            </p>
          ) : (
            <ul className="divide-y">
              {memberships.map(({ partner }) => (
                <li key={partner.code}>
                  <Link
                    href={`/partner/${partner.code}`}
                    className="flex flex-col py-3 hover:text-primary"
                  >
                    <span className="font-medium">{partner.nameEn}</span>
                    <span className="text-sm text-muted-foreground">{partner.nameAr}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
