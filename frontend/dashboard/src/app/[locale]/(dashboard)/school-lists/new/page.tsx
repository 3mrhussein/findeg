import { Link } from '@i18n/navigation';
import type { Locale } from '@findeg/domain';
import { getTranslations } from 'next-intl/server';
import { requirePermission } from '@lib/auth-guard';
import { PERMISSION_CODES } from '@findeg/identity/types';
import { getSchoolListPartnerOptions } from '@data/school-lists/queries';
import { NewDraftForm } from '../_components/NewDraftForm';

export const metadata = {
  title: 'New School Supply List Draft - FindEg Admins',
};

export default async function NewSchoolSupplyListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SchoolLists' });
  const session = await requirePermission(locale as Locale, {
    any: [PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE],
  });

  const partnersRes = await getSchoolListPartnerOptions(session);
  const partners = partnersRes.success ? partnersRes.data : [];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/school-lists"
          className="text-sm text-primary hover:underline"
          data-testid="back-to-lists-link"
        >
          {t('BackToLists')}
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{t('CreateDraftTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('CreateDraftSubtitle')}</p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <NewDraftForm partners={partners} locale={locale} />
      </div>
    </div>
  );
}
