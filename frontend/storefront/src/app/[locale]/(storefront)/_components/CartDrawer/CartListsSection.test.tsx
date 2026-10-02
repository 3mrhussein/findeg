import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { CartListsSection } from './CartListsSection';

const code = 'a'.repeat(32);

describe('CartListsSection', () => {
  afterEach(() => window.localStorage.clear());

  it('shows nothing when no list is in progress', () => {
    const { container } = render(<CartListsSection />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows nothing for a list that was only visited', () => {
    window.localStorage.setItem(`findeg:list-selection:${code}`, '{"v":1,"lines":[]}');
    const { container } = render(<CartListsSection />);
    expect(container).toBeEmptyDOMElement();
  });

  it('links each index entry to its list', async () => {
    window.localStorage.setItem(
      'findeg:list-selection-index',
      JSON.stringify({
        [code]: {
          title: 'Grade 1 supplies',
          schoolName: 'Nile School',
          updatedAt: '2026-10-02T10:00:00.000Z',
        },
      }),
    );
    render(<CartListsSection />);
    expect(await screen.findByText('YourSchoolLists')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Grade 1 supplies/ })).toHaveAttribute(
      'href',
      `/lists/${code}`,
    );
    expect(screen.getByText('Nile School')).toBeInTheDocument();
  });
});
