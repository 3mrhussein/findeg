import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SalesReportProps } from '../_lib/salesReport';
import { SalesReportPanel } from './SalesReportPanel';

const report = (over: Partial<SalesReportProps> = {}): SalesReportProps => ({
  asOf: '2026-05-15T10:00:00.000Z',
  month: '2026-05',
  months: ['2026-04', '2026-05'],
  sales: [
    {
      key: '0-1-2-3',
      listName: 'Grade 1 list',
      listItemLabel: 'Notebook',
      productName: 'Spiral notebook',
      variantLabel: null,
      quantity: 2,
      egp: '50.05',
      orderCount: 1,
    },
  ],
  total: { quantity: 2, egp: '50.05' },
  ...over,
});

describe('SalesReportPanel', () => {
  it('shows every row unsuppressed, with its Order count and the total', () => {
    render(<SalesReportPanel report={report()} minOrdersPerRow={3} />);
    const panel = screen.getByTestId('sales-report');
    expect(panel.textContent).toContain('Spiral notebook');
    expect(panel.textContent).toContain('—');
    expect(screen.getByTestId('sales-report-total').textContent).toContain('50.05 EGP');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      '2026-04',
      '2026-05',
    ]);
  });

  it('shows the empty state before the first Attributed Order', () => {
    render(<SalesReportPanel report={report({ months: [], sales: [] })} minOrdersPerRow={3} />);
    expect(screen.getByTestId('sales-report-empty')).toBeTruthy();
    expect(screen.queryByTestId('sales-report')).toBeNull();
  });

  it('shows sales figures only', () => {
    render(<SalesReportPanel report={report()} minOrdersPerRow={3} />);
    expect(document.body.textContent).not.toMatch(/balance|statement|settle|payout|points|reward/i);
  });
});
