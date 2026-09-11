import type { ReactNode } from 'react';
import { requirePortal } from '../../../../server/session';
export default async function ProtectedLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const result = await requirePortal('partner', locale);
  if (result.status === 'authorization-denied')
    return (
      <p role="alert">
        {locale === 'ar'
          ? 'ليس لديك صلاحية الوصول إلى هذه البوابة.'
          : 'You do not have access to this portal.'}
      </p>
    );
  return children;
}
