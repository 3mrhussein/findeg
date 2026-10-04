import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { RewardReportProps } from '../_lib/rewardReport';
import { RewardStatementPanel } from './RewardStatementPanel';

const zero = { points: '0', egp: '0.00' };

const report: RewardReportProps = {
  asOf: '2026-05-15T10:00:00.000Z',
  month: '2026-05',
  months: ['2026-04', '2026-05'],
  statement: {
    openingEgp: '47.50',
    earned: { points: '7', egp: '7.00' },
    reversed: zero,
    adjustmentsEgp: '4.00',
    settledEgp: '0.00',
    closingEgp: '58.50',
  },
  pending: { points: '20', egp: '20.00' },
  availableBalanceEgp: '58.50',
  sales: [
    {
      key: '1-2-3',
      listName: 'Grade 1 list',
      listItemLabel: 'Notebook',
      productName: 'Spiral notebook',
      variantLabel: 'Blue',
      earned: { points: '7', egp: '7.00' },
      reversed: zero,
      orderCount: 1,
    },
  ],
  entitlements: [
    {
      id: 9,
      orderReference: 'FE-ABC123',
      productName: 'Spiral notebook',
      points: '7',
      egp: '7.00',
      events: [
        { type: 'accepted', points: '7', egp: '7.00', recordedAt: '2026-05-01T10:00:00.000Z' },
        { type: 'paid', points: '7', egp: '7.00', recordedAt: '2026-05-03T10:00:00.000Z' },
      ],
    },
  ],
  adjustments: [
    {
      id: 1,
      egp: '4.00',
      reason: 'goodwill bonus',
      actor: 'staff@findeg.test',
      recordedAt: '2026-05-02T10:00:00.000Z',
    },
  ],
  settlements: [
    {
      id: 5,
      kind: 'void',
      egp: '-20.00',
      transferReference: null,
      paidAt: null,
      notes: null,
      reason: 'wrong school',
      actor: 'staff@findeg.test',
      recordedAt: '2026-04-02T10:00:00.000Z',
    },
    {
      id: 4,
      kind: 'settlement',
      egp: '20.00',
      transferReference: 'TRX-9',
      paidAt: '2026-02-27',
      notes: 'Paid via branch transfer',
      reason: null,
      actor: 'staff@findeg.test',
      recordedAt: '2026-03-05T10:00:00.000Z',
    },
  ],
};

describe('RewardStatementPanel', () => {
  it('shows the month statement with opening, movements, closing and a separate pending figure', () => {
    render(<RewardStatementPanel report={report} />);

    const statement = screen.getByTestId('reward-statement');
    expect(statement).toHaveTextContent('2026-05');
    expect(within(statement).getByText('Opening balance').closest('tr')).toHaveTextContent('47.50');
    expect(within(statement).getByText('Earned').closest('tr')).toHaveTextContent('7.00');
    expect(within(statement).getByText('Adjustments').closest('tr')).toHaveTextContent('4.00');
    expect(within(statement).getByText('Closing balance').closest('tr')).toHaveTextContent('58.50');
    expect(screen.getByTestId('statement-pending')).toHaveTextContent('20');
    expect(screen.getByTestId('available-balance')).toHaveTextContent('58.50 EGP');
  });

  it('offers every month of the picker and preselects the shown one', () => {
    render(<RewardStatementPanel report={report} />);

    const picker = screen.getByLabelText('Month');
    expect(
      within(picker)
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual(['2026-04', '2026-05']);
    expect(picker).toHaveValue('2026-05');
  });

  it('shows a negative balance signed', () => {
    render(<RewardStatementPanel report={{ ...report, availableBalanceEgp: '-120.00' }} />);

    expect(screen.getByTestId('available-balance')).toHaveTextContent('-120.00 EGP');
  });

  it('shows Order References, events, settlement notes, actors and void reasons', () => {
    render(<RewardStatementPanel report={report} />);

    expect(screen.getByTestId('reward-activity')).toHaveTextContent('FE-ABC123');
    expect(screen.getByTestId('reward-activity')).toHaveTextContent('paid');
    expect(screen.getByTestId('reward-adjustments')).toHaveTextContent('goodwill bonus');
    const settlements = screen.getByTestId('reward-settlements');
    expect(settlements).toHaveTextContent('Paid via branch transfer');
    expect(settlements).toHaveTextContent('wrong school');
    expect(settlements).toHaveTextContent('TRX-9');
    expect(settlements).toHaveTextContent('2026-02-27');
    expect(settlements).toHaveTextContent('staff@findeg.test');
  });

  it('lists sales rows with earned and reversed columns', () => {
    render(<RewardStatementPanel report={report} />);

    const sales = screen.getByTestId('reward-sales');
    expect(sales).toHaveTextContent('Grade 1 list');
    expect(sales).toHaveTextContent('Spiral notebook');
    expect(sales).toHaveTextContent('Blue');
  });

  it('shows an empty state before the first Reward Event', () => {
    render(
      <RewardStatementPanel
        report={{
          ...report,
          months: [],
          sales: [],
          entitlements: [],
          settlements: [],
          adjustments: [],
        }}
      />,
    );

    expect(screen.getByText(/No rewards activity yet/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Month')).not.toBeInTheDocument();
  });
});
