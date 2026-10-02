import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
  afterEach(() => window.localStorage.clear());

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

  it('flags a stored line whose variant is no longer eligible and keeps checkout disabled', async () => {
    const l = list({
      items: [{ ...list().items[0], exactItem: false, eligibleVariants: [] }],
    });
    window.localStorage.setItem(
      `findeg:list-selection:${l.publicCode}`,
      JSON.stringify({ v: 1, lines: [{ listItemId: 7, variantId: 999, quantity: 2 }] }),
    );
    render(<SupplyListView list={l} locale="en" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('UnavailableChooseAgain');
    expect(screen.getByRole('button', { name: 'Checkout' })).toBeDisabled();
  });

  it('does not flag a switched-off optional line with a stale variant until it is turned on', async () => {
    const l = list({
      items: [{ ...list().items[0], required: false, exactItem: false, eligibleVariants: [] }],
    });
    window.localStorage.setItem(
      `findeg:list-selection:${l.publicCode}`,
      JSON.stringify({ v: 1, lines: [{ listItemId: 7, variantId: 999, quantity: 0 }] }),
    );
    render(<SupplyListView list={l} locale="en" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(await screen.findByRole('alert')).toHaveTextContent('UnavailableChooseAgain');
  });

  it('keeps the stored quantity while the quantity field is emptied mid-edit', () => {
    render(<SupplyListView list={list()} locale="en" />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    expect(input).toHaveValue(3);
  });

  it('offers Change on non-Exact items only, with out-of-stock options disabled', () => {
    const base = list().items[0];
    const l = list({
      items: [
        { ...base, id: 1, exactItem: true },
        {
          ...base,
          id: 2,
          exactItem: false,
          eligibleVariants: [
            { ...variant, differingAttributes: {} },
            {
              ...variant,
              variantId: 2,
              price: '12.50',
              inStock: false,
              differingAttributes: { colour: 'red' },
            },
          ],
        },
      ],
    });
    render(<SupplyListView list={l} locale="en" />);
    const change = screen.getAllByRole('button', { name: 'Change' });
    expect(change).toHaveLength(1);
    fireEvent.click(change[0]);
    expect(screen.getByRole('button', { name: /12\.50 \(\+2\.50\)/ })).toBeDisabled();
    expect(screen.getByText('colour: red')).toBeInTheDocument();
  });

  it('uses Arabic names when the locale is ar', () => {
    render(<SupplyListView list={list()} locale="ar" />);
    expect(screen.getByText('قلم أزرق')).toBeInTheDocument();
  });

  describe('List Completeness', () => {
    const twoItems = () => {
      const base = list().items[0];
      return list({
        items: [
          { ...base, id: 1, label: { en: 'Pen' } },
          { ...base, id: 2, label: { en: 'Ruler' }, required: false, quantity: 1 },
        ],
      });
    };

    it('shows the progress count over required items, with none missing at the defaults', async () => {
      render(<SupplyListView list={twoItems()} locale="en" />);
      expect(await screen.findByText('Progress:{"completed":1,"total":1}')).toBeInTheDocument();
      expect(screen.queryByRole('list', { name: 'MissingItems' })).not.toBeInTheDocument();
    });

    it('updates as the selection changes and lists the missing items', async () => {
      render(<SupplyListView list={twoItems()} locale="en" />);
      fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '1' } });
      expect(await screen.findByText('Progress:{"completed":0,"total":1}')).toBeInTheDocument();
      expect(screen.getByRole('list', { name: 'MissingItems' })).toHaveTextContent('Pen');
      fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '3' } });
      expect(await screen.findByText('Progress:{"completed":1,"total":1}')).toBeInTheDocument();
    });

    it('does not block checkout when the list is incomplete', async () => {
      render(<SupplyListView list={twoItems()} locale="en" />);
      fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '1' } });
      expect(await screen.findByText('Progress:{"completed":0,"total":1}')).toBeInTheDocument();
      expect(screen.queryByText('CheckoutBlockedByUnavailable')).not.toBeInTheDocument();
    });

    it('is not shown on an archived, view-only list', () => {
      render(<SupplyListView list={{ ...twoItems(), status: 'archived' }} locale="en" />);
      expect(screen.queryByText(/^Progress:/)).not.toBeInTheDocument();
    });

    it('is not shown when the list has no required items', () => {
      const l = list({ items: [{ ...list().items[0], required: false }] });
      render(<SupplyListView list={l} locale="en" />);
      expect(screen.queryByText(/^Progress:/)).not.toBeInTheDocument();
    });
  });
});
