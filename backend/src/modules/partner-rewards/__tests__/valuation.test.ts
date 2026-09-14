import { expect, it } from 'vitest';
import { rewardRateInput, valueRewardLine } from '../public.js';

it('floors points on discounted item value and rounds exact reward valuation to piasters', () => {
  expect(
    valueRewardLine(
      { id: 1, businessPartnerId: 12, pointsPerEgp: '1.250000', egpPerPoint: '0.0125' },
      '10.00',
    ),
  ).toEqual({
    rateId: 1,
    pointsPerEgp: '1.250000',
    egpPerPoint: '0.0125',
    points: 12,
    rewardValue: '0.15',
  });
  expect(
    valueRewardLine(
      { id: 2, businessPartnerId: 12, pointsPerEgp: '1.000000', egpPerPoint: '0.0150' },
      '1.99',
    )?.rewardValue,
  ).toBe('0.02');
});
it('validates explicit decimal rates without coercion or undocumented defaults', () => {
  expect(rewardRateInput({ key: 'rate-1', pointsPerEgp: '1.25', egpPerPoint: '0.0125' })).toEqual({
    key: 'rate-1',
    pointsPerEgp: '1.250000',
    egpPerPoint: '0.0125',
  });
  for (const pointsPerEgp of [undefined, 1, '-1', '0', '1e2', '1.0000001']) {
    expect(rewardRateInput({ key: 'rate-1', pointsPerEgp, egpPerPoint: '0.01' })).toBeUndefined();
  }
  expect(
    valueRewardLine(
      { id: 1, businessPartnerId: 12, pointsPerEgp: '9999999999.000000', egpPerPoint: '1.0000' },
      '100.00',
    ),
  ).toBeUndefined();
});
