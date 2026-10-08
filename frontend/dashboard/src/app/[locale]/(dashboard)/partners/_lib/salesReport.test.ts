import { describe, expect, it } from 'vitest';
import type { StaffPartnerReportView } from '@findeg/backend/features/partner-sales';
import { piastersToEgp } from '@findeg/money';
import { toSalesReportProps } from './salesReport';

const row = (over: Partial<StaffPartnerReportView['sales'][number]> = {}) => ({
  listId: 1,
  listName: 'Grade 1 list',
  listItemId: 2,
  listItemLabel: 'Notebook',
  variantId: 3,
  productName: 'Spiral notebook',
  variantLabel: 'Blue',
  quantity: 2,
  chargedPiasters: 5_005n,
  orderCount: 1,
  ...over,
});

describe('toSalesReportProps', () => {
  it('formats rows exactly and totals every row', () => {
    const props = toSalesReportProps({
      asOf: new Date('2026-05-15T10:00:00Z'),
      months: ['2026-05'],
      month: '2026-05',
      sales: [row(), row({ variantId: 4, quantity: 1, chargedPiasters: 95n, orderCount: 2 })],
    });
    expect(props.sales.map((r) => [r.key, r.egp, r.orderCount])).toEqual([
      ['0-1-2-3', '50.05', 1],
      ['1-1-2-4', '0.95', 2],
    ]);
    expect(props.total).toEqual({ quantity: 3, egp: '51.00' });
    expect(props.asOf).toBe('2026-05-15T10:00:00.000Z');
  });

  it('formats piasters without floating point', () => {
    expect(piastersToEgp(1_234_567_890_123n)).toBe('12345678901.23');
  });
});
