import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@findeg/ui';
import { getCachedPartnerContext } from '@data/partner/queries';
import { notFound } from 'next/navigation';

/**
 * Partner Workspace layout. Every page below it is gated here by the one partner
 * access check: non-members and ended members get the normal not-found page and
 * suspended members get an "access suspended" page. Per-page rules for the
 * Business Partner's status go through `requirePartnerRole`.
 */
export default function PartnerWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; code: string }>;
}) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl p-8">Loading workspace…</main>}>
      <WorkspaceGate params={params}>{children}</WorkspaceGate>
    </Suspense>
  );
}

async function WorkspaceGate({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; code: string }>;
}) {
  const { code } = await params;
  const context = await getCachedPartnerContext(code);

  if (!context.success) {
    if (context.error === 'suspended') return <AccessSuspended />;
    notFound();
  }

  const { partner } = context.data;
  return (
    <>
      {partner.status === 'suspended' ? (
        <p role="status" className="bg-muted px-6 py-3 text-center text-sm">
          This Business Partner is suspended. Its workspace is read-only.
        </p>
      ) : null}
      {children}
    </>
  );
}

function AccessSuspended() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Access suspended</CardTitle>
          <CardDescription>Your access to this Partner Workspace is suspended.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Contact an administrator of this Business Partner to restore your access.
        </CardContent>
      </Card>
    </main>
  );
}
