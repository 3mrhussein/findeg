import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PublicSupplyList } from '@findeg/backend/features/school';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
}));
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { SupplyListView } from './SupplyListView';

const variant = {
  variantId: 1,
  sku: 'PEN-1',
  name: { en: 'Blue pen', ar: 'قلم أزرق' },
  variantLabel: {},
  brand: null,
  price: '10.00',
  inStock: true,
};

const list = (over: Partial<PublicSupplyList> = {}): PublicSupplyList => ({
  publicCode: 'a'.repeat(32),
  status: 'published',
  grade: 'Grade 1',
  academicYear: '2026/2027',
  title: { en: 'Grade 1 supplies', ar: 'أدوات' },
  description: null,
  heroImageUrl: null,
  school: { id: 1, nameEn: 'Nile School', nameAr: 'مدرسة النيل', logoUrl: null },
  replacementPublicCode: null,
  offer: null,
  items: [
    {
      id: 7,
      required: true,
      quantity: 3,
      exactItem: true,
      specification: null,
      label: { en: 'Pen' },
      note: null,
      defaultVariant: variant,
      eligibleVariants: [{ ...variant, differingAttributes: {} }],
    },
  ],
  ...over,
});

describe('SupplyListView', () => {
  it('shows each item at its default, with a disabled checkout button', () => {
    render(<SupplyListView list={list()} locale="en" />);
    expect(screen.getByText('Blue pen')).toBeInTheDocument();
    expect(screen.getByText('Pen')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Checkout' })).toBeDisabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('links an archived list to its replacement and keeps checkout unavailable', () => {
    const code = 'b'.repeat(32);
    render(
      <SupplyListView
        list={list({ status: 'archived', replacementPublicCode: code })}
        locale="en"
      />,
    );
    expect(screen.getByRole('link', { name: 'ViewReplacement' })).toHaveAttribute(
      'href',
      `/lists/${code}`,
    );
    expect(screen.getByText('CheckoutArchived')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Checkout' })).toBeDisabled();
  });

  it('says an archived list is no longer current when it has no replacement', () => {
    render(<SupplyListView list={list({ status: 'archived' })} locale="en" />);
    expect(screen.getByText('NoReplacement')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('uses Arabic names when the locale is ar', () => {
    render(<SupplyListView list={list()} locale="ar" />);
    expect(screen.getByText('قلم أزرق')).toBeInTheDocument();
  });
});
