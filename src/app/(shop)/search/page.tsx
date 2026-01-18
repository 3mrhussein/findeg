import { Suspense } from 'react';
import SearchTemplate from '@/presentation/components/templates/SearchTemplate';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { q } = await searchParams;
  const query = typeof q === 'string' ? q : '';

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchTemplate searchQuery={query} />
    </Suspense>
  );
}
