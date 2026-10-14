import { CollectionForm } from '../_components/CollectionForm';
import { Metadata } from 'next';
import { PERMISSION_CODES } from '@findeg/identity/types';
import { requirePermission } from '@lib/auth-guard';
import type { Locale } from '@findeg/domain';

import { getAllTags } from '@data/tags/queries';

export const metadata: Metadata = {
  title: 'New Collection | FindEg Admin',
};

/**
 *
 */
export default async function NewCollectionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requirePermission(locale as Locale, {
    permission: PERMISSION_CODES.ADMIN_COLLECTIONS_WRITE,
  });
  const availableTags = await getAllTags();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <CollectionForm availableTags={availableTags} />
    </div>
  );
}
