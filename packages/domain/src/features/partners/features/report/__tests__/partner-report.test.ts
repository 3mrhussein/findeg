import { describe, expect, it } from 'vitest';
import { money, moneyFromDecimal } from '@findeg/domain';
import {
  PARTNER_REPORT_MIN_ORDERS,
  partnerReportTotals,
  rollUpPartnerReport,
} from '@findeg/domain';

/** A sales row as the read side tallies it: one month × list × list item × variant. */
const row = (name: string, distinctOrders: number, quantity: number, charged: string) => ({
  month: '2026-05',
  name,
  quantity,
  charged: moneyFromDecimal(charged),
  distinctOrders,
});

// Ported from partner-sales' report suppression tests (ADR-0010, PA-14).
describe('Partner Report roll-up', () => {
  it('rolls rows under 3 distinct Orders into Other items', () => {
    expect(PARTNER_REPORT_MIN_ORDERS).toBe(3);
    const report = rollUpPartnerReport([
      row('Popular', 3, 3, '75.00'),
      row('RareA', 2, 6, '150.00'),
      row('RareB', 1, 1, '25.00'),
    ]);
    expect(report.rows.map((shown) => shown.name)).toEqual(['Popular']);
    expect(report.otherItems).toEqual({ quantity: 7, charged: moneyFromDecimal('175.00') });
  });

  it('keeps totals adding up after the roll-up', () => {
    const report = rollUpPartnerReport([
      row('Popular', 4, 9, '201.50'),
      row('RareA', 2, 6, '150.00'),
      row('Steady', 3, 3, '0.99'),
      row('RareB', 1, 1, '12.34'),
    ]);
    expect(partnerReportTotals(report)).toEqual({
      quantity: 19,
      charged: moneyFromDecimal('364.83'),
    });
  });

  it('counts distinct Orders, not lines or units', () => {
    const report = rollUpPartnerReport([row('Bulk', 2, 100, '2500.00')]);
    expect(report.rows).toEqual([]);
    expect(report.otherItems).toEqual({ quantity: 100, charged: moneyFromDecimal('2500.00') });
  });

  it('shows a row with exactly 3 distinct Orders', () => {
    expect(rollUpPartnerReport([row('Edge', 3, 3, '30.00')]).otherItems).toBeNull();
  });

  it('has no Other items when every row is shown', () => {
    const report = rollUpPartnerReport([row('A', 5, 5, '50.00'), row('B', 3, 3, '30.00')]);
    expect(report.rows.map((shown) => shown.name)).toEqual(['A', 'B']);
    expect(report.otherItems).toBeNull();
  });

  it('is empty before any sale', () => {
    const report = rollUpPartnerReport<ReturnType<typeof row>>([]);
    expect(report).toEqual({ rows: [], otherItems: null });
    expect(partnerReportTotals(report)).toEqual({ quantity: 0, charged: money(0n) });
  });

  it('never shows an Order count', () => {
    const report = rollUpPartnerReport([row('Popular', 3, 3, '75.00'), row('Rare', 1, 1, '1.00')]);
    expect(report.rows).toEqual([
      { month: '2026-05', name: 'Popular', quantity: 3, charged: moneyFromDecimal('75.00') },
    ]);
    expect(Object.keys(report.otherItems ?? {})).toEqual(['quantity', 'charged']);
  });
});
