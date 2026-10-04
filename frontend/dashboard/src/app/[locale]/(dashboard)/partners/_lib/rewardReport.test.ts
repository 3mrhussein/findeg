import { describe, expect, it } from 'vitest';
import type { StaffRewardReportView } from '@findeg/backend/features/partner-rewards';
import { formatEgp, toRewardReportProps } from './rewardReport';

describe('formatEgp', () => {
  it.each([
    [0n, '0.00'],
    [5n, '0.05'],
    [4_025n, '40.25'],
    [-5n, '-0.05'],
    [-12_000n, '-120.00'],
    [-12_345n, '-123.45'],
  ])('formats %s piasters as %s EGP', (piasters, expected) => {
    expect(formatEgp(piasters)).toBe(expected);
  });
});

const report: StaffRewardReportView = {
  asOf: new Date('2026-05-15T10:00:00Z'),
  months: ['2026-04', '2026-05'],
  statement: {
    month: '2026-05',
    openingEgpPiasters: 4_750n,
    earned: { points: 7n, egpPiasters: 700n },
    reversed: { points: 0n, egpPiasters: 0n },
    adjustmentsEgpPiasters: 400n,
    settledEgpPiasters: 0n,
    closingEgpPiasters: 5_850n,
  },
  pending: { points: 20n, egpPiasters: 2_000n },
  availableBalanceEgpPiasters: -12_000n,
  sales: [
    {
      month: '2026-05',
      listId: 1,
      listName: 'Grade 1 list',
      listItemId: 2,
      listItemLabel: 'Notebook',
      variantId: 3,
      productName: 'Spiral notebook',
      variantLabel: 'Blue',
      earned: { points: 7n, egpPiasters: 700n },
      reversed: { points: 0n, egpPiasters: 0n },
      orderCount: 1,
    },
  ],
  entitlements: [
    {
      id: 9,
      orderId: 4,
      orderReference: 'FE-ABC123',
      listItemId: 2,
      variantId: 3,
      productName: 'Spiral notebook',
      points: 7n,
      egpValuePiasters: 700n,
      events: [
        {
          type: 'paid',
          points: 7n,
          egpValuePiasters: 700n,
          recordedAt: new Date('2026-05-03T10:00:00Z'),
        },
      ],
    },
  ],
  adjustments: [],
  settlements: [],
};

describe('toRewardReportProps', () => {
  it('turns exact piasters and points into display strings without floats', () => {
    const props = toRewardReportProps(report);

    expect(props).toMatchObject({
      month: '2026-05',
      months: ['2026-04', '2026-05'],
      asOf: '2026-05-15T10:00:00.000Z',
      availableBalanceEgp: '-120.00',
      pending: { points: '20', egp: '20.00' },
      statement: {
        openingEgp: '47.50',
        earned: { points: '7', egp: '7.00' },
        adjustmentsEgp: '4.00',
        settledEgp: '0.00',
        closingEgp: '58.50',
      },
    });
    expect(props.sales[0]).toMatchObject({
      listName: 'Grade 1 list',
      earned: { points: '7', egp: '7.00' },
      orderCount: 1,
    });
    expect(props.entitlements[0]).toMatchObject({ orderReference: 'FE-ABC123' });
    expect(props.entitlements[0].events[0]).toMatchObject({ type: 'paid', egp: '7.00' });
  });
});
