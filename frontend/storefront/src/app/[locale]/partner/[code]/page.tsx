import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@findeg/ui';
import { getCachedPartnerContext } from '@data/partner/queries';
import { notFound } from 'next/navigation';

export default async function PartnerWorkspacePage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { code } = await params;
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl p-8">Loading workspace…</main>}>
      <PartnerWorkspace code={code} />
    </Suspense>
  );
}

async function PartnerWorkspace({ code }: { code: string }) {
  const context = await getCachedPartnerContext(code);
  if (!context.success) notFound();

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
        </CardContent>
      </Card>
    </main>
  );
}
