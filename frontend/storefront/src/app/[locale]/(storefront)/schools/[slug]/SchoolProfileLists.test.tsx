import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SchoolProfileList } from '@findeg/backend/features/school';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => ({ noListYet: 'No list published yet' })[key] ?? key,
}));
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { SchoolProfileLists } from './SchoolProfileLists';

const list = (over: Partial<SchoolProfileList> = {}): SchoolProfileList => ({
  grade: 'Grade 1',
  academicYear: '2026/2027',
  localizedTitle: { en: 'Grade 1 supplies', ar: 'أدوات الصف الأول' },
  localizedDescription: null,
  heroImageUrl: null,
  publicCode: 'a'.repeat(32),
  ...over,
});

describe('SchoolProfileLists', () => {
  it('links each published list to /lists/<publicCode>', () => {
    render(
      <SchoolProfileLists
        locale="en"
        lists={[
          list(),
          list({
            grade: 'Grade 2',
            localizedTitle: { en: 'Second year kit' },
            publicCode: 'b'.repeat(32),
          }),
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: /Grade 1/ })).toHaveAttribute(
      'href',
      `/lists/${'a'.repeat(32)}`,
    );
    expect(screen.getByRole('link', { name: /Second year kit/ })).toHaveAttribute(
      'href',
      `/lists/${'b'.repeat(32)}`,
    );
  });

  it('shows the Arabic title for the Arabic locale', () => {
    render(<SchoolProfileLists locale="ar" lists={[list()]} />);

    expect(screen.getByText('أدوات الصف الأول')).toBeInTheDocument();
  });

  it('shows an empty state when the school has no published list', () => {
    render(<SchoolProfileLists locale="en" lists={[]} />);

    expect(screen.getByText('No list published yet')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
