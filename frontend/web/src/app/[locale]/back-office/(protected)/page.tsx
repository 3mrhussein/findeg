import Link from 'next/link';
import { CatalogManager } from './CatalogManager';
import { requirePortal } from '../../../../server/session';

export default async function PortalHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await requirePortal('back-office', locale);
  const canManageCatalog =
    session.status === 'authenticated' && session.session.permissions.includes('catalog.manage');

  return (
    <div>
      <nav style={{ marginBottom: '1.5rem' }}>
        <Link href={`/${locale}/back-office/partners`}>
          {locale === 'ar' ? 'إدارة الشركاء' : 'Manage partners'}
        </Link>
      </nav>
      {canManageCatalog ? (
        <CatalogManager locale={locale === 'ar' ? 'ar' : 'en'} />
      ) : (
        <p role="alert">
          {locale === 'ar' ? 'ليس لديك صلاحية إدارة الكتالوج.' : 'You cannot manage the catalog.'}
        </p>
      )}
    </div>
  );
}
