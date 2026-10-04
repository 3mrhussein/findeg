import { describe, expect, it } from 'vitest';
import type { PartnerReportView } from '@findeg/backend/features/partner-sales';
import { formatEgp, toPartnerReportProps } from './partnerReport';

const view = (over: Partial<PartnerReportView> = {}): PartnerReportView => ({
  asOf: new Date('2026-05-15T10:00:00Z'),
  months: ['2026-04', '2026-05'],
  month: '2026-05',
  sales: [],
  otherItems: null,
  ...over,
});

describe('formatEgp', () => {
  it.each([
    [0n, '0.00'],
    [5n, '0.05'],
    [12_345n, '123.45'],
  ])('%s → %s', (piasters, text) => expect(formatEgp(piasters)).toBe(text));
});

describe('toPartnerReportProps', () => {
  it('formats rows and totals the shown rows with Other items', () => {
    const props = toPartnerReportProps(
      view({
        sales: [
          {
            listName: 'Grade 1 list',
            listItemLabel: 'Notebook',
            productName: 'Notebook',
            variantLabel: 'Blue',
            quantity: 4,
            chargedPiasters: 10_005n,
          },
        ],
        otherItems: { quantity: 2, chargedPiasters: 5_000n },
      }),
      'en',
    );
    expect(props.sales[0]).toMatchObject({ quantity: 4, egp: '100.05' });
    expect(props.otherItems).toEqual({ quantity: 2, egp: '50.00' });
    expect(props.total).toEqual({ quantity: 6, egp: '150.05' });
  });

  it('labels months in the viewer’s locale', () => {
    const props = toPartnerReportProps(view(), 'en');
    expect(props.monthLabel).toBe('May 2026');
    expect(props.months).toEqual([
      { value: '2026-04', label: 'April 2026' },
      { value: '2026-05', label: 'May 2026' },
    ]);
  });

  it('formats as-of in Cairo time', () => {
    expect(toPartnerReportProps(view(), 'en').asOf).toContain('1:00');
  });
});
