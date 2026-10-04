import { describe, expect, it } from 'vitest';
import type { PartnerRewardReportView } from '@findeg/backend/features/partner-rewards';
import { formatEgp, toPartnerReportProps } from './partnerReport';

const zero = { points: 0n, egpPiasters: 0n };
const view = (over: Partial<PartnerRewardReportView> = {}): PartnerRewardReportView => ({
  asOf: new Date('2026-05-15T10:00:00Z'),
  months: ['2026-05'],
  statement: {
    month: '2026-05',
    openingEgpPiasters: 0n,
    earned: zero,
    reversed: zero,
    adjustmentsEgpPiasters: 0n,
    settledEgpPiasters: 0n,
    closingEgpPiasters: 0n,
  },
  pending: zero,
  availableBalanceEgpPiasters: 0n,
  sales: [],
  otherItems: null,
  settlements: [],
  ...over,
});

describe('formatEgp', () => {
  it.each([
    [0n, '0.00'],
    [5n, '0.05'],
    [12_345n, '123.45'],
    [-12_000n, '−120.00'],
    [-1n, '−0.01'],
  ])('%s → %s', (piasters, text) => expect(formatEgp(piasters)).toBe(text));
});

describe('toPartnerReportProps', () => {
  it('flags a negative balance and signs it', () => {
    const props = toPartnerReportProps(view({ availableBalanceEgpPiasters: -12_000n }), 'en');
    expect(props.balanceIsNegative).toBe(true);
    expect(props.availableBalanceEgp).toBe('−120.00');
    expect(toPartnerReportProps(view(), 'en').balanceIsNegative).toBe(false);
  });

  it('marks voids and keeps their amount negative', () => {
    const props = toPartnerReportProps(
      view({
        settlements: [
          {
            id: 2,
            kind: 'void',
            amountPiasters: -1_000n,
            transferReference: null,
            paidAt: null,
            voidsSettlementId: 1,
            recordedAt: new Date('2026-05-10T10:00:00Z'),
          },
        ],
      }),
      'ar',
    );
    expect(props.settlements[0]).toMatchObject({ voided: true, egp: '−10.00' });
  });

  it('formats as-of in Cairo time', () => {
    expect(toPartnerReportProps(view(), 'en').asOf).toContain('1:00');
  });
});
