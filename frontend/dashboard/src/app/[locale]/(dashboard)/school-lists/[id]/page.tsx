import { notFound } from 'next/navigation';
import { Link } from '@i18n/navigation';
import { Badge } from '@findeg/ui';
import type { Locale, SupplyListStatus } from '@findeg/domain';
import { getTranslations } from 'next-intl/server';
import { requirePermission, sessionHasPermission } from '@lib/auth-guard';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import { getSchoolSupplyListById, getSchoolSupplyListOffer } from '@data/school-lists/queries';
import { getPartner } from '@data/partners/queries';
import { getCategories } from '@data/categories/queries';
import { OfferForm } from '../_components/OfferForm';
import { ItemsEditor } from '../_components/ItemsEditor';
import { ListLifecycleActions } from '../_components/ListLifecycleActions';
import { toUtcInputValue } from '../_lib/offerForm';

export const metadata = {
  title: 'School Supply List - FindEg Admins',
};

export default async function SchoolSupplyListPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'SchoolLists' });
  const session = await requirePermission(locale as Locale, {
    any: [PERMISSION_CODES.ADMIN_SCHOOL_LISTS_READ, PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE],
  });

  if (!/^\d+$/.test(id)) notFound();
  const listId = Number(id);
  const canEdit = sessionHasPermission(session, PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE);

  const list = await getSchoolSupplyListById(session, listId);
  if (!list.success) notFound();

  const partnerRes = await getPartner(session, list.data.businessPartnerId);
  const partner = partnerRes.success ? partnerRes.data : null;

  const categoriesRes = await getCategories(locale as Locale);
  const categories = Array.isArray(categoriesRes) ? categoriesRes : [];

  const offer = await getSchoolSupplyListOffer(session, listId);
  const current = offer.success ? offer.data : null;

  const isPartnerClosed = partner?.status === 'closed';
  const isIncompleteDraft =
    list.data.status === 'draft' && list.data.items.some((i) => i.variantId === null);

  const getStatusBadge = (s: SupplyListStatus) => {
    switch (s) {
      case 'published':
        return <Badge variant="default">{t('StatusPublished')}</Badge>;
      case 'draft':
        return <Badge variant="secondary">{t('StatusDraft')}</Badge>;
      case 'archived':
        return <Badge variant="outline">{t('StatusArchived')}</Badge>;
    }
  };

  const title =
    (locale === 'ar' ? list.data.localizedTitle.ar : list.data.localizedTitle.en) ||
    list.data.localizedTitle.en ||
    list.data.localizedTitle.ar ||
    `#${list.data.id}`;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/school-lists"
            className="text-primary hover:underline"
            data-testid="back-to-lists-link"
          >
            {t('BackToLists')}
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link
            href={`/partners/${list.data.businessPartnerId}`}
            className="text-primary hover:underline"
            data-testid="back-to-partner-link"
          >
            {t('BackToPartner')}
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="mt-2 text-3xl font-bold tracking-tight" data-testid="list-title">
              {title}
            </h1>

            <div className="text-muted-foreground mt-2 flex items-center gap-2">
              <span>
                {list.data.grade} · {list.data.academicYear}
              </span>
              {getStatusBadge(list.data.status)}
            </div>

            {list.data.replacesListId && (
              <div className="text-sm text-muted-foreground" data-testid="replaces-list-notice">
                {t('Replaces', { id: list.data.replacesListId })}
              </div>
            )}
            {list.data.replacedById && (
              <div
                className="text-sm text-amber-700 dark:text-amber-300"
                data-testid="replaced-by-list-notice"
              >
                {t('ReplacedBy', { id: list.data.replacedById })}
              </div>
            )}
          </div>

          <ListLifecycleActions
            listId={listId}
            status={list.data.status}
            partnerStatus={partner?.status ?? ''}
            canEdit={canEdit}
          />
        </div>
      </div>

      {isPartnerClosed && (
        <div
          className="rounded-md bg-destructive/15 p-4 text-sm text-destructive"
          data-testid="partner-closed-notice"
        >
          {t('PartnerClosedNotice')}
        </div>
      )}

      {isIncompleteDraft && (
        <div
          className="rounded-md bg-amber-500/15 p-4 text-sm text-amber-800 dark:text-amber-200"
          data-testid="incomplete-draft-notice"
        >
          {t('IncompleteDraftNotice')}
        </div>
      )}

      <ItemsEditor
        listId={listId}
        status={list.data.status}
        partnerStatus={partner?.status ?? ''}
        canEdit={canEdit}
        items={list.data.items}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        locale={locale}
      />

      <section className="space-y-3 pt-6 border-t">
        <h2 className="text-xl font-semibold">{t('ListOffer')}</h2>
        <p className="text-muted-foreground text-sm">{t('ListOfferHelp')}</p>
        <OfferForm
          listId={listId}
          canEdit={canEdit}
          offer={
            current
              ? {
                  percent: String(current.basisPoints / 100),
                  startsAt: toUtcInputValue(current.startsAt),
                  endsAt: toUtcInputValue(current.endsAt),
                }
              : null
          }
        />
      </section>
    </div>
  );
}
