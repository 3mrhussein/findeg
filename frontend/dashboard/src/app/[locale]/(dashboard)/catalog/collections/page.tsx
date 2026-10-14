import { CollectionsPageClient } from './_components/CollectionsPageClient';
import { Metadata } from 'next';
import { PERMISSION_CODES } from '@findeg/identity/types';
import { requirePermission } from '@lib/auth-guard';
import type { Locale } from '@findeg/domain';

import { getCollections } from '@data/collections/queries';

export const metadata: Metadata = {
  title: 'Collections Management | FindEg Admin',
  description: 'Manage catalog collections and marketing banners.',
};

/**
 *
 */
export default async function CollectionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePermission(locale as Locale, {
    permission: PERMISSION_CODES.ADMIN_COLLECTIONS_READ,
  });
  const collections = await getCollections();
  const sortedCollections = [...collections].sort((a, b) => a.sortOrder - b.sortOrder);

  return <CollectionsPageClient collections={sortedCollections} />;
}
