import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@findeg/ui';
import { notFound } from 'next/navigation';
import type { PartnerAction, PartnerContext, PartnerRole } from '@findeg/partners';
import { getCachedPartnerContext } from '@data/partner/queries';
import { decidePartnerPageAccess } from '@data/partner/access';

/** Suspense boundary every Partner page needs because it reads the session. */
export function PartnerSuspense({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={label ? <main className="mx-auto max-w-3xl p-8">{label}</main> : null}>
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

import { getLocale, getTranslations } from 'next-intl/server';

export async function AccessSuspendedNotice({ locale }: { locale?: string }) {
  const loc = locale ?? (await getLocale().catch(() => 'en'));
  const t = await getTranslations({ locale: loc, namespace: 'PartnerWorkspace' });
  return (
    <PartnerNotice
      centered
      title={t('AccessSuspendedTitle')}
      description={t('AccessSuspendedDesc')}
    >
      {t('AccessSuspendedContact')}
    </PartnerNotice>
  );
}

export type WorkspaceAccess =
  { allowed: true; context: PartnerContext } | { allowed: false; notice: React.ReactNode };

/**
 * The access check every Partner Workspace page calls first: resolves the
 * context for this request, applies `memberships.requireRole`, and returns either the
 * context or the notice the page must render. Unknown and ended members get the
 * normal not-found page.
 */
export async function requireWorkspaceAccess(
  code: string,
  roles: readonly PartnerRole[] | 'any',
  action: PartnerAction,
  locale?: string,
): Promise<WorkspaceAccess> {
  const access = decidePartnerPageAccess(await getCachedPartnerContext(code), roles, action);
  if (access.kind === 'allowed') return { allowed: true, context: access.context };
  if (access.kind === 'not-found') notFound();
  const loc = locale ?? (await getLocale().catch(() => 'en'));
  if (access.kind === 'suspended')
    return { allowed: false, notice: await AccessSuspendedNotice({ locale: loc }) };

  const t = await getTranslations({ locale: loc, namespace: 'PartnerWorkspace' });
  const { partner } = access.context;
  const isAr = loc === 'ar';
  const partnerName = isAr ? partner.nameAr : partner.nameEn;
  const partnerAlt = isAr ? partner.nameEn : partner.nameAr;

  if (access.reason === 'role-not-held') {
    return {
      allowed: false,
      notice: (
        <PartnerNotice title={t('NotPermittedTitle')} description={partnerName}>
          {t('NotPermittedDesc')}
        </PartnerNotice>
      ),
    };
  }
  return {
    allowed: false,
    notice: (
      <PartnerNotice title={partnerName} description={partnerAlt}>
        {partner.status === 'closed'
          ? t('ClosedNotice')
          : t('UnavailableStatusNotice', { status: partner.status })}
      </PartnerNotice>
    ),
  };
}
