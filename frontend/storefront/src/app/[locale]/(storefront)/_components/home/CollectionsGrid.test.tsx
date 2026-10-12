import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import english from '../../../../../../messages/en.json';
import arabic from '../../../../../../messages/ar.json';

vi.mock('next-intl/server', () => ({
  getTranslations:
    async ({ locale }: { locale: string }) =>
    (key: keyof typeof english.HomeCollections) =>
      (locale === 'ar' ? arabic : english).HomeCollections[key],
}));
vi.mock('@i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock('next/image', () => ({ default: ({ alt }: { alt: string }) => <span>{alt}</span> }));
vi.mock('@/data/catalog/queries', () => ({
  getHomePageData: async () => ({
    collections: [
      {
        id: 1,
        slug: 'school',
        isActive: true,
        localizedTitle: { en: 'School', ar: 'المدرسة' },
        localizedSubtitle: { en: 'English subtitle' },
      },
    ],
  }),
}));
import { CollectionsGrid } from './CollectionsGrid';

describe('CollectionsGrid', () => {
  it('uses Arabic copy when the Arabic subtitle is absent', async () => {
    render(await CollectionsGrid({ locale: 'ar' }));
    expect(screen.getByText(arabic.HomeCollections.Badge)).toBeInTheDocument();
    expect(screen.getByText(arabic.HomeCollections.Subtitle)).toBeInTheDocument();
    expect(screen.getByText(arabic.HomeCollections.Title)).toBeInTheDocument();
    expect(screen.queryByText('English subtitle')).not.toBeInTheDocument();
  });
  it('preserves the localized subtitle when supplied', async () => {
    render(await CollectionsGrid({ locale: 'en' }));
    expect(screen.getByText('English subtitle')).toBeInTheDocument();
  });
});
