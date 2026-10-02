import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@findeg/ui';
import { notFound } from 'next/navigation';
import type {
  PartnerAction,
  PartnerContext,
  PartnerRole,
} from '@findeg/backend/features/partner-membership';
import { getCachedPartnerContext } from '@data/partner/queries';
import { decidePartnerPageAccess } from '@data/partner/access';

/** Suspense boundary every Partner page needs because it reads the session. */
export function PartnerSuspense({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl p-8">{label}</main>}>
      {children}
    </Suspense>
  );
}

/** The centered card used for notices and lists across the Partner pages. */
export function PartnerNotice({
  title,
  description,
  children,
  centered = false,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <main
      className={
        centered
          ? 'mx-auto flex min-h-[70vh] max-w-xl items-center p-6'
          : 'mx-auto min-h-[70vh] max-w-3xl p-6 py-12'
      }
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        {children ? <CardContent className="text-muted-foreground">{children}</CardContent> : null}
      </Card>
    </main>
  );
}

export function AccessSuspendedNotice() {
  return (
    <PartnerNotice
      centered
      title="Access suspended"
      description="Your access to this Partner Workspace is suspended."
    >
      Contact an administrator of this Business Partner to restore your access.
    </PartnerNotice>
  );
}

export type WorkspaceAccess =
  { allowed: true; context: PartnerContext } | { allowed: false; notice: React.ReactNode };

/**
 * The access check every Partner Workspace page calls first: resolves the
 * context for this request, applies `requirePartnerRole`, and returns either the
 * context or the notice the page must render. Unknown and ended members get the
 * normal not-found page.
 */
export async function requireWorkspaceAccess(
  code: string,
  roles: readonly PartnerRole[] | 'any',
  action: PartnerAction,
): Promise<WorkspaceAccess> {
  const access = decidePartnerPageAccess(await getCachedPartnerContext(code), roles, action);
  if (access.kind === 'allowed') return { allowed: true, context: access.context };
  if (access.kind === 'not-found') notFound();
  if (access.kind === 'suspended') return { allowed: false, notice: <AccessSuspendedNotice /> };

  const { partner } = access.context;
  if (access.reason === 'role-not-held') {
    return {
      allowed: false,
      notice: (
        <PartnerNotice title="Not permitted" description={partner.nameEn}>
          Your Partner Roles do not allow you to open this page.
        </PartnerNotice>
      ),
    };
  }
  return {
    allowed: false,
    notice: (
      <PartnerNotice title={partner.nameEn} description={partner.nameAr}>
        {partner.status === 'closed'
          ? 'This Business Partner is closed. Only its Partner Reports remain available.'
          : `This is not available while the Business Partner is ${partner.status}.`}
      </PartnerNotice>
    ),
  };
}
