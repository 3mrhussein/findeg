import { CollectionsPageClient } from './_components/CollectionsPageClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collections Management | FindEg Admin',
  description: 'Manage catalog collections and marketing banners.',
};

/**
 *
 */
export default async function CollectionsPage() {
  // TODO: Replace with data layer query from @data/collections/queries
  const collections: any[] = []; // Stubbed - empty collections list
  const sortedCollections = [...collections].sort((a, b) => a.sortOrder - b.sortOrder);

  return <CollectionsPageClient collections={sortedCollections} />;
}
