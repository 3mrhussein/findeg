import { notFound } from 'next/navigation';
import { Link } from '@i18n/navigation';
import { Badge } from '@findeg/ui';
import type { Locale } from 'next-intl';
import { requirePermission } from '@lib/auth-guard';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import { canWriteSupplyLists } from '@findeg/backend/features/school';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import { OfferForm } from '../_components/OfferForm';
import { toListActor } from '../_lib/toListActor';
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
  const session = await requirePermission(locale as Locale, {
    any: [PERMISSION_CODES.ADMIN_SCHOOL_LISTS_READ, PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE],
  });

  if (!/^\d+$/.test(id)) notFound();
  const listId = Number(id);
  const actor = toListActor(session);
  const { schoolSupplyLists } = createAdministrationServices();

  const list = await schoolSupplyLists.getById(actor, listId);
  if (!list.success) notFound();
  const offer = await schoolSupplyLists.getOffer(actor, listId);
  const current = offer.success ? offer.data : null;

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/partners/${list.data.businessPartnerId}`} className="text-sm underline">
          Back to Business Partner
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {list.data.localizedTitle.en ?? list.data.localizedTitle.ar ?? `List ${list.data.id}`}
        </h1>
        <p className="text-muted-foreground mt-2 flex items-center gap-2">
          <span>
            {list.data.grade} · {list.data.academicYear}
          </span>
          <Badge variant="outline">{list.data.status}</Badge>
        </p>
      </div>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">List Offer</h2>
        <p className="text-muted-foreground text-sm">
          A percentage off every line of this list at checkout. Changing it does not republish the
          list; a replacement list copies the offer when it is published.
        </p>
        <OfferForm
          listId={listId}
          canEdit={canWriteSupplyLists(actor)}
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
