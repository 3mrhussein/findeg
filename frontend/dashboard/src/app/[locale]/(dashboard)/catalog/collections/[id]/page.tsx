import { CollectionForm } from '../_components/CollectionForm';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PERMISSION_CODES } from '@findeg/backend/features/core/schemas';
import { requirePermission } from '@lib/auth-guard';
import type { Locale } from '@findeg/domain';

interface CollectionEditPageProps {
  params: Promise<{ locale: string; id: string }>;
}

/**
 *
 */
export async function generateMetadata({ params }: CollectionEditPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit Collection #${id} | FindEg Admin`,
  };
}

/**
 *
 */
import { getCollectionById } from '@data/collections/queries';
import { getAllTags } from '@data/tags/queries';

export default async function CollectionEditPage({ params }: CollectionEditPageProps) {
  const { locale, id } = await params;
  await requirePermission(locale as Locale, {
    permission: PERMISSION_CODES.ADMIN_COLLECTIONS_WRITE,
  });

  const collection = await getCollectionById(Number(id));
  const availableTags = await getAllTags();

  if (!collection) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <CollectionForm collection={collection} availableTags={availableTags} />
    </div>
  );
}
