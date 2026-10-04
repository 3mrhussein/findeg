import { describe, expect, it } from 'vitest';
import { calculateReward, parseRewardRateInput } from '..';

describe('Partner Reward valuation', () => {
  it('floors Partner Points and rounds EGP value half-up to a piaster', () => {
    expect(
      calculateReward({
        chargedLineTotalPiasters: 1_000n,
        pointsPerEgp: '1.250000',
        egpPerPoint: '0.0125',
      }),
    ).toEqual({ points: 12n, egpValuePiasters: 15n });

    expect(
      calculateReward({
        chargedLineTotalPiasters: 199n,
        pointsPerEgp: '1.000000',
        egpPerPoint: '0.0150',
      }),
    ).toEqual({ points: 1n, egpValuePiasters: 2n });
  });

  it('returns zero points for a line below the earning threshold', () => {
    expect(
      calculateReward({
        chargedLineTotalPiasters: 50n,
        pointsPerEgp: '1.000000',
        egpPerPoint: '0.0150',
      }),
    ).toEqual({ points: 0n, egpValuePiasters: 0n });
  });

  it('keeps arithmetic exact beyond the JavaScript safe integer range', () => {
    expect(
      calculateReward({
        chargedLineTotalPiasters: 900_719_925_474_099_300n,
        pointsPerEgp: '1.000000',
        egpPerPoint: '1.0000',
      }),
    ).toEqual({
      points: 9_007_199_254_740_993n,
      egpValuePiasters: 900_719_925_474_099_300n,
    });
  });

  it('accepts only positive, in-range decimal strings at the documented scales', () => {
    expect(parseRewardRateInput({ pointsPerEgp: '1.25', egpPerPoint: '0.0125' })).toEqual({
      pointsPerEgp: '1.250000',
      egpPerPoint: '0.0125',
    });

    for (const pointsPerEgp of [undefined, 1, '-1', '0', '1e2', '1.0000001', '1000000']) {
      expect(parseRewardRateInput({ pointsPerEgp, egpPerPoint: '0.01' })).toBeUndefined();
    }
    for (const egpPerPoint of [undefined, 1, '-1', '0', '1e2', '0.00001', '100000000']) {
      expect(parseRewardRateInput({ pointsPerEgp: '1', egpPerPoint })).toBeUndefined();
    }
  });
});
