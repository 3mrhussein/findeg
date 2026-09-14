import type { PartnerRewardRate, RewardRateInput, RewardSnapshot } from './contracts.js';

function decimal(value: unknown, digits: number, scale: number): string | undefined {
  if (
    typeof value !== 'string' ||
    !new RegExp(`^(0|[1-9][0-9]{0,${digits - 1}})(\\.[0-9]{1,${scale}})?$`).test(value)
  )
    return;
  const [whole, fraction = ''] = value.split('.');
  return `${whole}.${fraction.padEnd(scale, '0')}`;
}
const units = (value: string) => BigInt(value.replace('.', ''));
export function rewardRateInput(input: unknown): RewardRateInput | undefined {
  if (
    !input ||
    typeof input !== 'object' ||
    !('key' in input) ||
    !('pointsPerEgp' in input) ||
    !('egpPerPoint' in input)
  )
    return;
  if (typeof input.key !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(input.key)) return;
  const pointsPerEgp = decimal(input.pointsPerEgp, 10, 6);
  const egpPerPoint = decimal(input.egpPerPoint, 8, 4);
  if (!pointsPerEgp || !egpPerPoint || units(pointsPerEgp) <= 0n || units(egpPerPoint) <= 0n)
    return;
  return { key: input.key, pointsPerEgp, egpPerPoint };
}

export function valueRewardLine(
  rate: PartnerRewardRate,
  subtotal: string,
): RewardSnapshot | undefined {
  const amount = decimal(subtotal, 16, 2);
  const pointsRate = decimal(rate.pointsPerEgp, 10, 6);
  const conversion = decimal(rate.egpPerPoint, 8, 4);
  if (!amount || !pointsRate || !conversion || units(pointsRate) <= 0n || units(conversion) <= 0n)
    return;
  const points = (units(amount) * units(pointsRate)) / 100_000_000n;
  if (points > 2_147_483_647n) return;
  const piasters = (points * units(conversion) + 50n) / 100n;
  if (piasters > 999_999_999_999_999_999n) return;
  return {
    rateId: rate.id,
    pointsPerEgp: pointsRate,
    egpPerPoint: conversion,
    points: Number(points),
    rewardValue: `${piasters / 100n}.${String(piasters % 100n).padStart(2, '0')}`,
  };
}
