import { getAllTagsGrouped } from '@data/resources/queries';
import { TagsClient } from './_components/TagsClient';
import { Metadata } from 'next';
import { PERMISSION_CODES } from '@findeg/backend/features/core/schemas';
import { requirePermission } from '@lib/auth-guard';
import type { Locale } from '@findeg/domain';

export const metadata: Metadata = {
  title: 'Tags Management | FindEg Admin',
  description: 'Manage catalog tags and groupings.',
};

export default async function TagsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePermission(locale as Locale, { permission: PERMISSION_CODES.ADMIN_TAGS_READ });
  const groupedTags = await getAllTagsGrouped();

  return (
    <div className="flex-1">
      <TagsClient initialTags={groupedTags} />
    </div>
  );
}
