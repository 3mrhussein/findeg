import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import en from '../../../../../../../messages/en.json';
import ar from '../../../../../../../messages/ar.json';
import type { PartnerReportProps } from '../_lib/partnerReport';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
}));
vi.mock('@findeg/ui', () => {
  const el = (tag: string) =>
    function Mock({ children, ...props }: React.ComponentProps<'div'>) {
      const Tag = tag as 'div';
      return <Tag {...props}>{children}</Tag>;
    };
  return {
    Card: el('section'),
    CardContent: el('div'),
    CardDescription: el('p'),
    CardHeader: el('header'),
    CardTitle: el('h2'),
    Table: el('table'),
    TableBody: el('tbody'),
    TableCell: el('td'),
    TableHead: el('th'),
    TableHeader: el('thead'),
    TableRow: el('tr'),
  };
});

import { PartnerReportView } from './PartnerReportView';

const report = (over: Partial<PartnerReportProps> = {}): PartnerReportProps => ({
  asOf: 'May 15, 2026',
  month: '2026-05',
  monthLabel: 'May 2026',
  months: [{ value: '2026-05', label: 'May 2026' }],
  sales: [],
  otherItems: null,
  total: { quantity: 0, egp: '0.00' },
  ...over,
});

const render_ = (props: PartnerReportProps) =>
  render(<PartnerReportView report={props} minOrdersPerRow={3} />);

describe('PartnerReportView', () => {
  it('shows only the empty state before the first Attributed Order', () => {
    render_(report({ months: [] }));
    expect(screen.getByTestId('partner-report-empty').textContent).toBe('empty');
    expect(screen.queryByTestId('sales-table')).toBeNull();
  });

  it('shows no-sales for a month without orders', () => {
    render_(report());
    expect(screen.getByText('noSales')).toBeTruthy();
    expect(screen.queryByTestId('sales-total-row')).toBeNull();
  });

  it('shows rows, the Other items roll-up and their total', () => {
    render_(
      report({
        sales: [
          {
            key: '0',
            listName: 'Grade 1 list',
            listItemLabel: 'Notebook',
            productName: null,
            variantLabel: 'Blue',
            quantity: 4,
            egp: '100.00',
          },
        ],
        otherItems: { quantity: 2, egp: '50.00' },
        total: { quantity: 6, egp: '150.00' },
      }),
    );
    const table = screen.getByTestId('sales-table');
    expect(table.textContent).toContain('Grade 1 list');
    expect(table.textContent).toContain('unnamed');
    expect(screen.getByTestId('other-items-row').textContent).toContain(
      'otherItemsHint:{"count":3}',
    );
    expect(screen.getByTestId('sales-total-row').textContent).toContain('egp:{"amount":"150.00"}');
  });

  it('shows sales figures only', () => {
    render_(report());
    const text = document.body.textContent ?? '';
    expect(text).not.toMatch(/balance|statement|settlement|payout|points/i);
  });
});

describe('PartnerReports messages', () => {
  it('has the same keys and placeholders in English and Arabic', () => {
    expect(Object.keys(ar.PartnerReports).sort()).toEqual(Object.keys(en.PartnerReports).sort());
    for (const key of Object.keys(en.PartnerReports) as (keyof typeof en.PartnerReports)[]) {
      const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
      expect(placeholders(ar.PartnerReports[key])).toEqual(placeholders(en.PartnerReports[key]));
    }
  });
});
