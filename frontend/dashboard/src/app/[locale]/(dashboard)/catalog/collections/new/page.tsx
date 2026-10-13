import { CollectionForm } from '../_components/CollectionForm';
import { Metadata } from 'next';
import { PERMISSION_CODES } from '@findeg/backend/features/core/schemas';
import { requirePermission } from '@lib/auth-guard';
import type { Locale } from '@findeg/domain';

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
  // TODO: Replace with data layer query from @data/tags/queries
  const availableTags: import('@findeg/backend/features/catalog').Tag[] = []; // Stubbed - empty tags list

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <CollectionForm availableTags={availableTags} />
    </div>
  );
}
