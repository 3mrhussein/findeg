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

const amount = { points: '0', egp: '0.00' };
const report = (over: Partial<PartnerReportProps> = {}): PartnerReportProps => ({
  asOf: 'May 15, 2026',
  month: '2026-05',
  months: ['2026-05'],
  statement: {
    openingEgp: '0.00',
    earned: amount,
    reversed: amount,
    adjustmentsEgp: '0.00',
    settledEgp: '0.00',
    closingEgp: '0.00',
  },
  pending: amount,
  availableBalanceEgp: '0.00',
  balanceIsNegative: false,
  sales: [],
  otherItems: null,
  settlements: [],
  ...over,
});

const render_ = (props: PartnerReportProps) =>
  render(<PartnerReportView report={props} minOrdersPerRow={3} />);

describe('PartnerReportView', () => {
  it('shows only the empty state before the first event', () => {
    render_(report({ months: [] }));
    expect(screen.getByText('empty')).toBeTruthy();
    expect(screen.queryByTestId('reward-statement')).toBeNull();
    expect(screen.queryByTestId('sales-table')).toBeNull();
  });

  it('shows the signed balance with the explanation only when negative', () => {
    const { unmount } = render_(
      report({ availableBalanceEgp: '−120.00', balanceIsNegative: true }),
    );
    expect(screen.getByTestId('available-balance').textContent).toContain('−120.00 EGP');
    expect(screen.getByTestId('negative-balance-note')).toBeTruthy();
    unmount();
    render_(report());
    expect(screen.queryByTestId('negative-balance-note')).toBeNull();
  });

  it('marks voided settlements and shows the Other items roll-up', () => {
    render_(
      report({
        settlements: [
          {
            id: 2,
            voided: true,
            voidsReference: null,
            egp: '−10.00',
            transferReference: null,
            paidAt: null,
            recordedAt: 'x',
          },
          {
            id: 1,
            voided: false,
            voidsReference: null,
            egp: '10.00',
            transferReference: 'TRX',
            paidAt: '2026-05-08',
            recordedAt: 'y',
          },
        ],
        otherItems: { earned: { points: '9', egp: '9.00' }, reversed: amount },
      }),
    );
    expect(screen.getAllByTestId('voided-label')).toHaveLength(1);
    expect(screen.getByTestId('other-items-row').textContent).toContain(
      'otherItemsHint:{"count":3}',
    );
  });
});

describe('PartnerReports messages', () => {
  it('has the same keys in English and Arabic, with the negative-balance explanation', () => {
    expect(Object.keys(ar.PartnerReports).sort()).toEqual(Object.keys(en.PartnerReports).sort());
    expect(ar.PartnerReports.negativeBalanceNote).not.toBe(en.PartnerReports.negativeBalanceNote);
    for (const key of Object.keys(en.PartnerReports) as (keyof typeof en.PartnerReports)[]) {
      const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
      expect(placeholders(ar.PartnerReports[key])).toEqual(placeholders(en.PartnerReports[key]));
    }
  });
});
